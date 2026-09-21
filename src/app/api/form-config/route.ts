import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
