import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Make sure this path to prisma is correct

// GET all approval rules
export async function GET() {
  try {
    const rules = await prisma.approvalRule.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error("Failed to fetch approval rules:", error);
    return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

// POST a new approval rule
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, field, operator, value, approverRole } = body;

    const newRule = await prisma.approvalRule.create({
      data: {
        name,
        field,
        operator,
        value,
        approverRole,
      },
    });

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    console.error("Failed to create approval rule:", error);
    return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
