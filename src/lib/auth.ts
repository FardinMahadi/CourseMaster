import type { UserRole } from '@/types/user.types';

import { NextRequest } from 'next/server';
import jwt, { type SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
}

// TypeScript assertion: JWT_SECRET is guaranteed to be defined after the check above
const JWT_SECRET_STRING: string = JWT_SECRET;

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET_STRING, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET_STRING) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get token from request cookie
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get('token')?.value;
  return token || null;
}

/**
 * Set token in response cookie
 */
export function setTokenCookie(token: string): {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
} {
  const isProduction = process.env.NODE_ENV === 'production';
  const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds

  return {
    name: 'token',
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

/**
 * Clear token cookie
 */
export function clearTokenCookie(): {
  name: string;
  value: string;
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: string;
  maxAge: number;
} {
  return {
    name: 'token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  };
}

/**
 * Get user info from token (without throwing error)
 * Returns null if token is invalid or missing
 */
export function getUserFromToken(token: string | null): JWTPayload | null {
  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(request: NextRequest): boolean {
  const token = getTokenFromRequest(request);
  if (!token) {
    return false;
  }

  try {
    verifyToken(token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export function getAuthenticatedUser(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  return getUserFromToken(token);
}

/**
 * Check if user has specific role
 */
export function hasRole(request: NextRequest, role: UserRole): boolean {
  const user = getAuthenticatedUser(request);
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(request: NextRequest): boolean {
  return hasRole(request, 'admin');
}

/**
 * Check if user is student
 */
export function isStudent(request: NextRequest): boolean {
  return hasRole(request, 'student');
}
