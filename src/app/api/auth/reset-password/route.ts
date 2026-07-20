import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (typeof token !== 'string' || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const reset = await prisma.passwordReset.findUnique({ where: { token } })

    if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
    }

    const hashedPassword = await hash(password, 12)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ])

    return NextResponse.json({ message: 'Mot de passe réinitialisé' })
  } catch (error) {
    console.error('[RESET_PASSWORD]', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
