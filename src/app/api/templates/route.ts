import { NextResponse } from 'next/server';
import { getTenantId } from '../../../lib/tenant';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const templates = await prisma.template.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    const data = await request.json();

    const existing = await prisma.template.findFirst({
      where: { name: data.name }
    });
    
    if (existing) {
      return NextResponse.json({ error: "A template with this name already exists" }, { status: 400 });
    }

    const newTemplate = await prisma.template.create({
      data: {
        organizationId: orgId,
        name: data.name,
        type: data.type || 'RFQ',
        fields: JSON.stringify(data.fields),
      }
    });
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
