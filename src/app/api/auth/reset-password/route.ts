import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    
    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: 'Email, OTP, and new password are required' }, { status: 400 });
    }

    const inputId = email.trim().toLowerCase();

    // Find the latest valid OTP for this identifier
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: inputId,
        token: otp,
        expires: { gt: new Date() } // not expired
      },
      orderBy: { expires: 'desc' }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Find the user
    const users = await prisma.user.findMany();
    const userMatch = users.find((u: any) => u.email?.trim().toLowerCase() === inputId);

    if (!userMatch) {
      return NextResponse.json({ error: 'User account not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userMatch.id },
      data: { password: hashedPassword }
    });

    // Delete the token
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: tokenRecord.identifier
      }
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });

  } catch (error: any) {
    console.error('Reset Password Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
