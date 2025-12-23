import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock GitHub OAuth callback
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No auth code provided' }, { status: 400 });
  }

  // Mock token - in production, exchange code with GitHub
  const mockToken = Buffer.from(`github:${Date.now()}`).toString('base64');

  const response = NextResponse.redirect(new URL('/admin/guests', request.url));
  response.cookies.set('auth_token', mockToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
  });

  return response;
}
