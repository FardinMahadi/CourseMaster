import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import { handleApiError } from '@/lib/api-error-handler';
import { generateToken, setTokenCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth.schema';

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

    // Send welcome email (non-blocking - don't fail registration if email fails)
    sendWelcomeEmail(user.name, user.email).catch(error => {
      console.error('Failed to send welcome email:', error);
      // Email failure shouldn't break registration
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
    return handleApiError(error, 'user registration');
  }
}
