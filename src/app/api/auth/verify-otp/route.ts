import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { logLoginActivity, logAudit } from '../../../../lib/audit';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_procgen';

export async function POST(req: Request) {
  try {
    const { identifier, otp } = await req.json();
    
    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Identifier and OTP are required' }, { status: 400 });
    }

    const inputId = identifier.trim();

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

    // Optional: Delete the token so it can't be reused
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: tokenRecord.identifier,
          token: tokenRecord.token
        }
      }
    });

    const isEmail = inputId.includes('@');

    // Check Database for actual role
    let role = 'client';
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

    if (userMatch) {
      // Determine if the internal user is Admin or regular Client
      role = userMatch.role?.toLowerCase() === 'admin' ? 'admin' : 'client';
    } else if (vendorMatch) {
      role = 'vendor';
    } else {
      // Should theoretically never hit this due to request-otp check, but safe fallback
      return NextResponse.json({ error: 'Account record not found' }, { status: 404 });
    }

    // Generate JWT
    const payload = {
      identifier: inputId,
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

    // Log login activity and audit trail (fire-and-forget)
    void logLoginActivity({ identifier: inputId, success: true });
    void logAudit({ actorEmail: inputId, action: 'LOGIN', entityType: 'User', entityRef: inputId });

    return res;

  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
