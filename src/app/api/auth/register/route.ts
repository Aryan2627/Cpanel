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

    // Create the organization
    const org = await prisma.organization.create({
      data: {
        name: companyName,
        domain: email.split('@')[1] || null,
        plan: "Starter"
      }
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user attached to the organization
    const user = await prisma.user.create({
      data: {
        organizationId: org.id,
        email,
        name: name || email.split('@')[0],
        password: hashedPassword,
        role: 'admin'
      }
    });

    return NextResponse.json({ success: true, orgId: org.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
