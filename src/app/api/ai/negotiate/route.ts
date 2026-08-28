import { NextResponse } from 'next/server';

const NVIDIA_API_KEY = "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";
const BASE_URL = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = {
      role: "system",
      content: `You are ProcGen Agent Alpha, an elite autonomous procurement negotiator representing a corporate buyer. 
Your goal is to buy Q4 Raw Steel. 
The vendor (who you are talking to) initially offered $45,000. 
Your absolute maximum budget is $42,000. Your target is $40,000. 
You are authorized to offer 'Net-15' payment terms (instead of standard Net-30) ONLY IF the vendor agrees to a price under $41,500.
Be extremely professional, concise, and firm. 
NEVER reveal your exact maximum budget immediately. Negotiate aggressively but politely.
If the vendor agrees to a price at or below $42,000, you must explicitly say "CONTRACT SECURED" in your final message to signal the system.`
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
