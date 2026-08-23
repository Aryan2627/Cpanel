import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { logLoginActivity, logAudit } from '../../../../../lib/audit';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_procgen';

// Step 2: Google redirects here with a `code`. Exchange it for user info.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const baseUrl = process.env.NEXTAUTH_URL || 'https://cpanel-swart.vercel.app';

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=no_code`);
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/login?error=token_exchange_failed`);
    }

    // Get user info from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userInfoRes.json();
    const email = googleUser.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.redirect(`${baseUrl}/login?error=no_email`);
    }

    // STRICT CHECK: Email must exist in our database
    const users = await prisma.user.findMany();
    const vendors = await prisma.vendor.findMany();
    const userMatch = users.find(u => u.email?.trim().toLowerCase() === email);
    const vendorMatch = vendors.find(v => v.email?.trim().toLowerCase() === email);

    if (!userMatch && !vendorMatch) {
      return NextResponse.redirect(`${baseUrl}/login?error=account_not_found`);
    }

    // Determine role
    let role = 'client';
    if (userMatch) {
      role = userMatch.role?.toLowerCase() === 'admin' ? 'admin' : 'client';
    } else if (vendorMatch) {
      role = 'vendor';
    }

    // Issue our own JWT — same as OTP login
    const token = jwt.sign({ identifier: email, role, loginTime: Date.now() }, JWT_SECRET, { expiresIn: '7d' });

    // Log activity
    void logLoginActivity({ identifier: email, success: true });
    void logAudit({ actorEmail: email, action: 'LOGIN', entityType: 'User', entityRef: `${email} (Google SSO)` });

    // Check if request came from supplier portal
    const state = searchParams.get('state');
    if (state === 'vendor') {
      const vendorUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://csupplier.vercel.app'; // Modify prod URL here if needed
      return NextResponse.redirect(`${vendorUrl}/login?vendor_token=${token}`);
    }

    // Otherwise, standard Cpanel login
    const destination = role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/client/intake';
    const res = NextResponse.redirect(`${baseUrl}${destination}`);
    res.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return res;

  } catch (err: any) {
    console.error('[google-callback] Error:', err);
    return NextResponse.redirect(`${baseUrl}/login?error=server_error`);
  }
}
