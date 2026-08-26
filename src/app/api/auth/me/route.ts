import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_procgen';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { identifier: string; role: string };
    const email = payload.identifier?.trim().toLowerCase();

    // Look up actual name from the DB
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) {
      return NextResponse.json({ name: user.name || email, email, role: payload.role });
    }

    const vendor = await prisma.vendor.findFirst({ where: { email } });
    if (vendor) {
      return NextResponse.json({ name: vendor.name || email, email, role: payload.role });
    }

    return NextResponse.json({ name: email, email, role: payload.role });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { identifier: string; role: string };
    const email = payload.identifier?.trim().toLowerCase();
    
    const body = await request.json();
    const newName = body.name;

    if (!newName) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: newName }
      });
      return NextResponse.json({ name: updated.name, email, role: payload.role });
    }

    const vendor = await prisma.vendor.findFirst({ where: { email } });
    if (vendor) {
      const updated = await prisma.vendor.update({
        where: { id: vendor.id },
        data: { name: newName }
      });
      return NextResponse.json({ name: updated.name, email, role: payload.role });
    }

    return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
