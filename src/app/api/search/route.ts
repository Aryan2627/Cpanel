import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '../../../lib/prisma';
import { verifyToken } from '../../../lib/session';

export const runtime = 'nodejs';

export async function GET(req: Request) {
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
      where: { email: payload.email as string }
    });

    if (!user) {
       return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const orgId = user.organizationId;
    const queryStr = { contains: q, mode: 'insensitive' as const };

    const [pos, intakes, vendors] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { poNumber: queryStr },
            { title: queryStr }
          ]
        },
        take: 5
      }),
      prisma.intake.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { refId: queryStr },
            { title: queryStr }
          ]
        },
        take: 5
      }),
      prisma.vendor.findMany({
        where: {
          organizationId: orgId,
          OR: [
            { name: queryStr },
            { vendorCode: queryStr }
          ]
        },
        take: 5
      })
    ]);

    const results: any[] = [];

    pos.forEach(po => {
      results.push({
        id: po.id,
        title: `PO: ${po.poNumber} ${po.title ? '- ' + po.title : ''}`,
        icon: '🛒',
        path: `/client/po/${po.id}`
      });
    });

    intakes.forEach(pr => {
      results.push({
        id: pr.id,
        title: `PR: ${pr.refId} ${pr.title ? '- ' + pr.title : ''}`,
        icon: '📝',
        path: `/client/pr`
      });
    });

    vendors.forEach(v => {
      results.push({
        id: v.id,
        title: `Vendor: ${v.name} ${v.vendorCode ? '(' + v.vendorCode + ')' : ''}`,
        icon: '🏢',
        path: `/client/vendors/${v.id}`
      });
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}