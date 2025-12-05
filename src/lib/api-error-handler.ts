import type { NextResponse } from 'next/server';

import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { NextResponse as NextResponseInstance } from 'next/server';

import { isDatabaseConnectionError } from '@/lib/db';
import { handleAuthError } from '@/lib/auth-helpers';

/**
 * Interface for MongoDB duplicate key error
 */
interface MongoDuplicateKeyError extends Error {
  code?: number;
  codeName?: string;
  keyPattern?: Record<string, unknown>;
  keyValue?: Record<string, unknown>;
}

/**
 * Interface for Mongoose validation error
 */
interface MongooseValidationError extends Error {
  name: 'ValidationError';
  errors?: Record<string, { message: string; path: string; value: unknown }>;
}

/**
 * Standardized API error response
 */
export interface ApiErrorResponse {
  error: string;
  details?: string | unknown;
  code?: string;
}

/**
 * Handle API errors and return standardized error responses
 * @param error - The error to handle
 * @param context - Optional context for logging (e.g., 'course creation', 'user registration')
 * @returns NextResponse with appropriate error status and message
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  const errorContext = context ? ` (${context})` : '';

  // Handle database connection errors first
  if (isDatabaseConnectionError(error)) {
    console.error(`Database connection error${errorContext}:`, error);
    return NextResponseInstance.json(
      {
        error: 'Service temporarily unavailable. Please try again later.',
      },
      { status: 503 }
    );
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const errorDetails = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    return NextResponseInstance.json(
      {
        error: 'Validation failed',
        details: errorDetails,
      },
      { status: 400 }
    );
  }

  // Handle Mongoose validation errors
  if (error instanceof Error && error.name === 'ValidationError') {
    const mongooseError = error as MongooseValidationError;
    const errorDetails = mongooseError.errors
      ? Object.values(mongooseError.errors)
          .map(e => `${e.path}: ${e.message}`)
          .join(', ')
      : mongooseError.message;

    return NextResponseInstance.json(
      {
        error: 'Validation failed',
        details: errorDetails,
      },
      { status: 400 }
    );
  }

  // Handle MongoDB duplicate key errors (E11000)
  if (error instanceof Error) {
    const mongoError = error as MongoDuplicateKeyError;
    if (mongoError.code === 11000 || mongoError.codeName === 'DuplicateKey') {
      // Extract field name from keyPattern or keyValue
      const duplicateField = mongoError.keyPattern
        ? Object.keys(mongoError.keyPattern)[0]
        : mongoError.keyValue
          ? Object.keys(mongoError.keyValue)[0]
          : 'field';

      return NextResponseInstance.json(
        {
          error: `Duplicate entry: ${duplicateField} already exists`,
          details: `A record with this ${duplicateField} already exists.`,
        },
        { status: 409 }
      );
    }

    // Handle CastError (invalid ObjectId, etc.)
    if (error.name === 'CastError') {
      const castError = error as mongoose.Error.CastError;
      return NextResponseInstance.json(
        {
          error: 'Invalid ID format',
          details: `Invalid ${castError.kind} for field ${castError.path}`,
        },
        { status: 400 }
      );
    }

    // Handle authentication/authorization errors
    if (
      error.message === 'Unauthorized' ||
      error.message === 'Invalid or expired token' ||
      error.message.includes('Forbidden')
    ) {
      return handleAuthError(error);
    }
  }

  // Handle other known error types
  if (error instanceof Error) {
    // Handle JSON parse errors
    if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
      return NextResponseInstance.json(
        {
          error: 'Invalid JSON format',
          details: 'The request body contains invalid JSON.',
        },
        { status: 400 }
      );
    }
  }

  // Handle unknown errors - log and return generic error
  console.error(`Unhandled error${errorContext}:`, error);
  return NextResponseInstance.json(
    {
      error: 'Internal server error',
      details:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.message
          : undefined,
    },
    { status: 500 }
  );
}

/**
 * Wrapper function to handle async API route handlers with error handling
 * @param handler - The async handler function
 * @param context - Optional context for error logging
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>,
  context?: string
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}
