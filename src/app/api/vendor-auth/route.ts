import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev';

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
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465, 
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    if (!testAccount) {
      testAccount = await nodemailer.createTestAccount();
    }
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { action, otp } = data;
    const identifier = (data.email || data.identifier || '').trim();
    
    if (!identifier) {
      return NextResponse.json({ error: 'Email or Phone is required' }, { status: 400, headers: corsHeaders });
    }

    const isEmail = identifier.includes('@');

    // Try to find the vendor
    const vendors = await prisma.vendor.findMany();
    const vendor = vendors.find(v => {
      if (isEmail) {
        return v.email?.trim().toLowerCase() === identifier.toLowerCase();
      } else {
        return v.phone?.replace(/\D/g, '') === identifier.replace(/\D/g, '');
      }
    });

    if (!vendor) {
      console.log(`[vendor-auth] Vendor not found for: ${identifier}`);
      return NextResponse.json({ error: 'Vendor not found with that email or phone' }, { status: 404, headers: corsHeaders });
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

      return NextResponse.json({ vendor, token }, { status: 200, headers: corsHeaders });
    }
    else if (action === 'password_login') {
      const { password } = data;
      if (!password) {
        return NextResponse.json({ error: 'Password is required' }, { status: 400, headers: corsHeaders });
      }

      if (vendor.status !== 'Onboarding in Progress') {
        return NextResponse.json({ error: 'Password login is only available for vendors onboarding in progress.' }, { status: 403, headers: corsHeaders });
      }

      const expectedPassword = vendor.email.substring(0, 3).toLowerCase() + '@26';
      
      if (password !== expectedPassword) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401, headers: corsHeaders });
      }

      const token = jwt.sign(
        { id: vendor.id, email: vendor.email, phone: vendor.phone, name: vendor.name, status: vendor.status },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return NextResponse.json({ vendor, token }, { status: 200, headers: corsHeaders });
    }
 
    else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400, headers: corsHeaders });
    }
  } catch (error: any) {
    console.error('[vendor-auth] error:', error);
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
