import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { requireAuth, handleAuthError } from '@/lib/auth-helpers';

import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication (throws error if not authenticated)
    const payload = requireAuth(request);

    // Find user
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data (password excluded by toJSON transform)
    return NextResponse.json(user.toJSON(), { status: 200 });
  } catch (error) {
    // Handle database connection errors specifically
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during user fetch:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    return handleAuthError(error);
  }
}
