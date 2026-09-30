
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const orgId = await getTenantId();
    const { intakeId } = await req.json();

    if (!intakeId) {
      return NextResponse.json({ error: 'intakeId is required' }, { status: 400 });
    }

    const intake = await prisma.intake.findUnique({
      where: { id: intakeId }
    });

    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = nvidiaKey || openaiKey;

    let aiResult = {
      keywords: intake.title ? intake.title.split(' ') : ['hardware'],
      marketAnalysis: "Standard market conditions apply. Based on historical POs, lead times average 14 days.",
      webDiscoveries: [
        { name: "GlobalTech Solutions", url: "globaltech.example.com", reason: "Leading supplier of enterprise hardware based on web search." }
      ],
      rfiDraft: `Subject: Request for Information - ${intake.title || 'Procurement'}\n\nHello,\n\nWe are currently sourcing for the above requirement. Please provide your capabilities and pricing.\n\nRegards,\nProcurement Team`
    };

    if (apiKey) {
      const baseURL = nvidiaKey ? 'https://integrate.api.nvidia.com/v1' : undefined;
      const modelName = nvidiaKey ? 'meta/llama-3.1-70b-instruct' : 'gpt-4o';
      
      const openai = new OpenAI({ apiKey, baseURL });

      try {
        const promptText = `
          You are an elite Autonomous Procurement Agent (Level 4). 
          The buyer submitted this Intake Request: "${intake.title || 'General Equipment'}" (Type: ${intake.type}).

          Perform the following advanced tasks:
          1. Extract 3-5 core search keywords representing the product/service needed.
          2. Act as a Historical Vector Database: Write a 2-sentence "marketAnalysis" warning about historical lead times or risks for this specific product category.
          3. Global Sourcing Expert: Using your vast knowledge of real-world global supply chains, identify 2 ACTUAL, REAL-WORLD global suppliers or manufacturers that specialize in providing exactly what the buyer is asking for. Do NOT invent these. Provide their actual company names and their actual real-world website URLs. (e.g., if they ask for enterprise laptops, return real companies like Dell, Lenovo, or CDW).
          4. Draft a short, highly professional RFI (Request for Information) email to send to these global vendors.

          CRITICAL: You must output ONLY a raw JSON object. Do not wrap it in backticks, do not write 'json', and do not include any introductory or concluding text. Just the raw { object } starting with an opening brace.
          Return ONLY a valid JSON object matching this exact schema:
          {
            "keywords": ["..."],
            "marketAnalysis": "...",
            "webDiscoveries": [{ "name": "...", "url": "...", "reason": "..." }],
            "rfiDraft": "..."
          }
        `;

        const completion = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
          max_tokens: 1500
        });

        const rawJson = completion.choices[0]?.message?.content?.trim() || '';
        
        const startIdx = rawJson.indexOf('{');
        const endIdx = rawJson.lastIndexOf('}');
        
        if (startIdx !== -1 && endIdx !== -1) {
          const jsonOnly = rawJson.substring(startIdx, endIdx + 1);
          const parsed = JSON.parse(jsonOnly);
          
          if (parsed.keywords && Array.isArray(parsed.keywords)) {
             aiResult.keywords = parsed.keywords;
          }
          if (parsed.marketAnalysis) aiResult.marketAnalysis = parsed.marketAnalysis;
          if (parsed.webDiscoveries && Array.isArray(parsed.webDiscoveries)) {
             aiResult.webDiscoveries = parsed.webDiscoveries;
          }
          if (parsed.rfiDraft) aiResult.rfiDraft = parsed.rfiDraft;
        } else {
          aiResult.marketAnalysis = "⚠️ AI FAILED TO RETURN JSON. Raw Output was: " + rawJson;
        }

      } catch (aiError: any) {
        aiResult.marketAnalysis = "⚠️ NVIDIA API CRASHED: " + (aiError.message || String(aiError));
      }
    } else {
      aiResult.marketAnalysis = "⚠️ NO API KEY FOUND IN VERCEL. Please check your Vercel Environment Variables.";
    }
    
    // Internal Supplier Search
    const allVendors = await prisma.vendor.findMany({
      where: { organizationId: orgId },
      take: 10
    });

    const scoredVendors = allVendors.map(vendor => {
      let score = 50; 
      if (vendor.status === 'Active' || vendor.status === 'Approved') score += 20;
      if (vendor.taxId) score += 5;
      if (vendor.city) score += 5;

      const vendorContext = `${vendor.dealsIn || ''} ${vendor.tags || ''} ${vendor.name || ''}`.toLowerCase();
      let matchCount = 0;
      aiResult.keywords.forEach((kw: string) => {
        if (kw.length > 3 && vendorContext.includes(kw.toLowerCase())) matchCount++;
      });
      
      score += (matchCount * 10);
      score = Math.min(99, score + (vendor.name?.length || 0) % 5);

      return {
        vendorId: vendor.id,
        vendorName: vendor.name || 'Unknown Vendor',
        score,
        tier: score >= 90 ? 'Gold Tier ↑' : (score >= 75 ? 'Silver Tier' : 'Standard')
      };
    });
    scoredVendors.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      agentId: 'anveshan',
      intakeProcessed: intake.refId,
      aiExtractionUsed: !!apiKey,
      extractedSpecs: aiResult.keywords,
      marketAnalysis: aiResult.marketAnalysis,
      webDiscoveries: aiResult.webDiscoveries,
      rfiDraft: aiResult.rfiDraft,
      internalSuppliersFound: scoredVendors.length,
      topMatches: scoredVendors.slice(0, 3)
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
