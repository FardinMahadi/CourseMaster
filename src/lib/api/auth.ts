import type { AxiosResponse } from 'axios';
import type {
  AdminLoginInput,
  AuthResponse,
  LoginInput,
  RegisterInput,
  UserWithoutPassword,
} from '@/types/user.types';

import { api } from './axios';

/**
 * Register a new student user
 */
export async function register(data: RegisterInput): Promise<AuthResponse> {
  const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
  return response.data;
}

/**
 * Login a student user
 */
export async function login(data: LoginInput): Promise<AuthResponse> {
  const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', data);
  return response.data;
}

/**
 * Login an admin user
 */
export async function adminLogin(data: AdminLoginInput): Promise<AuthResponse> {
  const response: AxiosResponse<AuthResponse> = await api.post('/auth/admin-login', data);
  return response.data;
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ message: string }> {
  const response: AxiosResponse<{ message: string }> = await api.post('/auth/logout');
  return response.data;
}

/**
 * Get current user (if authenticated)
 */
export async function getCurrentUser(): Promise<UserWithoutPassword> {
  const response: AxiosResponse<UserWithoutPassword> = await api.get('/auth/me');
  return response.data;
}
