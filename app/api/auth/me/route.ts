import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock user data - in production, store in a database
const mockUsers: Record<string, any> = {};

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, verify the token and fetch actual user data from DB
    // For now, return mock data - token format: 'provider:timestamp'
    const [provider] = authToken.includes(':') ? authToken.split(':') : ['local'];
    
    return NextResponse.json({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Demo User',
      provider: provider || 'local',
      authenticated: true,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
