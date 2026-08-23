import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Helper to get or create a reusable test account for Ethereal
let testAccount: nodemailer.TestAccount | null = null;
async function getEmailTransporter() {
  if (!testAccount) {
    testAccount = await nodemailer.createTestAccount();
  }
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { identifier } = await req.json();
    if (!identifier) {
      return NextResponse.json({ error: 'Email/Identifier is required' }, { status: 400 });
    }

    // Usually we would check if the user exists in our DB:
    // const user = await prisma.user.findUnique({ where: { email: identifier } });
    // const vendor = await prisma.vendor.findFirst({ where: { email: identifier } });
    // if (!user && !vendor) return error;
    // But for demo purposes, we will allow any email to request an OTP and just assign a role based on the email domain or string.

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Database
    await prisma.verificationToken.create({
      data: {
        identifier,
        token: otp,
        expires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });

    // Send email
    const transporter = await getEmailTransporter();
    const info = await transporter.sendMail({
      from: '"ProcGen Auth" <auth@procgen.com>',
      to: identifier,
      subject: 'Your ProcGen Login Code',
      text: `Your login code is ${otp}. It expires in 10 minutes.`,
      html: `<b>Your login code is ${otp}</b><br>It expires in 10 minutes.`
    });

    // Log the Ethereal URL so the user can easily see the email during testing
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully',
      previewUrl: nodemailer.getTestMessageUrl(info) // Send to frontend just for demo convenience
    });

  } catch (error: any) {
    console.error('Request OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
