import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { eventId } = await request.json();
    if (!eventId) return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(eventId);
    const event = await prisma.event.findFirst({
      where: isUuid ? { id: eventId } : { refId: eventId }
    });

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    const bids = await prisma.bid.findMany({
      where: { eventId: event.id }
    });

    if (bids.length === 0) {
      return NextResponse.json({ error: 'No bids received yet to evaluate.' }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured.' }, { status: 500 });
    }

    // Format data for AI
    const eventContext =  'Event: ' + event.title + '\nType: ' + event.type;
    const bidData = bids.map(b =>  'Vendor: ' + b.vendorName + '\nAmount: $' + b.amount + '\nDetails: ' + b.templateData).join('\n\n');

    const promptBase =  'You are part of a corporate procurement Board of Directors. Review the following bids for an event.\n' + eventContext + '\n\nBIDS:\n' + bidData + '\n\n';

    const callGroq = async (role: string, instructions: string) => {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization':  'Bearer ' + groqKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama3-70b-8192',
          messages: [
            { role: 'system', content:  'You are the ' + role + ' on a corporate procurement board. ' + instructions + ' Keep your analysis concise, punchy, and under 150 words. End with your final recommendation.' },
            { role: 'user', content: promptBase }
          ],
          temperature: 0.2
        })
      });
      const data = await res.json();
      if (!res.ok) { return 'Groq Error: ' + JSON.stringify(data); }
      return data.choices?.[0]?.message?.content || 'Analysis failed.';
    };

    // Run all 3 agents in parallel for maximum speed!
    const [cfo, engineer, lawyer] = await Promise.all([
      callGroq('Chief Financial Officer (CFO)', 'Focus ONLY on price, cost savings, and financial risk. Be ruthless about budget.'),
      callGroq('Lead Engineer', 'Focus ONLY on technical capabilities, delivery times, and quality metrics extracted from the details. Ignore the price.'),
      callGroq('Compliance Officer', 'Focus ONLY on risk, vendor reliability, and overall compliance. Point out any missing data as a huge red flag.')
    ]);

    // Finally, run a consensus agent
    const consensusRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization':  'Bearer ' + groqKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [
          { role: 'system', content: 'You are the CEO. You must read the reports from your CFO, Engineer, and Compliance Officer, and make a final, unified executive decision on which vendor wins the contract. Keep it under 100 words.' },
          { role: 'user', content:  'CFO:\n' + cfo + '\n\nENGINEER:\n' + engineer + '\n\nCOMPLIANCE:\n' + lawyer }
        ],
        temperature: 0.2
      })
    });
    const consensusData = await consensusRes.json();
    const consensus = consensusData.choices?.[0]?.message?.content || 'Failed to reach consensus.';

    return NextResponse.json({
      agents: {
        cfo,
        engineer,
        compliance: lawyer,
        consensus
      }
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}