import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware logic for Server Actions requests to avoid breaking action fetches
  // Server Actions set the "Next-Action" header
  const isServerAction = !!(request.headers.get('Next-Action') || request.headers.get('next-action'));
  if (isServerAction) {
    return NextResponse.next();
  }
  
  // Check if user has a session cookie
  const sessionCookie = request.cookies.get('session');
  
  // Routes that require authentication
  const protectedRoutes = ['/company', '/admin'];
  
  // Routes that should redirect to dashboard if already authenticated
  const authRoutes = ['/login'];
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  
  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If accessing auth route with session, redirect to dashboard
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(new URL('/company/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
