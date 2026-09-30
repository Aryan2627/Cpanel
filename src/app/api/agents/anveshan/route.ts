
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

    // 1. Fetch the Intake Request
    const intake = await prisma.intake.findUnique({
      where: { id: intakeId }
    });

    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    let extractedKeywords: string[] = ['hardware', 'services']; // Fallback

    // 2. Determine which AI provider the user set up (Nvidia vs OpenAI)
    const nvidiaKey = process.env.NVIDIA_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const apiKey = nvidiaKey || openaiKey;

    if (apiKey) {
      const baseURL = nvidiaKey ? 'https://integrate.api.nvidia.com/v1' : undefined;
      const modelName = nvidiaKey ? 'meta/llama-3.1-70b-instruct' : 'gpt-4o';
      
      const openai = new OpenAI({ apiKey, baseURL });

      try {
        // AI Execution: Extract core parameters from the intake title/description
        const promptText = `
          You are an expert Procurement Agent. Read the following procurement request and extract 3 to 5 core keyword categories that represent what the buyer is looking for.
          Return ONLY a valid JSON object in this exact format: { "keywords": ["keyword1", "keyword2", "keyword3"] }
          Do not return markdown or any other text.
          
          Procurement Request Title: "${intake.title || 'General Office Supplies'}"
          Procurement Request Type: "${intake.type}"
        `;

        const completion = await openai.chat.completions.create({
          model: modelName,
          messages: [{ role: 'user', content: promptText }],
          temperature: 0.2,
        });

        const rawJson = completion.choices[0]?.message?.content?.trim() || '';
        
        // Clean up markdown code blocks if the model accidentally wrapped it
        const cleanedJson = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const parsed = JSON.parse(cleanedJson);
        if (parsed.keywords && Array.isArray(parsed.keywords)) {
          extractedKeywords = parsed.keywords;
        }
      } catch (aiError) {
        console.error("AI processing failed, falling back to basic extraction:", aiError);
        extractedKeywords = intake.title ? intake.title.split(' ') : ['hardware'];
      }
    } else {
      console.warn("No NVIDIA_API_KEY or OPENAI_API_KEY found. Using fallback extraction.");
      extractedKeywords = intake.title ? intake.title.split(' ') : ['hardware'];
    }
    
    // 3. Search and Score Suppliers based on AI findings
    const allVendors = await prisma.vendor.findMany({
      where: { organizationId: orgId },
      take: 10
    });

    const scoredVendors = allVendors.map(vendor => {
      let score = 50; 
      
      // Compliance/Status checks
      if (vendor.status === 'Active' || vendor.status === 'Approved') score += 20;
      if (vendor.taxId) score += 5;
      if (vendor.city) score += 5;

      // AI Context Match: Check if the AI's extracted keywords match the vendor's catalog
      const vendorContext = `${vendor.dealsIn || ''} ${vendor.tags || ''} ${vendor.name || ''}`.toLowerCase();
      let matchCount = 0;
      extractedKeywords.forEach(kw => {
        if (kw.length > 3 && vendorContext.includes(kw.toLowerCase())) {
          matchCount++;
        }
      });
      
      score += (matchCount * 10); // +10 points for every AI keyword matched

      // Normalize and add slight deterministic variance for demo rounding
      score = Math.min(99, score + (vendor.name?.length || 0) % 5);

      let tier = 'Standard';
      if (score >= 90) tier = 'Gold Tier ↑';
      else if (score >= 75) tier = 'Silver Tier';

      return {
        vendorId: vendor.id,
        vendorName: vendor.name || 'Unknown Vendor',
        score,
        tier
      };
    });

    // Sort by best match
    scoredVendors.sort((a, b) => b.score - a.score);

    // Return the completed AI Agent action
    return NextResponse.json({
      success: true,
      agentId: 'anveshan',
      intakeProcessed: intake.refId,
      aiExtractionUsed: !!apiKey,
      extractedSpecs: extractedKeywords,
      suppliersIdentified: scoredVendors.length,
      topMatches: scoredVendors.slice(0, 3)
    });

  } catch (error: any) {
    console.error("Agent Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
