import { NextResponse } from 'next/server';

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

    const apiKeyNvidia = process.env.NITI_API_KEY || process.env.NVIDIA_API_KEY;
    const apiKeyOpenAi = process.env.OPENAI_API_KEY;

    let baseUrl = "https://api.openai.com/v1/chat/completions";
    let model = "gpt-4o-mini";
    let apiKeyToUse = apiKeyOpenAi;

    // Prefer NVIDIA if explicitly provided
    if (apiKeyNvidia && apiKeyNvidia.startsWith('nvapi-')) {
      baseUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      model = "nvidia/nemotron-3-nano-30b-a3b";
      apiKeyToUse = apiKeyNvidia;
    } else if (!apiKeyOpenAi) {
      // Hardcoded fallback ONLY if absolutely no keys are provided
      baseUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      model = "nvidia/nemotron-3-nano-30b-a3b";
      apiKeyToUse = null;
    }

    if (!apiKeyToUse) {
      return NextResponse.json({ error: "No API key configured for Niti Negotiation Agent" }, { status: 500 });
    }

    const payload = {
      model: model,
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    };

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKeyToUse}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("AI NEGOTIATION API ERROR:", err);
      // Fallback to mock response if API fails to prevent UI from breaking
      return NextResponse.json({ 
        reply: `Subject: Counter-Offer for ${productName}\n\nDear Vendor,\n\nThank you for your initial quote of $${vendorInitialOffer.toLocaleString()}. After reviewing our budget, our maximum allowable threshold is $${maxPrice.toLocaleString()}, though we are targeting $${targetPrice.toLocaleString()}.\n\nIf you can meet this pricing, we are authorized to offer the following concessions: ${concessions.join(', ')}.\n\nPlease let us know if we have a deal.\n\nRegards,\nProcGen Niti Agent`
      });
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
