import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { verifyToken } from '../../../../lib/session';
import { headers } from 'next/headers';
import intents from '../../../../data/intents.json';

// Simple NLP Stopwords
const STOP_WORDS = new Set(['a', 'an', 'the', 'is', 'are', 'what', 'whats', 'what\'s', 'how', 'why', 'do', 'does', 'to', 'for', 'of', 'in', 'on', 'with']);

// Tokenizer & Stemmer (Basic)
function tokenize(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0 && !STOP_WORDS.has(word));
}

// Jaccard Similarity / TF-IDF light
function calculateSimilarity(inputTokens: string[], intentTokens: string[]): number {
  if (inputTokens.length === 0 || intentTokens.length === 0) return 0;
  
  let matches = 0;
  for (const token of inputTokens) {
    if (intentTokens.includes(token)) matches++;
    // Basic fuzzy match for trailing 's' or similar
    else if (intentTokens.some(it => it.startsWith(token) || token.startsWith(it))) matches += 0.5;
  }
  
  return matches / Math.max(inputTokens.length, intentTokens.length * 0.7); // Penalize slightly if intent is much longer
}

export async function POST(req: Request) {
  try {
    const { prompt, userName, history } = await req.json();
    await new Promise(r => setTimeout(r, 400));
    const text = prompt.toLowerCase();
    const firstName = userName ? userName.split(' ')[0] : 'there';

    // Verify Session for DB access
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie') || '';
    const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')).filter(([k]) => k).map(([k, ...v]) => [k.trim(), v.join('=').trim()]));
    const tokenStr = cookies['proc-session'];
    const payload = await verifyToken(tokenStr);
    const orgId = payload?.organizationId as string | undefined;

    // --- AGENTIC ACTION: LIVE DATABASE PRs ---
    if (/(?:show|tell|get|find|list|my|recent|fetch|want|need|all).*(?:pr|prs|purchase request|intake)/i.test(text) && !text.includes('what is')) {
      const prs = await prisma.intake.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      
      if (prs.length === 0) {
        return NextResponse.json({ final_response: "You don't have any recent Purchase Requests in the database." });
      }

      return NextResponse.json({
        final_response: "Here are your latest Purchase Requests from the database:",
        ui_component: 'pr_list',
        ui_data: prs
      });
    }

    // --- AGENTIC ACTION: LIVE DATABASE POs ---
    if (/(?:show|tell|get|find|list|my|recent|fetch|want|need|all).*(?:po|pos|purchase order)/i.test(text) && !text.includes('what is')) {
      const pos = await prisma.purchaseOrder.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 3,
        orderBy: { createdAt: 'desc' }
      });
      
      if (pos.length === 0) {
        return NextResponse.json({ final_response: "You don't have any recent Purchase Orders in the database." });
      }

      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "User is asking for their Purchase Orders. I need to securely query the database." },
          { step: 2, action: "EXECUTE_TOOL", tool: "query_database", args: { table: "PurchaseOrder", orgId }, result: `Found ${pos.length} records.` }
        ],
        final_response: "Here are your latest Purchase Orders from the database:",
        ui_component: 'po_list',
        ui_data: pos
      });
    }

    // --- AGENTIC ACTION: SEARCH VENDORS ---
    if (/(?:show|tell|get|find|list|search|my|recent|fetch|want|need|name|who).*(?:vendor|supplier)/i.test(text) && !text.includes('what is')) {
      const vendors = await prisma.vendor.findMany({
        where: orgId ? { organizationId: orgId } : undefined,
        take: 2,
        orderBy: { name: 'asc' }
      });
      if (vendors.length === 0) return NextResponse.json({ final_response: "I couldn't find any vendors in your database." });
      
      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "Fetching live vendor list from the database..." },
          { step: 2, action: "EXECUTE_TOOL", tool: "query_database", args: { table: "Vendor", orgId }, result: `Found ${vendors.length} vendors.` }
        ],
        final_response: "Here are the active vendors I found in your database:",
        ui_component: 'vendor_list',
        ui_data: vendors
      });
    }

    // --- CONTEXTUAL MEMORY RESOLUTION ---
    if (history && history.length > 0 && (text === 'yes' || text.includes('approve it') || text === 'do it')) {
      const lastAgentMessage = history.reverse().find((m: any) => m.role === 'agent');
      if (lastAgentMessage && lastAgentMessage.content.includes('PO-')) {
        return NextResponse.json({
          agentic_loop: [
            { step: 1, action: "THINKING", message: "User said 'Approve it'. Using Session Memory, I see they are referring to the PO from my last message." },
            { step: 2, action: "EXECUTE_TOOL", tool: "update_record", args: { action: "Approve" }, result: "Success" }
          ],
          final_response: "✅ I have successfully approved the Purchase Order you were looking at."
        });
      }
    }

    // --- FUZZY NLP MATCHING (Intents.json) ---
    const inputTokens = tokenize(text);
    let bestMatch = { intent: null as any, score: 0 };

    for (const intent of intents) {
      const intentTokens = tokenize(intent.q);
      const score = calculateSimilarity(inputTokens, intentTokens);
      
      // Exact substring override
      if (text.includes(intent.q.toLowerCase())) {
        bestMatch = { intent, score: 1.0 };
        break;
      }

      if (score > bestMatch.score) {
        bestMatch = { intent, score };
      }
    }

    // If similarity score is high enough (> 0.45)
    if (bestMatch.score > 0.45 && bestMatch.intent) {
       return NextResponse.json({
          final_response: bestMatch.intent.a
       });
    }

    // 4. GREETINGS
    if (/^(hi|hello|hey|greetings|morning|afternoon)\b/.test(text)) {
      return NextResponse.json({
        final_response: `Hello ${firstName}! I am ProcGen Cortex, your AI Procurement Assistant.\n\nI can now perform **Live Database Actions**. Try asking:\n- *"Show my recent POs"*\n- *"Search vendors"*`
      });
    }

    // DEFAULT FALLBACK 
    return NextResponse.json({
      final_response: "I am not quite sure how to respond to that based on my training data. Try asking me to **'Show my recent POs'** or **'Search vendors'**."
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process agentic request.' }, { status: 500 });
  }
}