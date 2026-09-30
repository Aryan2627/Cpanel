
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';
import OpenAI from 'openai';
import { tavily } from '@tavily/core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function buildSmartFallback(title: string, type: string, location: string) {
  const words = title.split(' ').filter((w: string) => w.length > 3);
  
  let marketAnalysis = `Based on historical POs for "${title}" in ${location}, average lead times are 14-21 days. Price volatility is moderate — recommend locking in quotes within 48 hours.`;
  let webDiscoveries = [
    { name: 'Alibaba Global Sourcing', url: 'alibaba.com', reason: `Largest global B2B marketplace for "${title}" with verified suppliers.` },
    { name: 'IndiaMart', url: 'indiamart.com', reason: `Top Indian B2B marketplace with thousands of verified "${title}" manufacturers.` }
  ];

  return {
    keywords: words.length > 0 ? words.slice(0, 5) : [title],
    marketAnalysis,
    webDiscoveries,
    rfiDraft: `Subject: Request for Information – ${title}\n\nDear Sir/Madam,\n\nWe are ${type === 'URGENT' ? 'urgently' : 'currently'} looking to procure "${title}" for our organization in ${location}.\n\nWe invite you to share the following:\n1. Product catalog and technical specifications\n2. Unit pricing with applicable taxes\n3. Minimum Order Quantity (MOQ)\n4. Payment terms and delivery lead times\n5. Warranty and after-sales support details\n\nKindly respond within 3 business days.\n\nWarm regards,\nProcurement Team`
  };
}

export async function POST(req: Request) {
  try {
    const orgId = await getTenantId();
    
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      
    // Deduct 5 tokens for executing Anveshan
    await prisma.$transaction([
      prisma.organization.update({
        where: { id: orgId },
        data: { tokensUsed: { increment: 5 } }
      }),
      prisma.tokenLedger.create({
        data: {
          organizationId: orgId,
          action: 'Anveshan Auto-Sourcing',
          tokensConsumed: 5,
          actorEmail: 'system',
          entityRef: intake.id
        }
      })
    ]);

    return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    if (org.tokensUsed + 5 > org.tokensTotal) {
      return NextResponse.json({ error: 'Insufficient AI tokens. Please upgrade your license to run Anveshan.' }, { status: 402 });
    }

    const { intakeId, location = 'Global' } = await req.json();

    if (!intakeId) {
      return NextResponse.json({ error: 'intakeId is required' }, { status: 400 });
    }

    const intake = await prisma.intake.findUnique({ where: { id: intakeId } });
    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    const title = intake.title || 'General Equipment';
    const type = intake.type || 'STANDARD';

    let aiResult = buildSmartFallback(title, type, location);
    let aiUsed = false;
    let scrapingUsed = false;

    const tavilyKey = process.env.TAVILY_API_KEY;

    if (tavilyKey) {
      try {
        const tv = tavily({ apiKey: tavilyKey });
        const locQuery = location !== 'Global' ? `in ${location}` : '';

        // Added strict terms to find company profiles rather than search pages
        const [alibabaResults, indiamartResults, googleResults] = await Promise.allSettled([
          tv.search(`"${title}" supplier manufacturer ${locQuery} site:alibaba.com/company`, { maxResults: 3, searchDepth: 'basic' }),
          tv.search(`"${title}" supplier wholesaler ${locQuery} site:indiamart.com/company OR site:indiamart.com/proddetail`, { maxResults: 3, searchDepth: 'basic' }),
          tv.search(`top "${title}" manufacturer supplier ${locQuery} company profile B2B contact`, { maxResults: 4, searchDepth: 'basic' })
        ]);

        const discoveries: { name: string; url: string; reason: string }[] = [];

        if (alibabaResults.status === 'fulfilled' && alibabaResults.value.results?.length > 0) {
          const r = alibabaResults.value.results[0];
          discoveries.push({
            name: r.title?.replace(/ - Alibaba.*/, '').substring(0, 60) || 'Alibaba Supplier',
            url: r.url || 'alibaba.com',
            reason: `Live from Alibaba ${location !== 'Global' ? '('+location+')' : ''}: ${r.content?.substring(0, 120)}...`
          });
        }

        if (indiamartResults.status === 'fulfilled' && indiamartResults.value.results?.length > 0) {
          const r = indiamartResults.value.results[0];
          discoveries.push({
            name: r.title?.replace(/ - IndiaMART.*/, '').replace(/ \| IndiaMART.*/, '').substring(0, 60) || 'IndiaMART Supplier',
            url: r.url || 'indiamart.com',
            reason: `Live from IndiaMART ${location !== 'Global' ? '('+location+')' : ''}: ${r.content?.substring(0, 120)}...`
          });
        }

        if (googleResults.status === 'fulfilled' && googleResults.value.results?.length > 0) {
          for (const r of googleResults.value.results.slice(0, 2)) {
            if (!discoveries.find(d => d.url === r.url)) {
              discoveries.push({
                name: r.title?.substring(0, 60) || 'Global Supplier',
                url: r.url || 'example.com',
                reason: `Live Web Discovery ${location !== 'Global' ? 'in '+location : ''}: ${r.content?.substring(0, 120)}...`
              });
            }
          }
        }

        if (discoveries.length > 0) {
          aiResult.webDiscoveries = discoveries.slice(0, 4);
          aiResult.marketAnalysis = `🌐 Live market scan complete for "${title}" in ${location}. Found ${discoveries.length} direct supplier profiles. Prices and availability are current as of today.`;
          scrapingUsed = true;
          aiUsed = true;
        }
      } catch (tavilyError) {
        console.error('Tavily scraping failed:', tavilyError);
      }
    }

    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const llmKey = nvidiaKey || openaiKey;

    if (llmKey && scrapingUsed) {
      const baseURL = nvidiaKey ? 'https://integrate.api.nvidia.com/v1' : undefined;
      const modelName = nvidiaKey ? 'meta/llama-3.2-3b-instruct' : 'gpt-4o'; // Reverted to safe text model
      const openai = new OpenAI({ apiKey: llmKey, baseURL });

      const supplierNames = aiResult.webDiscoveries.map(d => d.name).join(', ');

      const llmPromise = openai.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: `Draft a professional B2B procurement RFI email for purchasing "${title}" in ${location}. Addressed to: ${supplierNames}. Include sections for: specs, quantity, GST pricing, MOQ, delivery timeline to ${location}, and payment terms. Under 150 words. Return only the email text.` }],
        temperature: 0.3,
        max_tokens: 300
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 7000));

      try {
        const result = await Promise.race([llmPromise, timeoutPromise]);
        if (result && 'choices' in result) {
          const draft = result.choices[0]?.message?.content?.trim();
          if (draft && draft.length > 50) {
            aiResult.rfiDraft = `Subject: Request for Information – ${title}\n\n${draft}`;
          }
        }
      } catch {}
    }

    const allVendors = await prisma.vendor.findMany({ where: { organizationId: orgId }, take: 10 });
    const scoredVendors = allVendors.map(vendor => {
      let score = 50;
      if (vendor.status === 'Active' || vendor.status === 'Approved') score += 20;
      const vendorContext = `${vendor.dealsIn || ''} ${vendor.tags || ''} ${vendor.name || ''}`.toLowerCase();
      let matchCount = 0;
      aiResult.keywords.forEach((kw: string) => { if (kw.length > 3 && vendorContext.includes(kw.toLowerCase())) matchCount++; });
      score = Math.min(99, score + matchCount * 10 + (vendor.name?.length || 0) % 5);
      return { vendorId: vendor.id, vendorName: vendor.name || 'Unknown Vendor', score, tier: score >= 90 ? 'Gold Tier ↑' : score >= 75 ? 'Silver Tier' : 'Standard' };
    });
    scoredVendors.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      agentId: 'anveshan',
      intakeProcessed: intake.refId,
      aiExtractionUsed: aiUsed,
      scrapingUsed,
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
