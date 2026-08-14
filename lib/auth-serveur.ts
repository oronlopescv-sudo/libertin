import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { isPremium, isAdmin } from '@/lib/premium';
import { cookies } from 'next/headers';

/**
 * Authentification côté serveur.
 *
 * Règle de sécurité : l'identité et l'abonnement d'un utilisateur sont
 * TOUJOURS lus depuis le cookie de session puis vérifiés en base. Ils ne
 * doivent jamais provenir du corps de la requête — le navigateur peut
 * envoyer n'importe quelle valeur, y compris un faux niveau d'abonnement.
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
 * Récupère l'utilisateur connecté à partir du cookie de session.
 * Renvoie soit l'utilisateur, soit la réponse d'erreur à retourner tel quel.
 */
export async function utilisateurActuel(): Promise<Resultat> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }),
    };
  }

  let userId: string;
  try {
    const donnees = JSON.parse(Buffer.from(token, 'base64').toString());
    userId = donnees.id;
    if (!userId) throw new Error('id absent du jeton');
  } catch {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Jeton invalide' }, { status: 401 }),
    };
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, username, role, subscriptionTier, subscriptionEnd, isBanned')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 }),
    };
  }

  if (user.isBanned) {
    return {
      ok: false,
      reponse: NextResponse.json({ error: 'Compte suspendu' }, { status: 403 }),
    };
  }

  return { ok: true, user: user as UtilisateurAuthentifie };
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
