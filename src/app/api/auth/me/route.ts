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
import { headers, cookies } from 'next/headers';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/session';
import { decrypt } from '../../../../lib/encryption';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
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
      // Dynamic license expiration check
      const isExpired = user.organization?.licenseEnd && new Date(user.organization.licenseEnd) < new Date();
      
      return NextResponse.json({ 
        id: user.id,
        name: user.name || user.email, 
        email: user.email, 
        role: user.role,
        organizationId: user.organizationId,
        companyName: user.organization?.name || 'My Organization',
        licenseStatus: isExpired ? 'Expired' : (user.organization?.licenseStatus || 'Active'),
        licensePlan: user.organization?.licensePlan || 'Enterprise',
        licenseStart: user.organization?.licenseStart || null,
        licenseEnd: user.organization?.licenseEnd || null,
        features: (user.organization?.features && user.organization.features.includes(':')) ? decrypt(user.organization.features) : (user.organization?.features || null),
        permissions: user.permissions || {},
        isImpersonating: !!payload.impersonatorId,
        impersonatorId: payload.impersonatorId || null
      });
    }

    return NextResponse.json({ 
      name: payload.email, 
      email: payload.email, 
      role: payload.role,
      isImpersonating: !!payload.impersonatorId,
      impersonatorId: payload.impersonatorId || null
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to authenticate', details: err?.message || String(err), stack: err?.stack }, { status: 500 });
  }
}
