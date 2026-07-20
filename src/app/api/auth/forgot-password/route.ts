import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Réponse identique que l'email existe ou non (évite l'énumération de comptes)
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ message: 'ok' })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (user) {
      const token = randomBytes(32).toString('hex')
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 heure
        },
      })

      // TODO: envoyer via SendGrid le lien `${NEXTAUTH_URL}/reset-password?token=${token}`
      console.log(`[FORGOT_PASSWORD] ${user.email} -> /reset-password?token=${token}`)
    }

    return NextResponse.json({ message: 'ok' })
  } catch {
    return NextResponse.json({ message: 'ok' })
  }
}
