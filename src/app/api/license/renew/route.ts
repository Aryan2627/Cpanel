import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    // We assume the user sends { organizationId: string } or we get it from auth context.
    const body = await request.json();
    const organizationId = body.organizationId;

    if (!organizationId) {
      return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
    }

    // 1. Fetch organization
    const org = await prisma.organization.findUnique({ where: { id: organizationId } });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // 2. Ensure "ProcGen Technologies" vendor exists for this org
    let vendor = await prisma.vendor.findFirst({
      where: { 
        organizationId: organizationId,
        name: 'ProcGen Technologies'
      }
    });

    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          organizationId: organizationId,
          name: 'ProcGen Technologies',
          email: 'billing@procgen.in',
          status: 'Active',
          type: 'Software Vendor',
          city: 'Global',
          vendorCode: 'V-PROCGEN'
        }
      });
    }

    // 3. Create the Purchase Order
    const poNumber = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const poDetails = JSON.stringify({
      items: [
        {
          id: 1,
          name: `${org.licensePlan} Plan - Annual License Renewal`,
          quantity: 1,
          unitPrice: 1050000,
          total: 1050000
        }
      ],
      notes: "Auto-generated PO for platform license renewal."
    });

    const po = await prisma.purchaseOrder.create({
      data: {
        organizationId,
        poNumber,
        title: `ProcGen ${org.licensePlan} Annual License`,
        status: 'Draft',
        vendorId: vendor.id,
        total: 1050000,
        details: poDetails,
        source: 'System Generation'
      }
    });

    // 4. Update the organization's license status to Grace Period (+14 days)
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 14);

    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        licenseStatus: 'Grace Period',
        licenseExpiry: newExpiry
      }
    });

    return NextResponse.json({ success: true, poNumber: po.poNumber });

  } catch (error: any) {
    console.error('License Renewal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
