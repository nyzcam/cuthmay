import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock Google OAuth callback
  // In production, you would:
  // 1. Exchange the code for an access token with Google
  // 2. Fetch user info from Google
  // 3. Create/update user in your database
  // 4. Create a session/JWT token
  // 5. Redirect to admin page with auth token

  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No auth code provided' }, { status: 400 });
  }

  // Mock token - in production, exchange code with Google
  const mockToken = Buffer.from(`google:${Date.now()}`).toString('base64');

  const response = NextResponse.redirect(new URL('/admin/guests', request.url));
  response.cookies.set('auth_token', mockToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return response;
}
