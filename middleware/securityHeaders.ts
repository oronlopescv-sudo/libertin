import type { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse) {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=()');
  // CSP removido: "script-src 'self'" bloqueava os scripts inline de
  // hidratação do Next.js (página toda preta/vazia). Re-introduzir mais
  // tarde, corretamente, com nonces por request.
  return response;
}
