import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Client Supabase côté serveur, par requête. Lit la session Supabase Auth
 * depuis les cookies (synchronisés par le client navigateur @supabase/ssr)
 * et la rafraîchit si nécessaire. À utiliser dans les routes API et le
 * middleware pour vérifier l'identité réelle de l'utilisateur.
 *
 * `setAll` peut lever dans un Server Component (cookies en lecture seule) ;
 * on l'ignore alors : le rafraîchissement a lieu dans le middleware.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* cookies en lecture seule (Server Component) — ignoré */
        }
      },
    },
  });
}