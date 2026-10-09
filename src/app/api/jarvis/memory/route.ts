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
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET() {
  try {
    const now = new Date();
    
    // Auto-clean expired memory occasionally (or just fetch unexpired)
    // We'll just fetch unexpired ones, but also optionally delete expired ones to keep DB clean
    await prisma.jarvisMemory.deleteMany({
      where: {
        expiresAt: { lt: now }
      }
    });

    // Fetch active memories
    const activeMemories = await prisma.jarvisMemory.findMany({
      where: {
        expiresAt: { gte: now }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(activeMemories, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
