import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { getTokenFromRequest, verifyToken } from '@/lib/auth';

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/register', '/admin-login', '/api/auth'];

// Student routes that require authentication
const studentRoutes = ['/dashboard', '/learn'];

// Admin routes that require admin role
const adminRoutes = ['/admin'];

/**
 * Check if a path matches any route pattern
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

/**
 * Check if a path is an API route
 */
function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api');
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = getTokenFromRequest(request);

  // Allow public routes
  if (matchesRoute(pathname, publicRoutes)) {
    // If user is already authenticated and tries to access auth pages, redirect to dashboard
    if (
      token &&
      (pathname === '/login' || pathname === '/register' || pathname === '/admin-login')
    ) {
      try {
        const payload = verifyToken(token);
        // Redirect based on role
        if (payload.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Token invalid, allow access to auth pages
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Handle API routes
  if (isApiRoute(pathname)) {
    // Public API routes (auth endpoints)
    if (
      pathname.startsWith('/api/auth/login') ||
      pathname.startsWith('/api/auth/register') ||
      pathname.startsWith('/api/auth/admin-login')
    ) {
      return NextResponse.next();
    }

    // Protected API routes require token
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const payload = verifyToken(token);

      // Admin-only API routes
      if (
        pathname.startsWith('/api/admin') ||
        (pathname.startsWith('/api/courses') && request.method !== 'GET')
      ) {
        if (payload.role !== 'admin') {
          return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
        }
      }

      // Add user info to request headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  }

  // Handle admin routes
  if (matchesRoute(pathname, adminRoutes)) {
    if (!token) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    try {
      const payload = verifyToken(token);
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Handle student routes
  if (matchesRoute(pathname, studentRoutes)) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      verifyToken(token);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Default: allow access (for other routes not explicitly defined)
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
