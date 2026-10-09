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
export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ reply: 'I did not catch that.' });

    const orgId = await getTenantId();
    
    // Check for hardcoded easter eggs first (to preserve old functionality)
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('lockdown')) return NextResponse.json({ reply: 'Executing emergency system lockdown protocol.', action: { type: 'UI_EFFECT', payload: 'LOCKDOWN' } });
    if (lowerMessage.includes('crash')) return NextResponse.json({ reply: 'WARNING: Initiating forced memory leak...', action: { type: 'UI_EFFECT', payload: 'CRASH' } });
    
    // Fetch live data to feed into the LLM context
    const [vendorCount, eventCount, latestMemories, contextRules] = await Promise.all([
      prisma.vendor.count({ where: { organizationId: orgId } }),
      prisma.event.count({ where: { organizationId: orgId } }),
      prisma.jarvisMemory.findMany({ where: { organizationId: orgId }, orderBy: { createdAt: 'desc' }, take: 3 }),
      getContextRulesForAgent(orgId, 'Jarvis')
    ]);

    const memoryContext = latestMemories.length > 0 
      ? latestMemories.map(m => `- ${m.context} (${m.entityRef})`).join('\n')
      : 'No recent memories.';

    // Setup LLM
    const apiKey = process.env.JARVIS_API_KEY || process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ reply: `(No API Key configured for Jarvis). I received: "${message}". Please configure JARVIS_API_KEY to enable my AI brain.` });
    }

    const isNvidia = apiKey.startsWith('nvapi-') || !!process.env.NVIDIA_API_KEY;
    const baseURL = isNvidia ? 'https://integrate.api.nvidia.com/v1' : undefined;
    const modelName = isNvidia ? 'meta/llama-3.2-3b-instruct' : 'gpt-4o-mini';
    const openai = new OpenAI({ apiKey, baseURL });

    const systemPrompt = `You are Jarvis, the central AI assistant for this procurement platform.
Current System Stats:
- Registered Vendors: ${vendorCount}
- Sourcing Events: ${eventCount}
- Recent System Activity/Memories:\n${memoryContext}

${contextRules}

Your goal is to assist the user. You can reply with a conversational response, and optionally trigger a UI action.
Output ONLY a raw JSON object with this structure:
{
  "reply": "Your conversational response",
  "action": { "type": "NAVIGATE" | "NONE", "payload": "/client/target-url" } // Omit action or use type: "NONE" if no navigation is needed
}
For example, if they ask to see vendors, payload can be "/client/vendors". If they ask to see an event EVT-123, payload can be "/client/events/EVT-123".
Output valid JSON only without markdown formatting.`;

    // safeParseJsonFromLLM handles the actual call below
    const parsed = await safeParseJsonFromLLM<{ reply: string; action?: { type: string; payload: string } }>(
      openai, modelName,
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      { temperature: 0.2, max_tokens: 300, timeoutMs: 10000 }
    );
    if (parsed) return NextResponse.json(parsed);
    return NextResponse.json({ reply: "I'm sorry, I couldn't process that right now. Please try again." });
  } catch (error: any) {
    console.error('Jarvis API Error:', error);
    return NextResponse.json({ reply: 'I encountered an error processing your request.' }, { status: 500 });
  }
}
