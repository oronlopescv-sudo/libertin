import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_ROUTES = ['/profil', '/admin', '/chat'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Se é rota protegida
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const token = request.cookies.get('auth_token');

    // Se sem token, redireciona para login
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|static|favicon).*)'],
};
