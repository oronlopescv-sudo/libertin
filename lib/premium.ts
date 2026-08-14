/**
 * Verificaction central de acesso Premium.
 *
 * Toda a lógica de "isPremium?" passa por aqui. Assim, adicionar contas com
 * acesso vitalício ou mudar os plans que contam como Premium é uma alteraction
 * em UM sítio, não em quinze.
 */

/** Emails com acesso Premium vitalício, independentemente do plan na BD. */
const LIFETIME_PREMIUM_EMAILS = new Set([
  'orsonricardo@hotmail.fr',
])

/** Plans que dão acesso Premium (excluindo VIP_24M que também é Premium). */
const PREMIUM_TIERS: readonly string[] = [
  'PREMIUM_3M',
  'PREMIUM_12M',
  'PREMIUM_24M',
  'CREATOR_3M',
  'CREATOR_12M',
  'VIP_24M',
]

type UserLike = {
  email?: string | null
  subscriptionTier?: string | null
  subscriptionEnd?: string | Date | null
  role?: string | null
} | null | undefined

/**
 * Renvoie true se o utilisateur deve ter acesso Premium neste momento.
 *
 * As regras, por ordem:
 *   1. Se o email está na lista de Premium vitalício → sempre true.
 *   2. Se é admin → sempre true.
 *   3. Se o plan é Premium E ainda não expirou → true.
 *   4. Caso contrário → false.
 */
export function isPremium(user: UserLike): boolean {
  if (!user) return false

  const email = user.email?.toLowerCase().trim()
  if (email && LIFETIME_PREMIUM_EMAILS.has(email)) return true

  if (user.role === 'admin') return true

  if (!user.subscriptionTier) return false
  if (!PREMIUM_TIERS.includes(user.subscriptionTier)) return false

  // Vérifie se a abonnement não expirou (quando o campo existe)
  if (user.subscriptionEnd) {
    const fim = new Date(user.subscriptionEnd)
    if (Number.isFinite(fim.getTime()) && fim < new Date()) return false
  }

  return true
}
