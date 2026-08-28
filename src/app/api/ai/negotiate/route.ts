import { NextResponse } from 'next/server';

const NVIDIA_API_KEY = "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";
const BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const { productName, targetPrice, maxPrice, concessions, vendorInitialOffer } = context;

    const systemPrompt = {
      role: "system",
      content: `You are ProcGen Agent Alpha, an elite autonomous procurement negotiator representing a corporate buyer. 
Your goal is to buy: ${productName}. 
The vendor (who you are talking to) initially offered $${vendorInitialOffer.toLocaleString()}. 
Your absolute maximum budget is $${maxPrice.toLocaleString()}. Your target is $${targetPrice.toLocaleString()}. 
You are authorized to offer the following concessions: ${concessions.join(', ')} ONLY IF the vendor agrees to a price closer to your target.
Be extremely professional, concise, and firm. 
NEVER reveal your exact maximum budget immediately. Negotiate aggressively but politely. Focus solely on the ${productName}.
If the vendor agrees to a price at or below $${maxPrice.toLocaleString()}, you must explicitly say "CONTRACT SECURED" in your final message to signal the system.`
    };

    const payload = {
      model: "nvidia/nemotron-3-nano-30b-a3b",
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    };

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("NVIDIA API ERROR:", err);
      return NextResponse.json({ error: "Failed to connect to AI" }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices[0].message.content 
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
