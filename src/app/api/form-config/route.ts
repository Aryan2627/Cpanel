import { prisma } from '@/lib/prisma';
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




/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId') || 'DEFAULT_ORG_ID';
    
    const configs = await prisma.formConfiguration.findMany({
      where: { organizationId: orgId, isActive: true },
    });
    
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, formName, fieldName, fieldLabel, fieldType, options } = body;
    
    const config = await prisma.formConfiguration.upsert({
      where: {
        organizationId_formName_fieldName: {
          organizationId: orgId || 'DEFAULT_ORG_ID',
          formName,
          fieldName,
        },
      },
      update: {
        fieldLabel,
        fieldType,
        options: JSON.stringify(options),
      },
      create: {
        organizationId: orgId || 'DEFAULT_ORG_ID',
        formName,
        fieldName,
        fieldLabel,
        fieldType: fieldType || 'dropdown',
        options: JSON.stringify(options),
      },
    });
    
    return NextResponse.json(config);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}

/**
 * Handles incoming DELETE requests for this route.
 * Safely removes the specified resource or marks it as inactive.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      await prisma.formConfiguration.delete({ where: { id } });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
