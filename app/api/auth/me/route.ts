import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import type { ValidationResult, AuthUser, JwtPayload } from '../../../../types/auth';

const JWT_SECRET = process.env.JWT_SECRET;

function createUserFromPayload(payload: JwtPayload, fallbackProvider = 'local'): AuthUser {
  return {
    id: payload.sub || 'user-123',
    email: payload.email || `${fallbackProvider}@example.com`,
    name: payload.name || 'Demo User',
  };
}

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8')) as JwtPayload;
  } catch {
    return null;
  }
}

async function validateToken(token: string): Promise<ValidationResult> {
  if (!token) {
    return { valid: false, provider: 'local', verified: false, reason: 'missing-token' };
  }

  const provider = token.includes(':') ? token.split(':')[0] : 'local';
  const tokenParts = token.split('.');

  if (tokenParts.length === 3) {
    const decodedPayload = parseJwtPayload(token);
    try {
      if (!JWT_SECRET) {
        if (!decodedPayload) {
          return { valid: false, provider: 'jwt', verified: false, reason: 'invalid-jwt' };
        }
        return {
          valid: true,
          provider: 'jwt',
          verified: false,
          user: createUserFromPayload(decodedPayload, 'jwt'),
          reason: 'no-secret',
        };
      }

      const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return {
        valid: true,
        provider: 'jwt',
        verified: true,
        user: createUserFromPayload(payload, 'jwt'),
      };
    } catch {
      if (!decodedPayload) {
        return { valid: false, provider: 'jwt', verified: false, reason: 'invalid-jwt' };
      }

      return {
        valid: true,
        provider: 'jwt',
        verified: false,
        user: createUserFromPayload(decodedPayload, 'jwt'),
        reason: 'verify-failed',
      };
    }
  }


  // Try to decode base64 marker tokens like `provider:timestamp` encoded as base64
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    if (decoded.includes(':')) {
      const [provider, raw] = decoded.split(':');
      if (!raw || raw.length < 6) return { valid: false, provider, verified: false, reason: 'malformed' };
      const user: AuthUser = { id: `${provider}-user`, email: `${provider}@example.com`, name: `${provider} User` };
      return { valid: true, provider, verified: false, user };
    }
  } catch (e) {
    // not base64 or decode failed, fall through
  }

  // Fallback: treat token as raw string; accept if length looks plausible
  const parts = token.includes(':') ? token.split(':') : ['local', token];
  const raw = parts[1] || '';
  if (raw.length < 8) return { valid: false, provider: parts[0] || 'local', verified: false, reason: 'malformed' };
  const user: AuthUser = { id: 'user-123', email: `${parts[0] || 'local'}@example.com`, name: 'Demo User' };
  return { valid: true, provider: parts[0] || 'local', verified: false, user };
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value ?? '';

    const result = await validateToken(authToken);

    if (!result.valid || !result.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      id: result.user?.id || 'user-123',
      email: result.user?.email || 'user@example.com',
      name: result.user?.name || 'Demo User',
      provider: result.provider,
      authenticated: true,
      verified: result.verified ?? false,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
