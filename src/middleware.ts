
'use server';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  
  console.log(`[middleware] Path: ${pathname}, Session Cookie: ${sessionCookie ? 'Exists' : 'None'}`);

  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isAuthRoute = ['/login', '/signup', '/confirm-email', '/forgot-password', '/reset-password'].some(p => pathname.startsWith(p));
  const isPublicRoute = pathname === '/';

  if (sessionCookie) {
    if (isAuthRoute || isPublicRoute) {
      console.log('[middleware] User is logged in, redirecting from auth/public route to /dashboard.');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else {
    if (isProtectedRoute) {
        console.log('[middleware] User is not logged in and trying to access a protected route. Redirecting to /login.');
        return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - api (API routes)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|api|favicon.ico).*)',
  ],
};
