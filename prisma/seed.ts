import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await hash('Test1234!', 12)

  // Utilisateur Premium de test
  const premiumEnd = new Date()
  premiumEnd.setFullYear(premiumEnd.getFullYear() + 1)

  const alice = await prisma.user.upsert({
    where: { email: 'alice@test.fr' },
    update: {},
    create: {
      email: 'alice@test.fr',
      hashedPassword: password,
      username: 'Alice_Lyon',
      dateOfBirth: new Date('1992-04-12'),
      gender: 'femme',
      sexualOrientation: 'bi',
      location: 'Lyon',
      bio: 'Curieuse et discrète. Ouverte aux belles rencontres.',
      interests: ['Soirées privées', 'Voyages', 'Danse'],
      isVerified: true,
      subscriptionTier: 'PREMIUM_12M',
      subscriptionStart: new Date(),
      subscriptionEnd: premiumEnd,
    },
  })

  const couple = await prisma.user.upsert({
    where: { email: 'couple@test.fr' },
    update: {},
    create: {
      email: 'couple@test.fr',
      hashedPassword: password,
      username: 'Duo_Paris',
      dateOfBirth: new Date('1988-09-03'),
      gender: 'couple',
      sexualOrientation: 'hetero',
      location: 'Paris',
      bio: 'Couple complice depuis 8 ans, nous cherchons des rencontres élégantes.',
      interests: ['Clubs', 'Gastronomie', 'Art & culture'],
      isVerified: true,
      subscriptionTier: 'PREMIUM_24M',
      subscriptionStart: new Date(),
      subscriptionEnd: premiumEnd,
    },
  })

  // Utilisateur gratuit de test
  await prisma.user.upsert({
    where: { email: 'free@test.fr' },
    update: {},
    create: {
      email: 'free@test.fr',
      hashedPassword: password,
      username: 'Marc_Free',
      dateOfBirth: new Date('1995-01-20'),
      gender: 'homme',
      sexualOrientation: 'hetero',
      location: 'Marseille',
      isVerified: false,
    },
  })

  // Groupe de test
  const group = await prisma.group.upsert({
    where: { id: 'seed-group-1' },
    update: {},
    create: {
      id: 'seed-group-1',
      name: 'Soirées Rhône-Alpes',
      description: 'Organisation de soirées privées dans la région lyonnaise. Ambiance élégante et bienveillante.',
      category: 'casual',
      isPrivate: false,
      creatorId: alice.id,
      members: {
        create: [
          { userId: alice.id, role: 'admin' },
          { userId: couple.id, role: 'member' },
        ],
      },
    },
  })

  await prisma.message.createMany({
    data: [
      {
        userId: alice.id,
        groupId: group.id,
        content: 'Bienvenue à tous ! Prochaine soirée le mois prochain 🥂',
      },
      {
        userId: couple.id,
        groupId: group.id,
        content: 'Merci pour l\'invitation, on a hâte !',
      },
    ],
  })

  console.log('✅ Seed terminé')
  console.log('Comptes de test (mot de passe : Test1234!) :')
  console.log('  - alice@test.fr (Premium, femme)')
  console.log('  - couple@test.fr (Premium, couple)')
  console.log('  - free@test.fr (Gratuit, homme)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
