import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

function generateUsername(email: string): string {
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}_${suffix}`
}

export async function POST(request: NextRequest) {
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
    let finalUsername = generateUsername(normalizedEmail)
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
      },
      select: { id: true, email: true },
    })

    // TODO: envoyer email de vérification via SendGrid

    return NextResponse.json(
      { message: 'Compte créé avec succès. Vérifiez votre email.', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
