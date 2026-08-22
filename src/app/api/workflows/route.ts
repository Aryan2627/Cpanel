import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const workflows = await prisma.workflow.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(workflows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.category || !data.approvers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orgId = await getTenantId();
    const workflow = await prisma.workflow.create({
      data: {
        name: data.name,
        category: data.category,
        approvers: JSON.stringify(data.approvers),
        isActive: true,
        organizationId: orgId
      }
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
