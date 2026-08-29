import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, companyName, industry } = data;

    // Find all buyer organizations that share this industry
    const matchingOrgs = await prisma.organization.findMany({
      where: { industry: industry }
    });

    if (matchingOrgs.length > 0) {
      // Add vendor to each matching buyer's pending invites
      for (const org of matchingOrgs) {
        // Check if vendor already exists for this org
        const existing = await prisma.vendor.findFirst({
          where: { organizationId: org.id, email }
        });

        if (!existing) {
          await prisma.vendor.create({
            data: {
              organizationId: org.id,
              name: companyName, // Map companyName to Vendor name
              email: email,
              dealsIn: industry,
              status: 'Onboarding in Progress',
              type: 'Supplier'
            }
          });
        }
      }
    } else {
      // Save globally if no matching orgs exist yet, using a null organizationId 
      // (This means they are in the pool for future matches)
      const existing = await prisma.vendor.findFirst({
        where: { email, organizationId: null }
      });
      if (!existing) {
        await prisma.vendor.create({
          data: {
            name: companyName,
            email: email,
            dealsIn: industry,
            status: 'Onboarding in Progress',
            type: 'Supplier'
          }
        });
      }
    }

    return NextResponse.json({ success: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
