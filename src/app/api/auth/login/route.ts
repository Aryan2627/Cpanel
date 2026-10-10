/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It serves as a backend API endpoint, handling data transactions securely.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '../../../../lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    // Extract client metadata for security auditing
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';
    const userAgent = req.headers.get('user-agent') || 'unknown_device';

    // 1. Fetch User and check Account Lockout in parallel to cut DB latency in half
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const [recentFails, user] = await Promise.all([
      prisma.loginActivity.count({
        where: {
          identifier: email,
          success: false,
          createdAt: { gte: fifteenMinsAgo }
        }
      }),
      prisma.user.findUnique({ where: { email } })
    ]);

    if (recentFails >= 5) {
      return NextResponse.json({ 
        error: 'Account temporarily locked due to multiple failed attempts. Please try again in 15 minutes or reset your password.' 
      }, { status: 429 });
    }


    if (!user || !user.password) {
      // Log failed attempt in background
      await prisma.loginActivity.create({ data: { identifier: email, success: false, ip, userAgent, city: 'Unknown' } });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      // Log failed attempt in background
      await prisma.loginActivity.create({ data: { identifier: email, success: false, ip, userAgent, city: 'Unknown' } });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // 2. Successful Login - Log the successful audit
    try {
      await prisma.loginActivity.create({
        data: { identifier: email, success: true, ip, userAgent, city: 'Unknown' }
      });
    } catch(e) {}

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
      secure: false, // FORCED FALSE TO FIX REDIRECT LOOP
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error("Login Security Error:", err);
    return NextResponse.json({ error: 'Internal Server Error: ' + (err.message || String(err)) }, { status: 500 });
  }
}
