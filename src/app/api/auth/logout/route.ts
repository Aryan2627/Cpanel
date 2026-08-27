import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the custom JWT cookie
  response.cookies.set('proc-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  // Clear NextAuth cookies just in case they are still used
  response.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' });
  response.cookies.set('next-auth.csrf-token', '', { maxAge: 0, path: '/' });
  response.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0, path: '/' });

  return response;
}
