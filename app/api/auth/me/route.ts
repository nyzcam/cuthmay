import { NextResponse } from 'next/server';

// Mock user data - in production, store in a database
const mockUsers: Record<string, any> = {};

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real implementation, verify the token from the auth provider
    // For now, return mock data
    const token = authHeader.split(' ')[1];
    
    return NextResponse.json({
      id: 'user-123',
      email: 'user@example.com',
      name: 'Demo User',
      provider: 'local',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
