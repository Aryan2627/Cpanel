import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
