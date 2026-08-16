import { NextResponse } from 'next/server';
import { isPremium, isAdmin } from '@/lib/premium';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * Authentification côté serveur.
 *
 * Règle de sécurité : l'identité et l'abonnement d'un utilisateur sont
 * TOUJOURS lus depuis la session Supabase Auth (cookie synchronisé par
 * @supabase/ssr) puis vérifiés en base dans la table `profiles`. Ils ne
 * doivent jamais provenir du corps de la requête — le navigateur peut
 * envoyer n'importe quelle valeur, y compris un faux niveau d'abonnement.
 *
 * Source unique de vérité : `profiles` (snake_case). L'ancienne table `users`
 * et le cookie `auth_token` hérité ne sont plus utilisés.
 */

export type UtilisateurAuthentifie = {
  id: string;
  email: string | null;
  username: string | null;
  role: string | null;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
  isBanned: boolean;
};

type Resultat =
  | { ok: true; user: UtilisateurAuthentifie }
  | { ok: false; reponse: NextResponse };

/**
 * Récupère l'utilisateur connecté à partir de la session Supabase Auth.
 * Renvoie soit l'utilisateur, soit la réponse d'erreur à retourner tel quel.
 */
export async function utilisateurActuel(): Promise<Resultat> {
  const supabaseServer = await createServerSupabaseClient();

  // 1. Vérifie la session Supabase Auth (depuis les cookies, jamais le corps).
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser();

  if (error || !user) {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
    };
  }

  // 2. Charge le profil dans `profiles` (snake_case) — source unique.
  const { data: profile, error: profileError } = await supabaseServer
    .from('profiles')
    .select('id, email, username, role, subscription_tier, subscription_end, is_active')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Profil introuvable' }, { status: 404 }),
    };
  }

  if (!profile.is_active) {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Compte suspendu' }, { status: 403 }),
    };
  }

  return {
    ok: true,
    user: {
      id: profile.id,
      email: profile.email ?? user.email ?? null,
      username: profile.username ?? null,
      role: profile.role ?? null,
      subscriptionTier: profile.subscription_tier ?? null,
      subscriptionEnd: profile.subscription_end ?? null,
      isBanned: false,
    },
  };
}

/**
 * Comme utilisateurActuel(), mais refuse aussi les comptes non Premium.
 * `action` sert à personnaliser le message d'erreur.
 */
export async function utilisateurPremium(action: string): Promise<Resultat> {
  const resultat = await utilisateurActuel();
  if (!resultat.ok) return resultat;

  if (!isPremium(resultat.user)) {
    return {
      ok: false,
      reponse: NextResponse.json(
        {
          error: `Seuls les membres Premium peuvent ${action}. Passez à Premium !`,
          premiumRequired: true,
        },
        { status: 403 }
      ),
    };
  }

  return resultat;
}

/** Comme utilisateurActuel(), mais refuse les non-administrateurs. */
export async function utilisateurAdmin(): Promise<Resultat> {
  const resultat = await utilisateurActuel();
  if (!resultat.ok) return resultat;

  if (!isAdmin(resultat.user)) {
    return {
      ok: false,
      reponse: NextResponse.json(
        { error: "Sans autorisation d'administrateur" },
        { status: 403 }
      ),
    };
  }

  return resultat;
}