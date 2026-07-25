import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const contract = await prisma.contract.findUnique({
      where: { id: params.id },
    });

    if (!contract) {
      return NextResponse.json({ error: 'Contract not found' }, { status: 404 });
    }

    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json({ error: 'Failed to fetch contract' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    
    // Auto-update status to signed if both parties have signed
    let newStatus = data.status;
    if (data.clientSigned && data.vendorSigned) {
        newStatus = 'Signed';
    }

    const updatedContract = await prisma.contract.update({
      where: { id: params.id },
      data: {
        title: data.title,
        status: newStatus !== undefined ? newStatus : undefined,
        content: data.content,
        clientSigned: data.clientSigned,
        vendorSigned: data.vendorSigned,
      },
    });

    return NextResponse.json(updatedContract);
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}
