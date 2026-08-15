import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-local-dev';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let { email } = data;
    email = email?.trim();
    
    console.log(`[vendor-auth] Login attempt for email: ${email}`);
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: corsHeaders });
    }

    // Try to find the vendor (case-insensitive for robust checking)
    const vendors = await prisma.vendor.findMany();
    const vendor = vendors.find(v => v.email?.trim().toLowerCase() === email.toLowerCase());

    if (!vendor) {
      console.log(`[vendor-auth] Vendor not found for email: ${email}`);
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404, headers: corsHeaders });
    }
    
    console.log(`[vendor-auth] Vendor found: ${vendor.name} (${vendor.id})`);

    // Sign the JWT
    const token = jwt.sign(
      { id: vendor.id, email: vendor.email, name: vendor.name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return NextResponse.json({ vendor, token }, { status: 200, headers: corsHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}
