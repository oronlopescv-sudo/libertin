import { NextResponse, NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// /supabase et /debug sont des pages de diagnostic : protégées comme le
// reste, un visiteur non connecté n'a rien à y faire en production.
const PROTECTED_ROUTES = ['/profil', '/admin', '/chat', '/supabase', '/debug'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Client serveur qui lit ET rafraîchit la session depuis les cookies.
  // Construit sur la requête + la réponse pour propager les cookies rafraîchis.
  // URL/key de secours : sans variables d'environnement (build sur l'hébergeur),
  // createServerClient lève « Your project's URL and Key are required » et fait
  // échouer TOUTES les pages en 500 — le middleware tourne sur chaque page.
  // Avec des valeurs de secours, getUser() retourne une erreur (sans lever),
  // les pages publiques s'affichent et les pages protégées demandent /login.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Vérifie (et rafraîchit) la session Supabase Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  // Page protégée sans session valide -> connexion requise.
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return addSecurityHeaders(response);
}

import { addSecurityHeaders } from '@/middleware/securityHeaders';

export const config = {
  matcher: ['/((?!api|_next|static|favicon).*)'],
};