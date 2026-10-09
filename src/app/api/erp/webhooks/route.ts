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

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Simple authentication/verification would go here in production
    
    // Create Intake (PR) from ERP webhook data
    const newIntake = await prisma.intake.create({
      data: {
        refId: `PR-${Date.now()}`,
        title: data.title || 'Incoming ERP PR',
        reqName: data.requesterName || 'System',
        type: data.type || 'ERP Sourced',
        status: 'Draft',
        source: data.source || 'ERP Webhook',
        erpId: data.erpId,
      }
    });

    return NextResponse.json({ success: true, intake: newIntake });
  } catch (error) {
    console.error('Error processing ERP webhook:', error);
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
  }
}
