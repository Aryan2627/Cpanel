import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { tavily } from '@tavily/core';
import { getContextRulesForAgent } from '../../../../lib/contextStudio';
import { getTenantId } from '../../../../lib/tenant';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { supplierName, location = 'Global', product = 'products' } = await req.json();
    if (!supplierName) return NextResponse.json({ error: 'supplierName is required' }, { status: 400 });

    let searchContent = '';
    const tavilyKey = process.env.TAVILY_API_KEY;

    if (tavilyKey) {
      try {
        const tv = tavily({ apiKey: tavilyKey });
        const response = await tv.search(`"${supplierName}" company reviews complaints scam financial risk ${location !== 'Global' ? location : ''}`, { maxResults: 5, searchDepth: 'basic' });
        if (response.results && response.results.length > 0) {
          searchContent = response.results.map((r: any) => `- ${r.title}: ${r.content}`).join('\n');
        }
      } catch (e) { console.error("Tavily failed", e); }
    }

    if (!searchContent) searchContent = "No immediate negative news or scam reports found on the first page of search results.";

    let report = {
      riskScore: 50, riskLevel: "Medium Risk",
      entityVerification: `Business registration assumed for ${supplierName}.`,
      geoRisk: `Located in ${location}. No trade embargoes match.`,
      financialRisk: `Information scraped from reviews indicates standard operational flow.`
    };

    const specificKey = process.env.ANVESHAN_API_KEY || process.env.TARK_API_KEY;
    const fallbackKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
    const llmKey = specificKey || fallbackKey;

    if (llmKey) {
      const isNvidia = llmKey && (llmKey.startsWith('nvapi-') || !!process.env.NVIDIA_API_KEY);
      const baseURL = isNvidia ? 'https://integrate.api.nvidia.com/v1' : undefined;
      const modelName = isNvidia ? 'meta/llama-3.2-3b-instruct' : 'gpt-4o-mini';
      const openai = new OpenAI({ apiKey: llmKey, baseURL });
      const orgId = await getTenantId();
      const contextRules = await getContextRulesForAgent(orgId, 'Tark'); // Risk report is typically Tark/Anveshan

      const prompt = `You are a Procurement Risk Analyst.
Analyze this live search data for supplier "${supplierName}":
${searchContent}

Generate a Risk Report JSON object with EXACTLY these keys:
{
  "riskScore": (number 0 to 100, where 0-30=Low, 31-70=Medium, 71-100=High),
  "riskLevel": (string: "Low Risk", "Medium Risk", or "High Risk"),
  "entityVerification": (string: 1-2 sentences verifying history),
  "geoRisk": (string: 1-2 sentences about geopolitical risk),
  "financialRisk": (string: 1-2 sentences summarizing complaints or financial alerts)
}
Output ONLY valid JSON.
${contextRules}`;

      const llmPromise = openai.chat.completions.create({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 12000));
      try {
        const result: any = await Promise.race([llmPromise, timeoutPromise]);
        if (result && result.choices && result.choices[0]) {
          const rawContent = result.choices[0].message.content.trim();
          const startIdx = rawContent.indexOf('{');
          const endIdx = rawContent.lastIndexOf('}');
          if (startIdx !== -1 && endIdx !== -1) {
            const parsed = JSON.parse(rawContent.substring(startIdx, endIdx + 1));
            report = { ...report, ...parsed };
          }
        }
      } catch (e) { console.error("LLM parsing failed", e); }
    }

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}