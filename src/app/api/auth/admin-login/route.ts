import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { generateToken, setTokenCookie } from '@/lib/auth';
import connectDB, { isDatabaseConnectionError } from '@/lib/db';
import { adminLoginSchema } from '@/lib/validations/auth.schema';

import User from '@/models/User';

const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

if (!ADMIN_SECRET_KEY) {
  throw new Error('Please define the ADMIN_SECRET_KEY environment variable inside .env.local');
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = adminLoginSchema.parse(body);

    // Verify admin secret key
    if (validatedData.adminSecretKey !== ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Invalid admin secret key' }, { status: 401 });
    }

    // Find user by email (include password field)
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify user is an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(validatedData.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Set HTTP-only cookie
    const cookie = setTokenCookie(token);

    // Return user data (password excluded by toJSON transform)
    const response = NextResponse.json(
      {
        message: 'Admin login successful',
        user: user.toJSON(),
        token,
      },
      { status: 200 }
    );

    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });

    return response;
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during admin login:', error);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }

    // Handle Zod validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
