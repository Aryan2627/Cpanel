import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev';

export const ONBOARDING_VALIDITY_DAYS = 15;
export const INCOMPLETE_STATUSES = ['Invited', 'Pending Onboarding', 'Onboarding in Progress'];

export async function purgeExpiredVendors() {
  const cutoff = new Date(Date.now() - ONBOARDING_VALIDITY_DAYS * 24 * 60 * 60 * 1000);
  try {
    const expiredVendors = await prisma.vendor.findMany({
      where: {
        createdAt: { lt: cutoff },
        status: { in: INCOMPLETE_STATUSES }
      },
      select: { id: true, email: true, phone: true }
    });

    if (expiredVendors.length > 0) {
      const expiredIds = expiredVendors.map(v => v.id);
      const expiredIdentifiers = expiredVendors
        .flatMap(v => [v.email, v.phone])
        .filter(Boolean) as string[];

      if (expiredIdentifiers.length > 0) {
        await prisma.verificationToken.deleteMany({
          where: { identifier: { in: expiredIdentifiers } }
        });
      }

      await prisma.vendor.deleteMany({
        where: { id: { in: expiredIds } }
      });
      console.log(`[purgeExpiredVendors] Purged ${expiredVendors.length} expired incomplete vendors.`);
    }
  } catch (err) {
    console.error('[purgeExpiredVendors] Error cleaning up expired vendors:', err);
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

let testAccount: nodemailer.TestAccount | null = null;
async function getEmailTransporter() {
  // FORCE ETHEREAL FOR UAT
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
  }
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const data = await request.json();
    const { action, otp } = data;

    // Handle 'me' session inspection
    if (action === 'me') {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }
      const token = authHeader.split(' ')[1];
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders });
      }

      await purgeExpiredVendors();

      const v = await prisma.vendor.findUnique({ where: { id: decoded.id } });
      if (!v) {
        return NextResponse.json({ error: 'Vendor account not found or 15-day validity has expired.' }, { status: 404, headers: corsHeaders });
      }
      return NextResponse.json({
        vendor: {
          ...v,
          hasPassword: Boolean(v.password)
        }
      }, { status: 200, headers: corsHeaders });
    }

    const identifier = (data.email || data.identifier || '').trim();
    if (!identifier) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400, headers: corsHeaders });
    }

    // Always purge expired vendors older than 15 days before performing any auth checks
    await purgeExpiredVendors();

    const isEmail = identifier.includes('@');

    // Find the vendor
    const vendors = await prisma.vendor.findMany();
    const matchingVendors = vendors.filter(v => {
      if (isEmail) {
        return v.email?.trim().toLowerCase() === identifier.toLowerCase();
      } else {
        return v.phone?.replace(/\D/g, '') === identifier.replace(/\D/g, '');
      }
    });

    const onboardingStatuses = ['Onboarding in Progress', 'Pending Onboarding', 'Approval Pending', 'Pending Review'];
    const vendor = matchingVendors.find(v => onboardingStatuses.includes(v.status || '')) ?? matchingVendors[0];

    // Check account status
    if (action === 'check_account') {
      if (!vendor) {
        return NextResponse.json({
          exists: false,
          error: 'No supplier account found with this email or phone. Please contact your buyer to receive an invitation.'
        }, { status: 404, headers: corsHeaders });
      }

      return NextResponse.json({
        exists: true,
        hasPassword: Boolean(vendor.password),
        vendor: {
          id: vendor.id,
          name: vendor.name,
          email: vendor.email,
          phone: vendor.phone,
          status: vendor.status,
          hasPassword: Boolean(vendor.password),
          createdAt: vendor.createdAt
        }
      }, { status: 200, headers: corsHeaders });
    }

    if (!vendor) {
      console.log(`[vendor-auth] Vendor not found for: ${identifier}`);
      return NextResponse.json({ 
        error: 'No supplier account found with this email or phone. Please contact your buyer to receive an invitation.' 
      }, { status: 404, headers: corsHeaders });
    }

    if (action === 'request') {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

      await prisma.verificationToken.create({
        data: {
          identifier: identifier,
          token: generatedOtp,
          expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        },
      });

      let previewUrl = null;

      if (isEmail) {
        const transporter = await getEmailTransporter();
        const fromAddress = process.env.SMTP_FROM_EMAIL || '"ProcGen Auth" <auth@procgen.com>';

        const info = await transporter.sendMail({
          from: fromAddress,
          to: identifier,
          subject: 'Your VendorPortal Login Code',
          text: `Your login code is ${generatedOtp}. It expires in 10 minutes.`,
          html: `<b>Your login code is ${generatedOtp}</b><br>It expires in 10 minutes.`
        });

        previewUrl = nodemailer.getTestMessageUrl(info);
      } else {
        // Send SMS via Twilio
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
          const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await client.messages.create({
            body: `Your VendorPortal login code is ${generatedOtp}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: identifier
          });
        } else {
          console.log(`[DEV MODE SMS] To: ${identifier}, OTP: ${generatedOtp}`);
          previewUrl = `sms-mock://${generatedOtp}`;
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'OTP sent successfully',
        hasPassword: Boolean(vendor.password),
        previewUrl: previewUrl || null 
      }, { headers: corsHeaders });
    } 
    else if (action === 'verify') {
      if (!otp) {
        return NextResponse.json({ error: 'OTP is required' }, { status: 400, headers: corsHeaders });
      }

      const tokenRecord = await prisma.verificationToken.findFirst({
        where: {
          identifier: identifier,
          token: otp,
          expires: { gt: new Date() }
        },
        orderBy: { expires: 'desc' }
      });

      if (!tokenRecord) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401, headers: corsHeaders });
      }

      // Cleanup token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: tokenRecord.identifier,
            token: tokenRecord.token
          }
        }
      });

      const token = jwt.sign(
        { id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name, status: vendor.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      const hasPassword = Boolean(vendor.password);

      return NextResponse.json({ 
        vendor: {
          ...vendor,
          hasPassword
        }, 
        hasPassword,
        token 
      }, { status: 200, headers: corsHeaders });
    }
    else if (action === 'set_password') {
      const { password } = data;
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400, headers: corsHeaders });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const updatedVendor = await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          password: hashedPassword,
          status: vendor.status === 'Invited' ? 'Onboarding in Progress' : vendor.status
        }
      });

      const token = jwt.sign(
        { id: updatedVendor.id, email: updatedVendor.email, phone: updatedVendor.phone, name: updatedVendor.name, status: updatedVendor.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        success: true,
        message: 'Password created successfully',
        vendor: {
          ...updatedVendor,
          hasPassword: true
        },
        hasPassword: true,
        token
      }, { status: 200, headers: corsHeaders });
    }
    else if (action === 'reset_password') {
      const { otp, newPassword } = data;
      if (!otp || !newPassword) {
        return NextResponse.json({ error: 'OTP and new password are required' }, { status: 400, headers: corsHeaders });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400, headers: corsHeaders });
      }

      const validToken = await prisma.verificationToken.findFirst({
        where: {
          identifier: identifier,
          token: otp,
          expires: { gt: new Date() }
        },
        orderBy: { expires: 'desc' }
      });

      if (!validToken) {
        return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401, headers: corsHeaders });
      }

      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      const updated = await prisma.vendor.update({
        where: { id: vendor.id },
        data: { password: hashedPassword }
      });

      await prisma.verificationToken.deleteMany({
        where: { identifier: identifier }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Password updated successfully',
        vendor: {
          ...updated,
          hasPassword: true
        }
      }, { status: 200, headers: corsHeaders });
    }
    else if (action === 'password_login') {
      const { password } = data;
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400, headers: corsHeaders });
      }

      if (!vendor.password) {
        return NextResponse.json({ 
          error: 'No password has been set for this account yet. Please create your password below to proceed to onboarding.',
          hasPassword: false,
          needsPasswordSetup: true
        }, { status: 400, headers: corsHeaders });
      }

      const isMatch = bcrypt.compareSync(password, vendor.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401, headers: corsHeaders });
      }

      const token = jwt.sign(
        { id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name, status: vendor.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({ 
        vendor: {
          ...vendor,
          hasPassword: true
        }, 
        token 
      }, { status: 200, headers: corsHeaders });
    }
    else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders });
    }
  } catch (error: any) {
    console.error('[vendor-auth] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
