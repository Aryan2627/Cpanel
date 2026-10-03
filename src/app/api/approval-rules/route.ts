import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

// GET all approval rules
export async function GET() {
  try {
    const orgId = await getTenantId();
    const rules = await prisma.approvalRule.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Failed to fetch approval rules:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

// POST a new approval matrix rule
export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const body = await request.json();
    const { flowName, approvalType, type, value1, logic, value2, department, approvers } = body;

    const newRule = await prisma.approvalRule.create({
      data: {
        organizationId: orgId,
        flowName: flowName || "Default Flow",
        approvalType: approvalType || "Quote Selection",
        type,
        value1,
        logic,
        value2: value2 || null,
        department,
        approvers: JSON.stringify(approvers), // Save the array as JSON string
      },
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error("Failed to create approval rule:", error);
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
