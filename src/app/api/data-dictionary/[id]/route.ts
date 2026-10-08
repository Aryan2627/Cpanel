import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const orgId = await getTenantId();
    
    // Verify ownership
    const item = await prisma.dataDictionary.findUnique({ where: { id: params.id } });
    if (!item || item.organizationId !== orgId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    await prisma.dataDictionary.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
