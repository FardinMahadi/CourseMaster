'use client';

import type {
  AdminLoginInput,
  LoginInput,
  RegisterInput,
  UserWithoutPassword,
} from '@/types/user.types';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  adminLoginUser,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/store/slices/authSlice';

interface UseAuthReturn {
  user: UserWithoutPassword | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  initialized: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (userData: RegisterInput) => Promise<void>;
  adminLogin: (credentials: AdminLoginInput) => Promise<void>;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for authentication state management using Redux
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error, initialized } = useAppSelector(
    state => state.auth
  );
  const fetchAttemptedRef = useRef(false);

  // Fetch current user on mount only if not already initialized
  // Use ref to prevent double-fetch in React 18 Strict Mode
  useEffect(() => {
    if (!initialized && !loading && !fetchAttemptedRef.current) {
      fetchAttemptedRef.current = true;
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, initialized, loading]);

  const login = async (credentials: LoginInput) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error) {
      // Error is handled by Redux state
      throw error;
    }
  };

  const register = async (userData: RegisterInput) => {
    try {
      await dispatch(registerUser(userData)).unwrap();
    } catch (error) {
      // Error is handled by Redux state
      throw error;
    }
  };

  const adminLogin = async (credentials: AdminLoginInput) => {
    try {
      await dispatch(adminLoginUser(credentials)).unwrap();
    } catch (error) {
      // Error is handled by Redux state
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      // Even if logout fails, redirect to login
      router.push('/login');
    }
  };

  const refetch = async () => {
    await dispatch(fetchCurrentUser());
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
    initialized,
    login,
    register,
    adminLogin,
    logout,
    refetch,
  };
}
