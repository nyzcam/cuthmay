import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Mock GitHub OAuth callback
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return NextResponse.json({ error: 'No auth code provided' }, { status: 400 });
  }
    return NextResponse.json({ error: 'GitHub login disabled' }, { status: 404 });
}
