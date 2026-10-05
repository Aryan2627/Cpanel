/**
 * safeJsonParse.ts
 * Wraps LLM JSON output with up to 3 retry attempts.
 * On each failure, sends the broken output back to the LLM asking it to fix the JSON.
 */

import OpenAI from 'openai';

export async function safeParseJsonFromLLM<T>(
  openai: OpenAI,
  model: string,
  messages: OpenAI.Chat.ChatCompletionMessageParam[],
  options: { temperature?: number; max_tokens?: number; timeoutMs?: number } = {}
): Promise<T | null> {
  const { temperature = 0.1, max_tokens = 500, timeoutMs = 12000 } = options;
  const maxRetries = 3;

  let lastRaw = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const msgs: OpenAI.Chat.ChatCompletionMessageParam[] = [...messages];

    // On retry, append the broken output and ask LLM to fix it
    if (attempt > 1 && lastRaw) {
      msgs.push({
        role: 'assistant',
        content: lastRaw
      });
      msgs.push({
        role: 'user',
        content: `Your previous response was not valid JSON. Fix it and return ONLY valid JSON with no markdown, no explanation, no trailing commas. Output ONLY the JSON object.`
      });
    }

    try {
      const llmPromise = openai.chat.completions.create({
        model,
        messages: msgs,
        temperature,
        max_tokens
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
      const result: any = await Promise.race([llmPromise, timeoutPromise]);

      if (!result || !result.choices?.[0]?.message?.content) {
        console.warn(`[safeJsonParse] Attempt ${attempt}: LLM timed out or returned empty`);
        continue;
      }

      lastRaw = result.choices[0].message.content.trim();

      // Strip markdown code fences if present
      const cleaned = lastRaw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

      // Extract first {...} block
      const start = cleaned.indexOf('{');
      const end = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) {
        console.warn(`[safeJsonParse] Attempt ${attempt}: No JSON object found in response`);
        lastRaw = cleaned;
        continue;
      }

      const jsonStr = cleaned.substring(start, end + 1);
      const parsed = JSON.parse(jsonStr) as T;
      return parsed;
    } catch (err) {
      console.warn(`[safeJsonParse] Attempt ${attempt} failed:`, err instanceof Error ? err.message : err);
    }
  }

  console.error(`[safeJsonParse] All ${maxRetries} attempts failed. Returning null.`);
  return null;
}
