import { NextResponse } from 'next/server';
import { getTenantId } from '../../../lib/tenant';
import { prisma } from '../../../lib/prisma';
import { evaluateApprovalMatrix, createPendingApproval } from '../../../lib/approvalEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orgId = await getTenantId();
    const intakes = await prisma.intake.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Map customData back to root for the frontend PR table
    const formatted = intakes.map(i => {
      let budget = undefined;
      if (i.customData && typeof i.customData === 'object' && !Array.isArray(i.customData)) {
        budget = (i.customData as any).budget;
      }
      return { ...i, budget };
    });
    
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch intakes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    // TOKEN GATE
    try {
      const { consumeTokens } = await import('../../../lib/tokens');
      await consumeTokens(orgId, 'CREATE_PR');
    } catch (tokenErr: any) {
      if (tokenErr.message?.startsWith('INSUFFICIENT_TOKENS')) {
        const [, remaining, cost] = tokenErr.message.split(':');
        const { insufficientTokensResponse } = await import('../../../lib/tokens');
        return insufficientTokensResponse(parseInt(remaining), parseInt(cost));
      }
      throw tokenErr;
    }

    const data = await request.json();

    // ⚡ PERFORMANCE OPTIMIZATION: Run the existence check and the matrix evaluation concurrently
    const [existing, matrixResult] = await Promise.all([
      prisma.intake.findFirst({
        where: {
          organizationId: orgId,
          title: data.title
        }
      }),
      evaluateApprovalMatrix(orgId, 'Intake Request', data)
    ]);

    if (existing) {
      return NextResponse.json({ error: 'An intake with this title already exists.' }, { status: 400 });
    }

    const { requiresApproval, approvers, workflowName } = matrixResult;

    const initialStatus = requiresApproval ? 'Pending Approval' : (data.status || 'Draft');

    const newIntake = await prisma.intake.create({
      data: {
        organizationId: orgId,
        refId: data.refId || `PR-${Date.now()}`,
        title: data.title,
        reqName: data.reqName,
        status: initialStatus,
        type: data.type || 'Standalone NFA',
        buyer: data.buyer || '-',
        reqAt: data.reqAt || new Date().toISOString().split('T')[0],
        updAt: data.updAt || new Date().toISOString().split('T')[0],
        quantity: data.quantity || 1,
        customData: (data.budget !== undefined && data.budget !== null) ? { budget: Number(data.budget) } : undefined,
      }
    });

    if (requiresApproval) {
      await createPendingApproval(
        orgId,
        null, // No event ID since it's an Intake Request
        `${workflowName} - ${newIntake.refId}`,
        approvers,
        newIntake.id,
        'INTAKE_APPROVAL' // Distinct type for Intakes
      );
    }

    let budget = undefined;
    if (newIntake.customData && typeof newIntake.customData === 'object' && !Array.isArray(newIntake.customData)) {
        budget = (newIntake.customData as any).budget;
    }

    return NextResponse.json({ ...newIntake, budget }, { status: 201 });
  } catch (error: any) {
    console.error('API Error creating intake:', error);
    return NextResponse.json({ error: error.message || 'Failed to create intake' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    console.log("Updating Intake:", data);
    const updatedIntake = await prisma.intake.update({
      where: { refId: data.refId },
      data: {
        status: data.status,
        quantity: data.quantity,
        updAt: new Date().toISOString().split('T')[0],
      }
    });
    return NextResponse.json(updatedIntake, { status: 200 });
  } catch (error: any) {
    console.error('API Error updating intake:', error);
    return NextResponse.json({ error: error.message || 'Failed to update intake' }, { status: 500 });
  }
}
