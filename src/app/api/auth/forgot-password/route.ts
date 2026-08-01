import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { sendMail, passwordResetEmail } from '@/lib/mail'

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

      const baseUrl =
        process.env.NEXTAUTH_URL?.replace(/\/$/, '') ??
        new URL(request.url).origin
      const resetUrl = `${baseUrl}/reset-password?token=${token}`

      const mail = passwordResetEmail(resetUrl)
      const result = await sendMail({
        to: user.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      })

      if (!result.sent) {
        // Sem SMTP configurado o link fica nos logs do servidor,
        // para o administrador o poder enviar manualmente.
      }
    }

    return NextResponse.json({ message: 'ok' })
  } catch {
    return NextResponse.json({ message: 'ok' })
  }
}
