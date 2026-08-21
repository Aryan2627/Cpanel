import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
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

    const workflow = await prisma.workflow.create({
      data: {
        name: data.name,
        category: data.category,
        approvers: JSON.stringify(data.approvers),
        isActive: true,
      }
    });

    return NextResponse.json(workflow, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
