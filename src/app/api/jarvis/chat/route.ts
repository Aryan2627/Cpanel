import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ reply: 'I did not catch that.' });

    const text = message.toLowerCase();
    const upperText = message.toUpperCase();

    // 1. Data Retrieval: Event Summarization
    if (text.includes('summarize event') || text.includes('update on event') || text.includes('status of event')) {
      const eventMatch = upperText.match(/EVT-\d+/);
      if (eventMatch) {
        const eventId = eventMatch[0];
        const event = await prisma.event.findUnique({ where: { refId: eventId } });
        if (event) {
          const bids = await prisma.bid.findMany({ where: { eventId: event.id }, orderBy: { amount: 'asc' } });
          let reply = `Event ${eventId} (${event.title}) is currently ${event.endTime && new Date(event.endTime) < new Date() ? 'Closed' : 'Active'}. `;
          if (bids.length > 0) {
            reply += `It has received ${bids.length} bids. The current lowest bidder is ${bids[0].vendorName} at ${bids[0].amount} ${bids[0].currency}.`;
          } else {
            reply += `It has not received any bids yet.`;
          }
          return NextResponse.json({ reply, action: { type: 'NAVIGATE', payload: `/client/events/${eventId}` } });
        } else {
          return NextResponse.json({ reply: `I could not find an event with the ID ${eventId}.` });
        }
      }
    }

    // 2. Data Retrieval: Vendor/System Stats
    if (text.includes('how many vendors') || text.includes('total vendors')) {
      const count = await prisma.vendor.count();
      return NextResponse.json({ reply: `There are currently ${count} registered vendors in the global directory.` });
    }
    
    if (text.includes('how many active events') || text.includes('how many events')) {
      const count = await prisma.event.count();
      return NextResponse.json({ reply: `There are currently ${count} sourcing events in the system.` });
    }

    // 3. Risk Assessment Simulation
    if (text.includes('safe to buy from') || text.includes('risk report') || (text.includes('risk') && text.includes('vendor'))) {
      const vendorMatch = upperText.match(/V-\d+/);
      if (vendorMatch) {
        return NextResponse.json({ reply: `Risk Assessment for ${vendorMatch[0]}: Low Risk. Financials are stable and they have a 98% on-time delivery rate over the last 12 months.`, action: { type: 'NAVIGATE', payload: `/client/vendors/${vendorMatch[0]}` } });
      } else {
        return NextResponse.json({ reply: `Scanning global supply chain... Supplier C poses the highest risk due to recent financial insolvency alerts in their region.` });
      }
    }

    // 4. Navigation & UI Commands
    const poMatch = upperText.match(/PO-\d+/);
    const vendorMatch = upperText.match(/V-\d+/);
    const eventMatchLoose = upperText.match(/(?:EVT-|EVENT\s*#?\s*)?(\d{3,})/i);

    if (poMatch) {
      return NextResponse.json({ reply: `Accessing Purchase Order ${poMatch[0]}...`, action: { type: 'NAVIGATE', payload: `/client/po/${poMatch[0]}` } });
    }
    else if (vendorMatch) {
      return NextResponse.json({ reply: `Accessing Vendor Profile for ${vendorMatch[0]}...`, action: { type: 'NAVIGATE', payload: `/client/vendors/${vendorMatch[0]}` } });
    }
    else if (eventMatchLoose && eventMatchLoose[1] && (upperText.includes('EVENT') || upperText.includes('EVT') || /^\d{3,}$/.test(message.trim()))) {
      const evtRef = `EVT-${eventMatchLoose[1]}`;
      return NextResponse.json({ reply: `Loading Sourcing Event ${evtRef}...`, action: { type: 'NAVIGATE', payload: `/client/events/${evtRef}` } });
    }
    
    else if (text.includes('dashboard') || text.includes('home')) {
      return NextResponse.json({ reply: 'Navigating to the Global Dashboard...', action: { type: 'NAVIGATE', payload: '/client' } });
    } 
    else if (text.includes('intake') || text.includes('want') || text.includes('need') || text.includes('require')) {
      // Check if it's an actionable command (e.g., "create intake for X" or "I want X")
      const createIntakeMatch = upperText.match(/(?:CREATE|MAKE|ADD)(?:\s+A|\s+AN)?\s+INTAKE(?:\s+FOR)?\s+(.+)|(?:I|WE)\s+(?:WANT|NEED|REQUIRE)\s+(.+)/);
      if (createIntakeMatch && (createIntakeMatch[1] || createIntakeMatch[2])) {
        let intakeTitle = (createIntakeMatch[1] || createIntakeMatch[2]).trim();
        let quantity = 1;
        
        // Extract ANY numerical value from the item to use as quantity
        const qtyMatch = intakeTitle.match(/(\d+)/);
        if (qtyMatch) {
          quantity = parseInt(qtyMatch[1], 10);
          intakeTitle = intakeTitle.replace(qtyMatch[1], '').replace(/\s+/g, ' ').trim();
        }

        const refId = `PR-${Date.now().toString().slice(-6)}`;
        const orgId = await getTenantId();
        
        await prisma.intake.create({
          data: {
            refId,
            title: intakeTitle,
            status: "Pending Approval",
            source: "Jarvis AI",
            organizationId: orgId,
            quantity
          }
        });
        
        return NextResponse.json({ 
          reply: `I have successfully created an intake for "${intakeTitle}" (Reference: ${refId}). Taking you there now.`, 
          action: { type: 'NAVIGATE', payload: '/client/intake' } 
        });
      }
      
      // Fallback to just navigating
      return NextResponse.json({ reply: 'Opening the Intake Request form...', action: { type: 'NAVIGATE', payload: '/client/intake/create' } });
    }
    else if (text.includes('intake')) {
      return NextResponse.json({ reply: 'Pulling up the Purchase Intake tracker...', action: { type: 'NAVIGATE', payload: '/client/intake' } });
    }
    else if (text.includes('new pr') || text.includes('create purchase request')) {
      return NextResponse.json({ reply: 'Initiating new Purchase Request...', action: { type: 'NAVIGATE', payload: '/client/intake/create' } });
    }
    else if (text.includes('purchase request') || text.includes('prs') || text === 'pr') {
      return NextResponse.json({ reply: 'Pulling up the Purchase Request tracker...', action: { type: 'NAVIGATE', payload: '/client/pr' } });
    }
    else if (text.includes('auction')) {
      return NextResponse.json({ reply: 'Initializing Reverse Auction setup...', action: { type: 'NAVIGATE', payload: '/client/events/create/auction' } });
    }
    else if (text.includes('create event') || text.includes('new event') || text.includes('rfq')) {
      return NextResponse.json({ reply: 'Opening the Event Creation studio...', action: { type: 'NAVIGATE', payload: '/client/events/create/single-stage' } });
    }
    else if (text.includes('events') || text.includes('sourcing') || text.includes('bidding')) {
      return NextResponse.json({ reply: 'Opening Active Events matrix...', action: { type: 'NAVIGATE', payload: '/client/events' } });
    }
    else if (text.includes('product') || text.includes('catalog') || text.includes('items')) {
      return NextResponse.json({ reply: 'Accessing the Global Product Catalog...', action: { type: 'NAVIGATE', payload: '/client/manage/products' } });
    }
    else if (text.includes('template') || text.includes('questionnaire')) {
      return NextResponse.json({ reply: 'Opening Template Management...', action: { type: 'NAVIGATE', payload: '/client/manage/templates' } });
    }
    else if (text.includes('user') || text.includes('team') || text.includes('access')) {
      return NextResponse.json({ reply: 'Navigating to User Directory...', action: { type: 'NAVIGATE', payload: '/client/manage/users' } });
    }
    else if (text.includes('po') || text.includes('order') || text.includes('purchase order')) {
      return NextResponse.json({ reply: 'Accessing Purchase Orders database...', action: { type: 'NAVIGATE', payload: '/client/po' } });
    }
    else if (text.includes('setting') || text.includes('config') || text.includes('admin')) {
      return NextResponse.json({ reply: 'Opening System Settings panel...', action: { type: 'NAVIGATE', payload: '/client/settings' } });
    }
    else if (text.includes('message') || text.includes('chat') || text.includes('inbox')) {
      return NextResponse.json({ reply: 'Opening Secure Vendor Messaging...', action: { type: 'NAVIGATE', payload: '/client/vendors/messages' } });
    }
    else if (text.includes('vendor') || text.includes('supplier') || text.includes('directory')) {
      return NextResponse.json({ reply: 'Accessing Global Supplier Network...', action: { type: 'NAVIGATE', payload: '/client/vendors' } });
    }
    
    // UI Effects
    else if (text.includes('lockdown')) {
      return NextResponse.json({ reply: 'Executing emergency system lockdown protocol.', action: { type: 'UI_EFFECT', payload: 'LOCKDOWN' } });
    }
    else if (text.includes('dark mode')) {
      return NextResponse.json({ reply: 'Initializing dark mode interface.', action: { type: 'UI_EFFECT', payload: 'DARK_MODE' } });
    }
    else if (text.includes('crash') || text.includes('throw error')) {
      return NextResponse.json({ reply: 'WARNING: Initiating forced memory leak...', action: { type: 'UI_EFFECT', payload: 'CRASH' } });
    }
    else if (text.includes('help') || text.includes('what can you do') || text.includes('commands')) {
      return NextResponse.json({ reply: `I can summarize events, pull vendor stats, or navigate you anywhere. Try: "Summarize event EVT-123", "How many vendors?", or "Open PO-1045".` });
    }
    else if (text.includes('memory') || text.includes('remember') || text.includes('recent')) {
      const memories = await prisma.jarvisMemory.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
      if (memories.length > 0) {
        const latest = memories[0];
        return NextResponse.json({ reply: `I am tracking recent activity. Most recent memory: ${latest.context} (${latest.entityRef}).` });
      } else {
        return NextResponse.json({ reply: 'My active memory banks are currently empty.' });
      }
    }
    
    // Fallback
    return NextResponse.json({ reply: `I heard: "${message}". I don't know how to process that specific request yet. Try commands like "summarize EVT-123" or "take me to settings".` });

  } catch (error: any) {
    console.error('Jarvis API Error:', error);
    return NextResponse.json({ reply: 'I encountered an error processing your request.' }, { status: 500 });
  }
}
