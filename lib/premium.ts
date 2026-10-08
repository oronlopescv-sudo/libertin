/**
 * Vérification centralisée des accès Premium et administrateur.
 *
 * Toute la logique « isPremium ? » et « isAdmin ? » passe par ici. Ainsi,
 * ajouter un compte à vie ou changer les offres qui donnent accès Premium
 * se fait à UN seul endroit, pas dans quinze fichiers.
 */

/** Emails avec accès Premium à vie, quel que soit l'abonnement en base. */
const LIFETIME_PREMIUM_EMAILS = new Set([
  'orsonricardo@hotmail.fr',
])

/** Emails avec les droits d'administration, quel que soit l'abonnement. */
const ADMIN_EMAILS = new Set([
  'orsonricardo@hotmail.fr',
])

/** Offres qui donnent accès Premium. */
const PREMIUM_TIERS: readonly string[] = [
  'PASS_EPICURIEN',
  'PASS_PRIVILEGE',
  'PASS_VIP',
]

type UserLike = {
  email?: string | null
  subscriptionTier?: string | null
  subscriptionEnd?: string | Date | null
  role?: string | null
} | null | undefined

/**
 * Renvoie true si l'utilisateur a les droits d'administration.
 *
 * Deux façons d'être administrateur :
 *   1. Email présent dans ADMIN_EMAILS.
 *   2. Colonne `role` égale à 'admin'.
 *
 * N.B. : « abonnement Pass VIP Elite » ne donne PAS l'administration —
 * c'était une escalada de privilégios : qualquer subscritor podia banir
 * contas e conceder Premium (grant-premium) via usuárioAdmin().
 */
export function isAdmin(user: UserLike): boolean {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  if (email && ADMIN_EMAILS.has(email)) return true

  return user.role === 'admin'
}

/**
 * Renvoie true si l'utilisateur a accès Premium en ce moment.
 *
 * Les règles, dans l'ordre :
 *   1. Email dans la liste Premium à vie → toujours true.
 *   2. Administrateur → toujours true.
 *   3. Abonnement Premium non expiré → true.
 *   4. Sinon → false.
 */
export function isPremium(user: UserLike): boolean {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  if (email && LIFETIME_PREMIUM_EMAILS.has(email)) return true

  if (isAdmin(user)) return true

  if (!user.subscriptionTier) return false
  if (!PREMIUM_TIERS.includes(user.subscriptionTier)) return false

  // Vérifie que l'abonnement n'a pas expiré (quand le champ existe)
  if (user.subscriptionEnd) {
    const fin = new Date(user.subscriptionEnd)
    if (Number.isFinite(fin.getTime()) && fin < new Date()) return false
  }

  return true
}

/** Hierarquia dos passes: rank maior = mais direitos. */
const TIER_RANK: Record<string, number> = {
  FREE: 0,
  PASS_EPICURIEN: 1,
  PASS_PRIVILEGE: 2,
  PASS_VIP: 3,
}

export type NivelMinimo = keyof typeof TIER_RANK

/**
 * True se o membro tem, no mínimo, o passe indicado — ou é administrador, ou
 * é Premium à vida (benefício integral para ambos).
 *
 * Os planos anunciam «Création illimitée de groupes» só a partir do Pass
 * Privilège: um Épicurien NÃO deve conseguir criar grupos (a rota e a UI
 * passam ambas por aqui).
 */
export function temNivelNoMinimo(user: UserLike, minimo: NivelMinimo): boolean {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  if (email && LIFETIME_PREMIUM_EMAILS.has(email)) return true
  if (isAdmin(user)) return true
  if (!isPremium(user)) return false

  const rank = TIER_RANK[user.subscriptionTier ?? ''] ?? 0
  return rank >= TIER_RANK[minimo]
}
