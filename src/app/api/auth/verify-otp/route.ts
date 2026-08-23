import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_procgen';

export async function POST(req: Request) {
  try {
    const { identifier, otp } = await req.json();
    
    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 });
    }

    // Find the latest valid OTP for this identifier
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier,
        token: otp,
        expires: { gt: new Date() } // not expired
      },
      orderBy: { expires: 'desc' }
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 401 });
    }

    // Optional: Delete the token so it can't be reused
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: tokenRecord.identifier,
          token: tokenRecord.token
        }
      }
    });

    // Determine Role
    let role = 'client';
    if (identifier.includes('admin')) role = 'admin';
    if (identifier.includes('vendor')) role = 'vendor';

    // Generate JWT
    const payload = {
      identifier,
      role,
      loginTime: Date.now()
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-Only Cookie
    const res = NextResponse.json({ success: true, role });
    res.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return res;

  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
