import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware now focuses on security and common headers
// Actual routing is handled by next.config.js rewrites for better hydration compatibility

export function middleware(request: NextRequest) {
  // Add debug logging
  console.log('Middleware triggered for path:', request.nextUrl.pathname);
  console.log('Hostname:', request.headers.get('host'));
  
  // We'll use this middleware for future auth/security needs
  // But for now, the routing is handled by next.config.js
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 