import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Mock Exchange Rates against USD as the base currency
    const rates = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      INR: 83.15,
      JPY: 151.20,
      AUD: 1.54,
      CAD: 1.36,
      SGD: 1.35
    };
    return NextResponse.json(rates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
