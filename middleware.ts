import { NextRequest, NextResponse } from 'next/server';

/**
 * Rate limiter using simple in-memory store
 * In production, use Redis for better performance across multiple instances
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: NextRequest): string {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const path = new URL(request.url).pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(key: string, maxRequests: number = 30, windowSeconds: number = 60): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Reset window
    rateLimitStore.set(key, { count: 1, resetTime: now + windowSeconds * 1000 });
    return true;
  }

  if (entry.count < maxRequests) {
    entry.count++;
    return true;
  }

  return false;
}

/**
 * Middleware to handle:
 * - Rate limiting
 * - Security headers
 * - Request logging
 */
export function middleware(request: NextRequest) {
  // Skip middleware for static files and public routes
  const pathname = request.nextUrl.pathname;
  const skipPaths = [
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico)$/,
  ];

  if (skipPaths.some((path) => {
    if (typeof path === 'string') return pathname.startsWith(path);
    return path.test(pathname);
  })) {
    return NextResponse.next();
  }

  // Rate limit API routes more strictly
  if (pathname.startsWith('/api/')) {
    const key = getRateLimitKey(request);
    const allowed = checkRateLimit(key, 60, 60); // 60 requests per minute

    if (!allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Rate limit auth routes even more strictly
  if (['/api/auth', '/login', '/register'].some((path) => pathname.startsWith(path))) {
    const key = getRateLimitKey(request);
    const allowed = checkRateLimit(key, 10, 60); // 10 requests per minute

    if (!allowed) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Add CSP header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.supabase.co https://stripe.com; frame-src 'self' https://stripe.com"
  );

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
