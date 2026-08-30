import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/session';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join('=').trim()])
    );

    const tokenStr = cookies['proc-session'];
    if (!tokenStr) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(tokenStr);
    if (!payload || !payload.email) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ 
      where: { email: payload.email as string },
      include: { organization: true }
    });
    
    if (user) {
      return NextResponse.json({ 
        name: user.name || user.email, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId,
        companyName: user.organization?.name || 'My Organization',
        licenseStatus: user.organization?.licenseStatus || 'Active',
        licensePlan: user.organization?.licensePlan || 'Enterprise',
        licenseExpiry: user.organization?.licenseExpiry || null
      });
    }

    return NextResponse.json({ name: payload.email, email: payload.email, role: payload.role });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
