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
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';



const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_procgen';

/**
 * Handles incoming GET requests for this route.
 * Fetches required data from the database and returns a JSON response to the client.
 */
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { role: string };
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const take = 50;

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    });

    const total = await prisma.auditLog.count();
    return NextResponse.json({ logs, total, page });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
