import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.hashedPassword) {
          throw new Error('Identifiants incorrects')
        }

        if (user.isBanned) {
          throw new Error('Ce compte a été suspendu')
        }

        const isValid = await compare(credentials.password, user.hashedPassword)
        if (!isValid) {
          throw new Error('Identifiants incorrects')
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      // Rafraîchir les infos d'abonnement à chaque requête token
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            subscriptionTier: true,
            subscriptionEnd: true,
            isVerified: true,
            username: true,
            gender: true,
          },
        })
        if (dbUser) {
          token.subscriptionTier = dbUser.subscriptionTier
          token.subscriptionEnd = dbUser.subscriptionEnd?.toISOString() ?? null
          token.isVerified = dbUser.isVerified
          token.gender = dbUser.gender
          token.name = dbUser.username
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.subscriptionTier = token.subscriptionTier as string
        session.user.subscriptionEnd = token.subscriptionEnd as string | null
        session.user.isVerified = token.isVerified as boolean
        session.user.gender = token.gender as string
      }
      return session
    },
  },
}

/** Vérifie si l'utilisateur a un abonnement Premium actif */
export function isPremium(subscriptionEnd: string | Date | null | undefined): boolean {
  if (!subscriptionEnd) return false
  return new Date(subscriptionEnd) > new Date()
}

/**
 * RÈGLE D'ACCÈS (modèle Libertic) :
 * - Femmes et couples : accès complet GRATUIT (voir profils, groupes, chat)
 * - Hommes : abonnement Premium requis
 * Cela garantit un bon ratio femmes/couples sur la plateforme.
 */
export function hasFullAccess(
  gender: string | null | undefined,
  subscriptionEnd: string | Date | null | undefined
): boolean {
  if (gender === 'femme' || gender === 'couple') return true
  return isPremium(subscriptionEnd)
}
