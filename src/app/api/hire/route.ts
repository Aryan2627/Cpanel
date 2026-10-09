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
import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
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
