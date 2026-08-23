import { NextResponse } from 'next/server';

// Cache exchange rates for 10 minutes
let ratesCache: { rates: Record<string, number>; updatedAt: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (ratesCache && now - ratesCache.updatedAt < CACHE_TTL) {
      return NextResponse.json({ rates: ratesCache.rates, cached: true, updatedAt: ratesCache.updatedAt });
    }

    // Free API - no key needed for basic use
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();

    ratesCache = { rates: data.rates, updatedAt: now };
    return NextResponse.json({ rates: data.rates, cached: false, updatedAt: now });
  } catch {
    // Return fallback static rates if API fails
    const fallback: Record<string, number> = { USD: 1, INR: 83.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SGD: 1.35 };
    return NextResponse.json({ rates: fallback, cached: false, updatedAt: Date.now(), fallback: true });
  }
}
