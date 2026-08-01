import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendMail, welcomeEmail } from '@/lib/mail'
import { describeDbError } from '@/lib/db-errors'
import { checkRateLimit, clientIp, tooManyRequests } from '@/lib/rateLimit'

function generateUsername(email: string): string {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'membre'
  const suffix = randomBytes(3).toString('hex')
  return `${base}_${suffix}`
}

/** Pseudo automatique garanti libre (quelques essais suffisent). */
async function uniqueUsername(email: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const candidate = generateUsername(email)
    const taken = await prisma.user.findUnique({ where: { username: candidate } })
    if (!taken) return candidate
  }
  return `membre_${randomBytes(6).toString('hex')}`
}

export async function POST(request: NextRequest) {
  if (!request.headers.get("content-type")) {
    return NextResponse.json({ error: "Invalid content-type" }, { status: 400 })
  }
  if (!checkRateLimit(`register:${clientIp(request)}`, 5)) {
    return tooManyRequests()
  }
  try {
    const { email, password, dateOfBirth, gender, sexualOrientation, username, pays } =
      await request.json()

    if (!email || !password || !dateOfBirth || !gender || !sexualOrientation) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    const validGenders = ['homme', 'femme', 'couple']
    if (!validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Type de profil invalide' }, { status: 400 })
    }

    // Vérification stricte de l'âge : 18 ans minimum
    const birthDate = new Date(dateOfBirth)
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json({ error: 'Date de naissance invalide' }, { status: 400 })
    }
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - 18)
    if (birthDate > cutoff) {
      return NextResponse.json(
        { error: 'Vous devez être âgé de 18 ans minimum pour vous inscrire' },
        { status: 403 }
      )
    }

    const normalizedEmail = String(email).toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }

    // Pseudo choisi sur la homepage (format Libertic) — vérifier l'unicité
    let finalUsername = await uniqueUsername(normalizedEmail)
    if (typeof username === 'string' && username.trim().length >= 4) {
      const cleaned = username.trim().slice(0, 16)
      const taken = await prisma.user.findUnique({ where: { username: cleaned } })
      if (taken) {
        return NextResponse.json({ error: 'Ce pseudo est déjà pris' }, { status: 409 })
      }
      finalUsername = cleaned
    }

    const hashedPassword = await hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        hashedPassword,
        username: finalUsername,
        dateOfBirth: birthDate,
        gender,
        sexualOrientation,
        location: typeof pays === 'string' ? pays : '',
        // Sem isto, quem se regista fica no fim de /decouvrir:
        // em MySQL o NULL ordena a seguir a qualquer data.
        lastLoginAt: new Date(),
      },
      select: { id: true, email: true, username: true },
    })

    // Email de bienvenue (ne bloque jamais l'inscription])
    try {
      const baseUrl =
        process.env.NEXTAUTH_URL?.replace(/\/$/, '') ?? new URL(request.url).origin
      const mail = welcomeEmail(user.username, `${baseUrl}/login`)
      await sendMail({
        to: user.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
      })
    } catch {
      // L'email de bienvenue est non-critique; l'inscription réussit quand même
    }

    return NextResponse.json(
      { message: 'Compte créé avec succès.', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    const detail = describeDbError(error)
    return NextResponse.json(
      { error: `Inscription impossible — ${detail.message}`, code: detail.code },
      { status: 500 }
    )
  }
}
