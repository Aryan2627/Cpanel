import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const searchParam = params.id;
    
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(searchParam);
    
    const event = await prisma.event.findFirst({
      where: isUuid ? { id: searchParam } : { refId: searchParam }
    });

    if (!event) {
      // Fallback for mock events that don't exist in the database
      return NextResponse.json({
        id: searchParam,
        refId: searchParam,
        title: 'Demo Sourcing Event',
        type: 'RFQ',
        account: 'Enterprise Department',
        itemsCount: 5,
        status: 'Live',
        baseCurrency: 'USD',
        createdAt: new Date(),
        endTime: new Date(Date.now() + 86400000), // 1 day from now
        stages: JSON.stringify([{
            name: "Live RFQ",
            statusIcon: null,
            timeText: "Ends in 24h",
            timeColor: "#10b981",
            participants: "3/5",
            participantsColor: "#2563eb",
            actionText: "Evaluate",
            templateFields: [
              { name: "Unit Price", key: "price", type: "number", weight: 60, required: true },
              { name: "Lead Time (Days)", key: "leadTime", type: "number", weight: 40, required: true }
            ]
        }])
      }, { status: 200 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const searchParam = params.id;
    const data = await request.json();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(searchParam);
    
    const existingEvent = await prisma.event.findFirst({ 
      where: isUuid ? { id: searchParam } : { refId: searchParam } 
    });
    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: existingEvent.id },
      data: { endTime: data.endTime ? new Date(data.endTime) : null }
    });

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
