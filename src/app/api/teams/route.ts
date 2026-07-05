import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const teams = await prisma.team.findMany();
    
    // Parse the JSON string arrays back to objects for the client
    const parsedTeams = teams.map((t: any) => ({
      ...t,
      users: t.users ? JSON.parse(t.users) : [],
      categories: t.categories ? JSON.parse(t.categories) : [],
      locations: t.locations ? JSON.parse(t.locations) : []
    }));

    return NextResponse.json(parsedTeams);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const team = await prisma.team.create({
      data: {
        name: data.name,
        type: data.type,
        users: data.users, // array
        categories: data.categories, // array
        locations: data.locations // array
      }
    });
    return NextResponse.json(team, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
