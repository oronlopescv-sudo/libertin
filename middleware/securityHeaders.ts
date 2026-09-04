import type { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
  response.headers.set('Content-Security-Policy', "default-src 'self'; img-src https: data:; script-src 'self'; style-src 'self' 'unsafe-inline';");
  return response;
}
