import { jwtVerify } from 'jose';
import { NextResponse } from 'next/server';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'polla-mundialista-2026-secret-key'
);

const PUBLIC_PATHS = ['/login', '/registro', '/api/auth/login', '/api/auth/registro'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    PUBLIC_PATHS.some(p => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
