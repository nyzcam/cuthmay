import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Clear auth cookies/session
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');
    response.cookies.delete('refresh_token');
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
