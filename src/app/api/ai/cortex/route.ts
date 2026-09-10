import { NextResponse } from 'next/server';
import intents from '../../../../data/intents.json';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // Simulate API delay for realism
    await new Promise(r => setTimeout(r, 600));
    
    const text = prompt.toLowerCase();

    // 1. INVENTORY WORKFLOW (Original Agentic Demo)
    if (text.includes('inventory') || text.includes('laptop') || text.includes('replenish') || text.includes('order')) {
      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "I need to check the current inventory levels for Laptops in the database." },
          { step: 2, action: "EXECUTE_TOOL", tool: "check_inventory", args: { product: "MacBook Pro 16-inch" }, result: "Inventory Level: 2 (CRITICAL). Reorder threshold is 5." },
          { step: 3, action: "THINKING", message: "Inventory is critically low. I need to find the best approved vendor for MacBooks." },
          { step: 4, action: "EXECUTE_TOOL", tool: "search_vendors", args: { category: "Hardware", product: "MacBook" }, result: "Vendor Found: TechCorp Inc. (Approved). Pre-negotiated rate: $2,100 per unit." },
          { step: 5, action: "THINKING", message: "I will draft a Purchase Request for 10 units to restore inventory above the threshold." },
          { step: 6, action: "EXECUTE_TOOL", tool: "draft_purchase_request", args: { vendorId: "V-902", quantity: 10, totalCost: 21000, urgency: "High" }, result: "SUCCESS: Purchase Request #PR-8890 created." }
        ],
        final_response: "I detected a critical shortage of MacBooks (only 2 left in stock). I have autonomously selected our preferred vendor, TechCorp Inc, and drafted Purchase Request #PR-8890 for 10 new units at $21,000. It is ready for your 1-click approval."
      });
    }

    // 2. VENDOR ANALYSIS MOCK
    if (text.includes('vendor') || text.includes('analyze')) {
      return NextResponse.json({
        agentic_loop: [
          { step: 1, action: "THINKING", message: "Fetching vendor profile and compliance data..." },
          { step: 2, action: "EXECUTE_TOOL", tool: "get_vendor_data", args: { query: text }, result: "Vendor Data loaded." }
        ],
        final_response: "Based on my analysis, this vendor is highly reliable. They hold an active ISO 27001 certification, boast an excellent ESG score of 85, and maintain a 99.9% SLA compliance rate. I see no risks in proceeding with them."
      });
    }

    // 3. GREETINGS (Fallback for simple hi/hello)
    if (/^(hi|hello|hey|greetings|morning|afternoon)\b/.test(text)) {
      return NextResponse.json({
        final_response: "Hello there! I am ProcGen Cortex, your AI Procurement Assistant. I am ready to process normal conversations, answer questions, or execute complex workflows like 'Check laptop inventory'."
      });
    }

    // 4. CAPABILITIES
    if (text.includes('what can you do') || text.includes('help') || text.includes('capabilities')) {
      return NextResponse.json({
        final_response: "I am designed to automate procurement tasks. Currently, I can:\n\n1. Monitor and auto-replenish low inventory.\n2. Evaluate vendor bids and compliance.\n3. Draft Purchase Requests autonomously.\n\nTry saying: *'Check laptop inventory'* to see me in action."
      });
    }

    // 5. MATCH AGAINST USER PROVIDED DATASET
    for (const intent of intents) {
      if (text.includes(intent.q) || (intent.q === 'resume' && text.includes('resume')) || (intent.q === 'interview' && text.includes('interview'))) {
         return NextResponse.json({
            final_response: intent.a
         });
      }
    }

    // DEFAULT FALLBACK 
    return NextResponse.json({
      final_response: "I am not quite sure how to respond to that based on my training data. Try asking me about my capabilities, like 'Check laptop inventory', or asking a question like 'Why do websites use databases?'"
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process agentic request.' }, { status: 500 });
  }
}