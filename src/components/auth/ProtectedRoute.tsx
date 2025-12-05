'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireStudent?: boolean;
  redirectTo?: string;
}

/**
 * Client-side protected route component
 * Redirects to login if not authenticated
 * Redirects based on role requirements
 */
export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireStudent = false,
  redirectTo,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, isAdmin, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.push(redirectTo || '/login');
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.push(redirectTo || '/dashboard');
      return;
    }

    if (requireStudent && !isStudent) {
      router.push(redirectTo || '/');
      return;
    }
  }, [
    loading,
    isAuthenticated,
    isAdmin,
    isStudent,
    requireAdmin,
    requireStudent,
    redirectTo,
    router,
  ]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requireAdmin && !isAdmin) {
    return null;
  }

  if (requireStudent && !isStudent) {
    return null;
  }

  return <>{children}</>;
}
