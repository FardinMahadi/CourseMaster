import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import connectDB from '@/lib/db';
import { sendCustomEmail } from '@/lib/email';
import { sendEmailSchema } from '@/lib/validations/email.schema';
import { handleAuthError, requireAuth } from '@/lib/auth-helpers';

import User from '@/models/User';

// POST /api/email/send - Send email to logged-in user
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication
    const user = requireAuth(request);
    const userId = user.userId;

    // Get user from database to get email
    const userDoc = await User.findById(userId).select('name email');
    if (!userDoc) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = sendEmailSchema.parse(body);

    // Send email to the logged-in user
    await sendCustomEmail(
      userDoc.name,
      userDoc.email,
      validatedData.subject,
      validatedData.message,
      validatedData.actionUrl || undefined,
      validatedData.actionText || undefined
    );

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        data: {
          to: userDoc.email,
          subject: validatedData.subject,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (handleAuthError(error)) {
      return handleAuthError(error) as NextResponse;
    }

    console.error('Send email API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
