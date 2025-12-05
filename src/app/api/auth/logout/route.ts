import type { NextRequest } from 'next/server';

import { NextResponse } from 'next/server';

import { clearTokenCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const cookie = clearTokenCookie();

    const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });

    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
