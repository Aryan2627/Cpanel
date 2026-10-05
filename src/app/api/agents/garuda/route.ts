import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getTenantId } from '../../../../lib/tenant';
import { getContextRulesForAgent } from '../../../../lib/contextStudio';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const orgId = await getTenantId();
    if (!orgId || orgId === '__unauthenticated__') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { targetId, targetType, targetContent } = await req.json(); // targetType: 'PO' | 'CONTRACT'

    let contentToAnalyze = targetContent;

    if (targetType === 'PO' && targetId) {
      const po = await prisma.purchaseOrder.findUnique({ where: { id: targetId } });
      if (!po) return NextResponse.json({ error: 'PO not found' }, { status: 404 });
      contentToAnalyze = `Purchase Order ${po.refId}\nTitle: ${po.title}\nTotal Amount: ${po.total}\nSupplier: ${po.vendorName}\nStatus: ${po.status}\nDetails: ${JSON.stringify(po)}`;
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

You must return a raw JSON object evaluating the document's compliance with exactly these fields:
{
  "isCompliant": boolean, // true if it passes all critical compliance rules, false if there are major violations
  "riskLevel": "Low" | "Medium" | "High",
  "summary": "2-3 sentences summarizing your findings",
  "violations": [
    "List of any specific compliance violations found"
  ],
  "recommendations": [
    "List of actions the user should take to fix the compliance issues"
  ]
}
Output ONLY valid JSON without markdown wrapping.`;

    const llmPromise = openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Document to analyze:\n\n${contentToAnalyze}` }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000));
    const result: any = await Promise.race([llmPromise, timeoutPromise]);

    if (result && result.choices && result.choices[0]) {
      let rawContent = result.choices[0].message.content.trim();
      
      const startIdx = rawContent.indexOf('{');
      const endIdx = rawContent.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        rawContent = rawContent.substring(startIdx, endIdx + 1);
      }

      try {
        const parsed = JSON.parse(rawContent);
        
        // Log the scan in TokenLedger / Audit
        await prisma.tokenLedger.create({
          data: {
            organizationId: orgId,
            action: 'Garuda Compliance Scan',
            tokensConsumed: 1,
            actorEmail: 'system',
            entityRef: targetId || 'MANUAL_SCAN'
          }
        });

        return NextResponse.json({ success: true, report: parsed });
      } catch (e) {
        console.error("Garuda JSON parse error:", rawContent);
        return NextResponse.json({ error: 'Failed to parse AI compliance report.' }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Garuda timed out during compliance scanning.' }, { status: 504 });
  } catch (error: any) {
    console.error('Garuda API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
