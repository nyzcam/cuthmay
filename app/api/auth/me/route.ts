import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { getSupabaseAuthClient } from '@/lib/supabase/auth';
import { isSuperAdmin } from '@/lib/auth/session';

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

function normalizeRole(value: unknown): 'super_admin' | 'admin' | 'guest' {
  if (typeof value !== 'string') {
    return 'guest';
  }

  const normalized = value.trim().toLowerCase().replace(/\s+/g, '_');
  if (normalized === 'super_admin' || normalized === 'superadmin') {
    return 'super_admin';
  }
  if (normalized === 'admin') {
    return 'admin';
  }

  return 'guest';
}

function buildUser(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};
  const appMetadata = user.app_metadata ?? {};
  const name =
    (typeof metadata.name === 'string' && metadata.name) ||
    (typeof metadata.full_name === 'string' && metadata.full_name) ||
    user.email ||
    'User';
  const role = normalizeRole(metadata.role ?? appMetadata.role);

  return {
    id: user.id,
    email: user.email ?? '',
    name,
    role,
    provider: 'supabase',
    authenticated: true,
    verified: true,
  };
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value ?? '';
    const refreshToken = cookieStore.get('refresh_token')?.value ?? '';

    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdminClient();
    const userResult = await supabaseAdmin.auth.getUser(authToken);

    if (!userResult.error && userResult.data.user) {
      const actualUser = buildUser(userResult.data.user);

      // Check for active impersonation session
      const impersonateDataStr = cookieStore.get('impersonate_data')?.value ?? '';
      if (impersonateDataStr && isSuperAdmin(actualUser)) {
        try {
          const impersonationData = JSON.parse(decodeURIComponent(impersonateDataStr)) as {
            actualUserId: string;
            impersonatedUserId: string;
          };

          if (impersonationData.actualUserId === actualUser.id) {
            const impersonatedResult = await supabaseAdmin.auth.admin.getUserById(
              impersonationData.impersonatedUserId
            );

            if (!impersonatedResult.error && impersonatedResult.data.user) {
              const impersonatedUser = buildUser(impersonatedResult.data.user);
              return NextResponse.json(
                { ...impersonatedUser, __isImpersonated: true, __actualUserId: actualUser.id },
                { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
              );
            }
          }
        } catch {
          // Invalid impersonation data, ignore and return actual user
        }
      }

      return NextResponse.json(actualUser, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }

    if (!refreshToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAuth = getSupabaseAuthClient();
    const refreshResult = await supabaseAuth.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (refreshResult.error || !refreshResult.data.session || !refreshResult.data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = NextResponse.json(buildUser(refreshResult.data.user), {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });

    response.cookies.set('auth_token', refreshResult.data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    response.cookies.set('refresh_token', refreshResult.data.session.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
