import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { companyName, email, password, name } = await req.json();

    if (!companyName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Try to find an existing organization with the exact same name (case-insensitive)
    let org = await prisma.organization.findFirst({
      where: {
        name: {
          equals: companyName,
          mode: 'insensitive'
        }
      }
    });

    let isNewOrg = false;

    // If it doesn't exist, create a new one
    if (!org) {
      org = await prisma.organization.create({
        data: {
          name: companyName,
          features: JSON.stringify({ plan: "Starter", createdAt: new Date().toISOString() })
        }
      });
      isNewOrg = true;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user attached to the organization
    // If they are joining an existing org, make them a standard 'user'. If new org, make them 'admin'.
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: isNewOrg ? 'admin' : 'user'
      }
    });

    return NextResponse.json({ success: true, orgId: org.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
