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
 * Trois façons d'être administrateur :
 *   1. Email présent dans ADMIN_EMAILS.
 *   2. Colonne `role` égale à 'admin'.
 *   3. Abonnement Pass VIP Elite (PASS_VIP).
 */
export function isAdmin(user: UserLike): boolean {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  if (email && ADMIN_EMAILS.has(email)) return true

  if (user.role === 'admin') return true

  return user.subscriptionTier === 'PASS_VIP'
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
