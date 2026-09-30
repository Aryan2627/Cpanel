import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Extract client metadata for security auditing
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    const userAgent = req.headers.get('user-agent') || 'unknown_device';

    // 1. Database-Backed Account Lockout Protection (Max 5 attempts / 15 mins)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentFails = await prisma.loginActivity.count({
      where: {
        identifier: email,
        success: false,
        createdAt: { gte: fifteenMinsAgo }
      }
    });

    if (recentFails >= 5) {
      return NextResponse.json({ 
        error: 'Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes or reset your password.' 
      }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      // Log failed attempt (user not found)
      await prisma.loginActivity.create({
        data: { identifier: email, success: false, ip, userAgent, city: 'Unknown' }
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Log failed attempt (wrong password)
      await prisma.loginActivity.create({
        data: { identifier: email, success: false, ip, userAgent, city: 'Unknown' }
      });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 2. Successful Login - Log the successful audit
    await prisma.loginActivity.create({
      data: { identifier: email, success: true, ip, userAgent, city: 'Unknown' }
    });

    const token = await signToken({
      userId: user.id,
      email: user.email || '',
      organizationId: user.organizationId || '',
      role: user.role,
    });

    const response = NextResponse.json({ 
      success: true, 
      organizationId: user.organizationId,
      role: user.role,
      token: token 
    });

    response.cookies.set('proc-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict', // Upgraded from 'lax' to 'strict' for extra CSRF protection
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error("Login Security Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
