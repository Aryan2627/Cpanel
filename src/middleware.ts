import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Support both legacy tokens and the new proc-session JWT token
  const token = request.cookies.get('auth_token')?.value;
  const procSession = request.cookies.get('proc-session')?.value;
  const nextAuthSession = request.cookies.get('next-auth.session-token')?.value 
    || request.cookies.get('__Secure-next-auth.session-token')?.value;

  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/client') ||
    request.nextUrl.pathname.startsWith('/vendor');

  // Allow if any of the valid session cookies exist
  if (isProtectedRoute && !token && !procSession && !nextAuthSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*', '/vendor/:path*'],
};
