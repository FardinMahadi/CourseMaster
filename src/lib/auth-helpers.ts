import type { JWTPayload } from '@/lib/auth';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types/user.types';

import { NextResponse } from 'next/server';

import { isDatabaseConnectionError } from '@/lib/db';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';

/**
 * Get current user from request
 * Throws error if not authenticated
 */
export function getCurrentUser(request: NextRequest): JWTPayload {
  const token = getTokenFromRequest(request);
  if (!token) {
    throw new Error('Unauthorized');
  }

  try {
    return verifyToken(token);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Require authentication - returns user or throws error
 */
export function requireAuth(request: NextRequest): JWTPayload {
  return getCurrentUser(request);
}

/**
 * Require specific role - returns user or throws error
 */
export function requireRole(request: NextRequest, role: UserRole): JWTPayload {
  const user = requireAuth(request);
  if (user.role !== role) {
    throw new Error(`Forbidden. ${role} role required.`);
  }
  return user;
}

/**
 * Require admin role - returns user or throws error
 */
export function requireAdmin(request: NextRequest): JWTPayload {
  return requireRole(request, 'admin');
}

/**
 * Require student role - returns user or throws error
 */
export function requireStudent(request: NextRequest): JWTPayload {
  return requireRole(request, 'student');
}

/**
 * Handle authentication errors and return appropriate response
 */
export function handleAuthError(error: unknown): NextResponse {
  // Handle database connection errors first
  if (isDatabaseConnectionError(error)) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { error: 'Service temporarily unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized' || error.message === 'Invalid or expired token') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
  }

  console.error('Authentication error:', error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

/**
 * Get user ID from request headers (set by middleware)
 */
export function getUserIdFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-user-id');
}

/**
 * Get user email from request headers (set by middleware)
 */
export function getUserEmailFromHeaders(request: NextRequest): string | null {
  return request.headers.get('x-user-email');
}

/**
 * Get user role from request headers (set by middleware)
 */
export function getUserRoleFromHeaders(request: NextRequest): UserRole | null {
  const role = request.headers.get('x-user-role');
  return role === 'admin' || role === 'student' ? role : null;
}
