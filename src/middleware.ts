import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Protect admin, client, and vendor routes
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith('/admin') ||
    request.nextUrl.pathname.startsWith('/client') ||
    request.nextUrl.pathname.startsWith('/vendor');

  if (isProtectedRoute && !token) {
    // Redirect to login if accessing a protected route without a token
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*', '/vendor/:path*'],
};
