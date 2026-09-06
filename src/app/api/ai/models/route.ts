import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) return NextResponse.json({ error: 'No key' });
  const res = await fetch('https://api.groq.com/openai/v1/models', {
    headers: { 'Authorization': 'Bearer ' + groqKey }
  });
  const data = await res.json();
  return NextResponse.json(data);
}