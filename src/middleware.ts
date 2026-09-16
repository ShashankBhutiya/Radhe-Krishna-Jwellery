import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session';

/**
 * Gate protected areas before anything renders.
 *
 * A guard inside layout.tsx is not enough: Next renders layouts and their
 * pages concurrently, so a page's data can be streamed to the browser before
 * the layout's redirect throws. Middleware runs first, so nothing leaks and
 * the browser gets a real 307 instead of a 200 with a client-side bounce.
 */
export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const signIn = (reason?: string) => {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    url.searchParams.set('next', pathname + search);
    if (reason) url.searchParams.set('reason', reason);
    return NextResponse.redirect(url, 307);
  };

  if (pathname.startsWith('/admin')) {
    if (!session) return signIn();
    if (session.role !== 'ADMIN') return signIn('admin-only');
  }

  if (pathname.startsWith('/account')) {
    if (!session) return signIn();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
