import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

/**
 * Liste blanche des administrateurs, définie par la variable
 * d'environnement ADMIN_EMAILS (adresses séparées par des virgules).
 */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const admins = getAdminEmails()
  // Aucun administrateur configuré : on refuse tout accès (fail closed).
  if (admins.length === 0) return false
  return admins.includes(email.toLowerCase())
}

/**
 * Garde pour les routes d'administration.
 * Renvoie une NextResponse d'erreur si l'accès doit être refusé, sinon null.
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 })
  }

  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  return null
}
