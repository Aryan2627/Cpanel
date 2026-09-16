import { NextResponse } from 'next/server';
import { headers, cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { verifyToken, signToken } from '../../../../lib/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { targetUserId } = await req.json();
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    
    const cookieStore = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join('=').trim()])
    );

    const tokenStr = cookieStore['proc-session'];
    if (!tokenStr) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(tokenStr);
    if (!payload || !payload.email) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    // Ensure the CURRENT user is an Admin OR already impersonating (though nested impersonation is messy, we'll block it for now)
    if (payload.impersonatorId) {
       return NextResponse.json({ error: 'Cannot impersonate while already impersonating' }, { status: 403 });
    }

    const adminUser = await prisma.user.findUnique({ where: { email: payload.email as string } });
    if (!adminUser || adminUser.role !== 'Admin') {
      return NextResponse.json({ error: 'Only Admins can impersonate users' }, { status: 403 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }
    if (targetUser.role === 'Admin') {
      return NextResponse.json({ error: 'Cannot impersonate another Admin' }, { status: 403 });
    }

    // Generate new token for target user, embedding the impersonator ID
    const newToken = await signToken({
      email: targetUser.email,
      role: targetUser.role || 'Standard',
      organizationId: targetUser.organizationId,
      impersonatorId: adminUser.id,
      impersonatorEmail: adminUser.email
    });

    const response = NextResponse.json({ success: true });
    
    // Set the new session cookie
    response.cookies.set('proc-session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Impersonation failed' }, { status: 500 });
  }
}
