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
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';
import { getContextRulesForAgent } from '../../../../lib/contextStudio';
import OpenAI from 'openai';
import { safeParseJsonFromLLM } from '../../../../lib/safeJsonParse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Handles incoming POST requests for this route.
 * Parses the payload, performs necessary validations, and writes to the database.
 */
export async function POST(req: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetId, targetType, targetContent } = await req.json();

    let contentToAnalyze = targetContent;

    if (targetType === 'PO' && targetId) {
      const po = await prisma.purchaseOrder.findUnique({ where: { id: targetId } });
      if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404 });
      contentToAnalyze = `Purchase Order ${po.refId}\nTitle: ${po.title}\nTotal Amount: ${po.total}\nSupplier: ${po.vendorName}\nStatus: ${po.status}`;
    }

    if (!contentToAnalyze) {
      return NextResponse.json({ error: 'No content provided for compliance analysis' }, { status: 400 });
    }

    const contextRules = await getContextRulesForAgent(orgId, 'Garuda');

    const apiKey = process.env.GARUDA_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Garuda API Key is missing. Cannot perform compliance scan.' }, { status: 500 });
    }

    const isNvidia = apiKey.startsWith('nvapi-') || !!process.env.NVIDIA_API_KEY;
    const baseURL = isNvidia ? 'https://integrate.api.nvidia.com/v1' : undefined;
    const modelName = isNvidia ? 'meta/llama-3.2-3b-instruct' : 'gpt-4o-mini';
    const openai = new OpenAI({ apiKey, baseURL });

    const systemPrompt = `You are Garuda, the Contract & Compliance agent.
Your job is to read the provided document (Contract, PO, or Invoice) and check it against the organization's compliance rules.

${contextRules}

Return a raw JSON object with exactly these keys:
{
  "isCompliant": boolean,
  "riskLevel": "Low" | "Medium" | "High",
  "summary": "2-3 sentences",
  "violations": ["violation 1", "violation 2"],
  "recommendations": ["action 1", "action 2"]
}
Output ONLY valid JSON without markdown wrapping.`;

    // Uses safeParseJsonFromLLM which auto-retries up to 3x on bad JSON
    const parsed = await safeParseJsonFromLLM<{
      isCompliant: boolean;
      riskLevel: string;
      summary: string;
      violations: string[];
      recommendations: string[];
    }>(openai, modelName, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Document to analyze:\n\n${contentToAnalyze}` }
    ], { temperature: 0.1, max_tokens: 500, timeoutMs: 15000 });

    if (!parsed) {
      return NextResponse.json({ error: 'Garuda compliance scan failed after retries. The AI returned invalid data.' }, { status: 500 });
    }

    // Log token consumption (non-blocking)
    prisma.tokenLedger.create({
      data: {
        organizationId: orgId,
        action: 'Garuda Compliance Scan',
        tokensConsumed: 1,
        actorEmail: 'system',
        entityRef: targetId || 'MANUAL_SCAN'
      }
    }).catch(console.error);

    return NextResponse.json({ success: true, report: parsed });
  } catch (error: any) {
    console.error('Garuda API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
