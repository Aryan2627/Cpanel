import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');
    
    let contracts;
    if (vendorId) {
      contracts = await prisma.contract.findMany({
        where: { vendorId },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      contracts = await prisma.contract.findMany({
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(contracts);
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Auto-generate standard template content if not provided
    const defaultContent = `
# Contract Agreement

This Agreement is entered into by and between the Client and the Vendor.

**Project Title:** ${data.title || 'Standard Service'}
**Contract Amount:** $${data.total || 0}

## 1. Services Provided
The Vendor agrees to provide the goods and services as outlined in the related event and purchase order.

## 2. Payment Terms
Payment will be made within 30 days of receipt of a valid invoice.

## 3. Confidentiality
Both parties agree to maintain the confidentiality of all proprietary information shared during the course of this engagement.

---
Please edit this document below to negotiate terms before signing.
`;

    const contract = await prisma.contract.create({
      data: {
        title: data.title,
        status: data.status || 'Draft',
        vendorId: data.vendorId,
        vendorName: data.vendorName,
        eventId: data.eventId,
        poId: data.poId,
        content: data.content || defaultContent,
        total: data.total || 0,
      },
    });
    return NextResponse.json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
