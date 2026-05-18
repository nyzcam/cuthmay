import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuthenticatedRequestUser } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const user = await getAuthenticatedRequestUser(request);
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
