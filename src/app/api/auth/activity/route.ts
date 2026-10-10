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
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = jwt.verify(token, JWT_SECRET) as { identifier: string };
    const activities = await prisma.loginActivity.findMany({
      where: { identifier: payload.identifier },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(activities);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
