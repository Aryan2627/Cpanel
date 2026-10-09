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

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET() {
  try {
    const [users, vendors, pos, intakes] = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.purchaseOrder.count(),
      prisma.intake.count()
    ]);
    
    // Total spend
    const allPos = await prisma.purchaseOrder.findMany({
      where: { status: { not: 'Cancelled' } }
    });
    const totalSpend = allPos.reduce((acc, po) => acc + (po.total || 0), 0);

    return NextResponse.json({
      users,
      vendors,
      pos,
      intakes,
      totalSpend
    });
  } catch (error: any) {
    console.error('Stats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
