import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Create a demo auth token (JWT if possible)
    let token: string;
    const secret = process.env.JWT_SECRET;
    if (secret) {
      const jwt = await import('jsonwebtoken');
      token = jwt.sign({ sub: `demo-${Date.now()}`, email: 'demo@example.com', name: 'Demo User' }, secret, { expiresIn: '7d' });
    } else {
      token = Buffer.from(`demo:${Date.now()}`).toString('base64');
    }

    const response = NextResponse.json({ success: true });
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}
