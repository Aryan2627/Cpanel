import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Helper to get transporter - uses real SMTP if configured, otherwise falls back to Ethereal for testing
let testAccount: nodemailer.TestAccount | null = null;
async function getEmailTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    // Use real SMTP provider (e.g., Gmail, SendGrid, Resend)
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
    // Fallback to Ethereal if no real SMTP is configured
    console.warn("Using Ethereal fallback. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env for real emails.");
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

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json({ error: 'Email/Phone is required' }, { status: 400 });
    }

    const inputId = identifier.trim();
    const isEmail = inputId.includes('@');

    // STRICT CHECK: The email or phone MUST exist in the User or Vendor table
    const users = await prisma.user.findMany();
    const vendors = await prisma.vendor.findMany();
    
    let userMatch = null;
    let vendorMatch = null;

    if (isEmail) {
      const emailToSearch = inputId.toLowerCase();
      userMatch = users.find(u => u.email?.trim().toLowerCase() === emailToSearch);
      vendorMatch = vendors.find(v => v.email?.trim().toLowerCase() === emailToSearch);
    } else {
      const phoneToSearch = inputId.replace(/\D/g, '');
      userMatch = users.find(u => u.phone?.replace(/\D/g, '') === phoneToSearch);
      vendorMatch = vendors.find(v => v.phone?.replace(/\D/g, '') === phoneToSearch);
    }

    if (!userMatch && !vendorMatch) {
      // Reject if the identifier isn't registered in the system
      return NextResponse.json({ error: 'Account not found. Please contact your administrator.' }, { status: 404 });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Database
    await prisma.verificationToken.create({
      data: {
        identifier: inputId,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    let previewUrl = null;

    if (isEmail) {
      // Send email
      const transporter = await getEmailTransporter();
      const fromAddress = process.env.SMTP_FROM_EMAIL || '"ProcGen Auth" <auth@procgen.com>';

      const info = await transporter.sendMail({
        from: fromAddress,
        to: inputId,
        subject: 'Your ProcGen Login Code',
        text: \Your login code is \. It expires in 10 minutes.\,
        html: \
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #1e3a8a; margin-top: 0;">ProcGen Authentication</h2>
            <p>You requested to sign in to ProcGen.</p>
            <p>Your 6-digit login code is:</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #3b82f6; margin: 20px 0;">
              \
            </div>
            <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        \
      });
      previewUrl = nodemailer.getTestMessageUrl(info);
    } else {
      // Send SMS via Twilio
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: \Your ProcGen login code is \\,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: inputId
        });
      } else {
        console.log(\[DEV MODE SMS] To: \, OTP: \\);
        previewUrl = \sms-mock://\\;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      previewUrl: previewUrl || null 
    });

  } catch (error: any) {
    console.error('Request OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
