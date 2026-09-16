import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { verifyToken, signToken } from '../../../../lib/session';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    
    const cookieStore = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join('=').trim()])
    );

    const tokenStr = cookieStore['proc-session'];
    if (!tokenStr) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyToken(tokenStr);
    if (!payload || !payload.impersonatorId) {
      return NextResponse.json({ error: 'Not currently impersonating anyone' }, { status: 400 });
    }

    // Fetch the original admin user
    const adminUser = await prisma.user.findUnique({ where: { id: payload.impersonatorId as string } });
    if (!adminUser) {
      return NextResponse.json({ error: 'Original admin account not found' }, { status: 404 });
    }

    // Restore the original admin token
    const newToken = await signToken({
      email: adminUser.email,
      role: adminUser.role || 'Admin',
      organizationId: adminUser.organizationId
    });

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('proc-session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Unimpersonation failed' }, { status: 500 });
  }
}
