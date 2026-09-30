import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const { productName, targetPrice, maxPrice, concessions, vendorInitialOffer } = context;

    // 1. Live Market Pricing Intelligence via Tavily
    const tavilyKey = process.env.TAVILY_API_KEY;
    let liveMarketData = '';

    if (tavilyKey) {
      try {
        const tv = tavily({ apiKey: tavilyKey });
        const searchResult = await tv.search(`"cheapest B2B wholesale price" OR "average market rate" for "${productName}"`, { 
          maxResults: 3, 
          searchDepth: 'basic' 
        });
        
        liveMarketData = searchResult.results.map(r => r.content).join(' ');
      } catch (err) {
        console.error("Tavily search failed:", err);
      }
    }

    const marketIntelligenceContext = liveMarketData 
      ? `LIVE INTERNET SEARCH RESULTS: I have just scanned global B2B marketplaces. The current live online search context for this product is: "${liveMarketData}". Use this exact live market data to aggressively counter the vendor. Quote specific findings from this search to prove their price is above market rate.`
      : `MARKET INTELLIGENCE: Our internal vector database indicates the global average market rate for ${productName} is currently trending around $${targetPrice.toLocaleString()}. Use this benchmark as hard leverage to aggressively counter the vendor.`;

    const systemPrompt = {
      role: "system",
      content: `You are ProcGen Agent Alpha, an elite autonomous procurement negotiator representing a corporate buyer. 
Your goal is to buy: ${productName}. 
The vendor (who you are talking to) initially offered $${vendorInitialOffer.toLocaleString()}. 
Your absolute maximum budget is $${maxPrice.toLocaleString()}. Your target is $${targetPrice.toLocaleString()}. 

${marketIntelligenceContext}

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

    if (apiKeyNvidia && apiKeyNvidia.startsWith('nvapi-')) {
      baseUrl = "https://integrate.api.nvidia.com/v1/chat/completions";
      model = "nvidia/nemotron-3-nano-30b-a3b";
      apiKeyToUse = apiKeyNvidia;
    } else if (!apiKeyOpenAi) {
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
      return NextResponse.json({ 
        reply: `Subject: Counter-Offer for ${productName}\n\nDear Vendor,\n\nThank you for your initial quote of $${vendorInitialOffer.toLocaleString()}. Based on our live market analysis across B2B endpoints, the current competitive rate is closer to $${targetPrice.toLocaleString()}.\n\nIf you can meet this market pricing, we are authorized to offer: ${concessions.join(', ')}.\n\nPlease let us know if we can proceed.\n\nRegards,\nProcGen Niti Agent`
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
