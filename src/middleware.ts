import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/session';
import { AI_ENABLED } from '@/lib/features';

const AI_PAGES = ['/sensei', '/interview'];

const PROTECTED = [
  '/dashboard',
  '/plan',
  '/lesson',
  '/flashcards',
  '/exam',
  '/kanji',
  '/speak',
  '/sensei',
  '/interview',
  '/billing',
  '/profile',
  '/admin',
];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  const isProtected = PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  const isAiPage = AI_PAGES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if ((pathname.startsWith('/admin') && session?.role !== 'admin') || (isAiPage && !AI_ENABLED)) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  if (pathname === '/login' && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plan/:path*',
    '/lesson/:path*',
    '/flashcards/:path*',
    '/exam/:path*',
    '/kanji/:path*',
    '/speak/:path*',
    '/sensei/:path*',
    '/interview/:path*',
    '/billing/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
  ],
};
