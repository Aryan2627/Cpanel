import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const rules = await prisma.contextDefinition.findMany({
      where: { organizationId: orgId },
      orderBy: { updatedAt: 'desc' }
    });
    
    // Seed default if empty
    if (rules.length === 0) {
      const defaultRule = await prisma.contextDefinition.create({
        data: {
          organizationId: orgId,
          name: 'negotiation_baseline.yml',
          description: 'Baseline context for Niti autonomous negotiations',
          consumedBy: 'Niti',
          content: `definition: "Aggressive Baseline Strategy"
description: "Forces Niti to negotiate firmly below market price."
scope:
  target_discount_percentage: 15
  max_budget_buffer: 10
rules:
  - "Never accept initial offer"
  - "Always demand Net 60 terms"
  - "Request 2-year lock-in"
`
        }
      });
      return NextResponse.json([defaultRule]);
    }
    
    return NextResponse.json(rules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const orgId = await getTenantId();
    const body = await req.json();
    const { name, description, content, consumedBy, isActive } = body;
    
    const rule = await prisma.contextDefinition.create({
      data: {
        organizationId: orgId,
        name,
        description,
        content,
        consumedBy,
        isActive: isActive !== undefined ? isActive : true
      }
    });
    return NextResponse.json(rule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const orgId = await getTenantId();
    const body = await req.json();
    const { id, content, isActive } = body;
    
    const rule = await prisma.contextDefinition.update({
      where: { id },
      data: { content, isActive }
    });
    return NextResponse.json(rule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
