import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getTenantId } from '../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const orgId = await getTenantId();
    const users = await prisma.user.findMany({ where: { organizationId: orgId } });
    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const orgId = await getTenantId();
    const data = await request.json();
    
    if (data.phone && !/^\d+$/.test(data.phone)) {
      return NextResponse.json({ error: 'Phone number must contain only numbers' }, { status: 400 });
    }

    const orConditions = [];
    if (data.email) orConditions.push({ email: data.email });
    if (data.phone) orConditions.push({ phone: data.phone });
    if (data.erpId) orConditions.push({ erpId: data.erpId, organizationId: orgId });

    if (orConditions.length > 0) {
      const existingUser = await prisma.user.findFirst({
        where: { OR: orConditions }
      });
      if (existingUser) {
        if (existingUser.email === data.email) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        if (existingUser.phone === data.phone) return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
        if (existingUser.erpId === data.erpId) return NextResponse.json({ error: 'ERP ID already exists' }, { status: 400 });
      }
    }

    const user = await prisma.user.create({
      data: {
        organizationId: orgId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        erpId: data.erpId,
        status: data.status || 'Active',
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const orgId = await getTenantId();
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    if (data.phone && !/^\d+$/.test(data.phone)) {
      return NextResponse.json({ error: 'Phone number must contain only numbers' }, { status: 400 });
    }

    const orConditions = [];
    if (data.email) orConditions.push({ email: data.email });
    if (data.phone) orConditions.push({ phone: data.phone });
    if (data.erpId) orConditions.push({ erpId: data.erpId, organizationId: orgId });

    if (orConditions.length > 0) {
      const existingUser = await prisma.user.findFirst({
        where: { 
          OR: orConditions,
          id: { not: data.id }
        }
      });
      if (existingUser) {
        if (existingUser.email === data.email) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        if (existingUser.phone === data.phone) return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 });
        if (existingUser.erpId === data.erpId) return NextResponse.json({ error: 'ERP ID already exists' }, { status: 400 });
      }
    }

    const user = await prisma.user.update({
      where: { id: data.id, organizationId: orgId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        erpId: data.erpId,
        status: data.status,
      }
    });
    return NextResponse.json(user, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const orgId = await getTenantId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: id, organizationId: orgId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
