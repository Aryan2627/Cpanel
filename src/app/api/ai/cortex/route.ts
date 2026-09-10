import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    
    // Simulate API delay for realism
    await new Promise(r => setTimeout(r, 1000));
    
    const text = prompt.toLowerCase();
    const isInventoryCheck = text.includes('inventory') || text.includes('laptop') || text.includes('replenish') || text.includes('order');

    if (isInventoryCheck) {
      return NextResponse.json({
        agentic_loop: [
          {
            step: 1,
            action: "THINKING",
            message: "I need to check the current inventory levels for Laptops in the database."
          },
          {
            step: 2,
            action: "EXECUTE_TOOL",
            tool: "check_inventory",
            args: { product: "MacBook Pro 16-inch" },
            result: "Inventory Level: 2 (CRITICAL). Reorder threshold is 5."
          },
          {
            step: 3,
            action: "THINKING",
            message: "Inventory is critically low. I need to find the best approved vendor for MacBooks."
          },
          {
            step: 4,
            action: "EXECUTE_TOOL",
            tool: "search_vendors",
            args: { category: "Hardware", product: "MacBook" },
            result: "Vendor Found: TechCorp Inc. (Approved). Pre-negotiated rate: $2,100 per unit."
          },
          {
            step: 5,
            action: "THINKING",
            message: "I will draft a Purchase Request for 10 units to restore inventory above the threshold."
          },
          {
            step: 6,
            action: "EXECUTE_TOOL",
            tool: "draft_purchase_request",
            args: { vendorId: "V-902", quantity: 10, totalCost: 21000, urgency: "High" },
            result: "SUCCESS: Purchase Request #PR-8890 created."
          }
        ],
        final_response: "I detected a critical shortage of MacBooks (only 2 left in stock). I have autonomously selected our preferred vendor, TechCorp Inc, and drafted Purchase Request #PR-8890 for 10 new units at $21,000. It is ready for your 1-click approval."
      });
    }

    return NextResponse.json({
      agentic_loop: [
        { step: 1, action: "THINKING", message: "Analyzing request intent..." }
      ],
      final_response: "I am ProcGen Cortex. I didn't recognize that specific autonomous workflow. Try asking me to 'check laptop inventory and reorder'."
    });

  } catch (error) {
    return NextResponse.json({ error: 'Failed to process agentic request.' }, { status: 500 });
  }
}