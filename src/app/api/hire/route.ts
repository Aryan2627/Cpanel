import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function GET(request: Request) {
  try {
    const candidates = await prisma.candidateResponse.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(candidates);
  } catch (error: any) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
