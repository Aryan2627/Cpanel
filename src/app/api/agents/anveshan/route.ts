
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const orgId = await getTenantId();
    const { intakeId } = await req.json();

    if (!intakeId) {
      return NextResponse.json({ error: 'intakeId is required' }, { status: 400 });
    }

    // 1. "Parse incoming requisitions"
    const intake = await prisma.intake.findUnique({
      where: { id: intakeId }
    });

    if (!intake) {
      return NextResponse.json({ error: 'Intake not found' }, { status: 404 });
    }

    // Agent extraction simulation (In a real setup with OpenAI: const specs = await generateObject({...}))
    const extractedKeywords = intake.title ? intake.title.split(' ') : ['hardware', 'services'];
    
    // 2. "Identify capable suppliers" 
    // Here we query the Vector DB / Prisma for vendors matching the extracted keywords
    const allVendors = await prisma.vendor.findMany({
      where: { organizationId: orgId },
      take: 10
    });

    // 3. "Rank by qualification score"
    // Calculate a dynamic score based on AI multi-variable reasoning
    const scoredVendors = allVendors.map(vendor => {
      // Deterministic simulation for demo (in reality, LLM scores this)
      let score = 50; 
      if (vendor.status === 'Active' || vendor.status === 'Approved') score += 25;
      if (vendor.dealsIn && extractedKeywords.some(kw => vendor.dealsIn?.toLowerCase().includes(kw.toLowerCase()))) score += 15;
      if (vendor.taxId) score += 5;
      if (vendor.city) score += 3;

      // Add slight randomness to simulate different match tiers
      score = Math.min(99, score + Math.floor(Math.random() * 5));

      let tier = 'Standard';
      if (score >= 90) tier = 'Gold Tier ↑';
      else if (score >= 80) tier = 'Silver Tier';

      return {
        vendorId: vendor.id,
        vendorName: vendor.name || 'Unknown Vendor',
        score,
        tier
      };
    });

    // Sort by best match
    scoredVendors.sort((a, b) => b.score - a.score);

    // Return the agent's work!
    return NextResponse.json({
      success: true,
      agentId: 'anveshan',
      intakeProcessed: intake.refId,
      extractedSpecs: extractedKeywords,
      suppliersIdentified: scoredVendors.length,
      topMatches: scoredVendors.slice(0, 3) // Return top 3
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
