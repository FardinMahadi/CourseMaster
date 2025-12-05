import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { generateToken, setTokenCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth.schema';
import connectDB, { isDatabaseConnectionError } from '@/lib/db';

import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      role: 'student', // Default role
    });

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
        message: 'Registration successful',
        user: user.toJSON(),
        token,
      },
      { status: 201 }
    );

    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });

    // Console log the response
    console.log('✅ Registration successful:', {
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      tokenLength: token.length,
    });

    return response;
  } catch (error) {
    // Handle database connection errors
    if (isDatabaseConnectionError(error)) {
      console.error('Database connection error during registration:', error);
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

    // Handle duplicate key error (MongoDB)
    if (error instanceof Error && error.message.includes('E11000')) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    // Handle other errors
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
