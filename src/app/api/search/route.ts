import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { verifySession } from '../../../lib/session';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const auth = await verifySession(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    
    if (!q || q.length < 2) {
      return NextResponse.json([]);
    }

    const orgId = auth.organizationId;
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