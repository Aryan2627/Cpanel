import { NextResponse } from 'next/server';

// Step 1: Redirect user to Google's OAuth consent screen
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const source = searchParams.get('source'); // e.g., 'vendor'

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  // Pass the source along to Google so it comes back to us in the callback
  if (source) {
    params.append('state', source);
  }

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
