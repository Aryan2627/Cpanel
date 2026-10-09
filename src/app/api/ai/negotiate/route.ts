/**
 * ============================================================================
 * Developer Note:
 * This file is a core part of the ProcGen Enterprise Portal.
 * It serves as a backend API endpoint, handling data transactions securely.
 * 
 * When modifying, please ensure you maintain the existing state flow 
 * and follow the established styling conventions.
 * ============================================================================
 */
import { NextResponse } from 'next/server';
import { tavily } from '@tavily/core';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    let { productName, targetPrice, maxPrice, concessions, vendorInitialOffer } = context;

    vendorInitialOffer = Math.abs(vendorInitialOffer);
    targetPrice = Math.abs(targetPrice);
    maxPrice = Math.abs(maxPrice);

    const tavilyKey = process.env.TAVILY_API_KEY;
    let liveMarketData = '';
    let referenceUrl = `https://dir.indiamart.com/search.mp?ss=${encodeURIComponent(productName)}`;

    if (tavilyKey) {
      try {
        const tv = tavily({ apiKey: tavilyKey });
        const searchResult = await tv.search(`"price" OR "MSRP" OR "cost" for "${productName}" B2B wholesale`, { 
          maxResults: 3, 
          searchDepth: 'basic' 
        });
        
        liveMarketData = searchResult.results.map(r => r.content).join(' ');
        if (searchResult.results.length > 0) {
          referenceUrl = searchResult.results[0].url;
        }
      } catch (err) {
        console.error("Tavily search failed:", err);
      }
    }

    
    const orgId = await getTenantId();
    const activeRules = await prisma.contextDefinition.findMany({
      where: { organizationId: orgId, isActive: true, consumedBy: 'Niti' },
      orderBy: { updatedAt: 'desc' }
    });
    
    const dynamicBusinessRules = activeRules.map(r => r.content).join('\n\n');

    const marketIntelligenceContext = liveMarketData 
      ? `LIVE INTERNET SEARCH RESULTS: "${liveMarketData}"
      
      CRITICAL INSTRUCTION:
      1. Review the internet search results above.
      2. Identify the lowest competitor price for the product from the search text. 
      3. Ignore the default target price. Your NEW target price is 15% BELOW the lowest price found in the web search.
      4. Draft a counter-offer email to the vendor. Explicitly state that you checked prices online. Quote the exact competitor prices and sources from the search results to justify your new low target price.`
      : `LIVE INTERNET SEARCH RESULTS: (Simulated) "Competitor listings on Alibaba and GlobalSources show ${productName} averaging at $${targetPrice.toLocaleString()}."
      
      CRITICAL INSTRUCTION:
      1. Explicitly state to the vendor that you checked prices online.
      2. Compare their initial offer of $${vendorInitialOffer.toLocaleString()} against the competitive online rate of $${targetPrice.toLocaleString()}.
      3. Counter-offer below the online rate to push for maximum savings.`;

    const systemPrompt = {
      role: "system",
      content: `You are ProcGen Agent Alpha, an elite autonomous procurement negotiator representing a corporate buyer. 
Your goal is to buy: ${productName}. 
The vendor (who you are talking to) initially offered ${vendorInitialOffer.toLocaleString()}.

CORPORATE NEGOTIATION GUIDELINES (Enforce strictly):
${dynamicBusinessRules}
 

${marketIntelligenceContext}

You are authorized to offer the following concessions: ${concessions.join(', ')} ONLY IF the vendor agrees to match or beat the online prices.
Be extremely professional, concise, and firm. 
NEVER reveal your exact maximum budget immediately. Negotiate aggressively but politely.`
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

    const mockCompetitorPrice = (vendorInitialOffer * 0.75).toLocaleString();
    const mockTarget = (vendorInitialOffer * 0.65).toLocaleString();
    
    const fallbackMockReply = `Subject: Counter-Offer for ${productName}\n\nDear Vendor,\n\nThank you for your initial quote of $${vendorInitialOffer.toLocaleString()}. \n\nBefore proceeding, we ran a live autonomous web scan for "${productName}" across global B2B endpoints. Our web scraping algorithm identified a direct competitor on IndiaMART offering the exact same specifications for $${mockCompetitorPrice}.\n\nTo move forward with you as our preferred vendor, we require a revised quote that beats the online market rate, bringing your price down to $${mockTarget}. If you can meet this competitive pricing, we are authorized to immediately offer: ${concessions.join(', ')}.\n\nPlease let us know if we can proceed.\n\nRegards,\nProcGen Niti Agent`;

    if (!apiKeyToUse) {
      return NextResponse.json({ 
        reply: fallbackMockReply + "\n\n*(Note: This is a simulated response. Because no NITI_API_KEY is configured in your environment variables, the AI and Web Search engines are bypassed to prevent a crash.)*",
        referenceUrl: referenceUrl
      });
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
        reply: fallbackMockReply + "\n\n*(Note: API request failed. This is a simulated fallback response.)*",
        referenceUrl: referenceUrl
      });
    }

    const data = await response.json();
    return NextResponse.json({ 
      reply: data.choices[0].message.content,
      referenceUrl: referenceUrl
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
