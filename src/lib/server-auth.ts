import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types/user.types';

import { redirect } from 'next/navigation';

import { getAuthenticatedUser, isAuthenticated } from '@/lib/auth';

/**
 * Server-side authentication check
 * Throws redirect if not authenticated
 */
export function requireAuthServer(request: NextRequest) {
  if (!isAuthenticated(request)) {
    redirect('/login');
  }
  return getAuthenticatedUser(request);
}

/**
 * Server-side role check
 * Throws redirect if user doesn't have required role
 */
export function requireRoleServer(request: NextRequest, role: UserRole) {
  const user = requireAuthServer(request);
  if (user.role !== role) {
    if (role === 'admin') {
      redirect('/dashboard');
    } else {
      redirect('/');
    }
  }
  return user;
}

/**
 * Server-side admin check
 */
export function requireAdminServer(request: NextRequest) {
  return requireRoleServer(request, 'admin');
}

/**
 * Server-side student check
 */
export function requireStudentServer(request: NextRequest) {
  return requireRoleServer(request, 'student');
}
