import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, PLANS, isValidTier } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { tier } = await request.json()
    if (!tier || !isValidTier(tier)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    const plan = PLANS[tier]
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

    // Créer ou réutiliser le client Stripe
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      })
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: plan.name,
              description: `Accès Premium pendant ${plan.durationMonths} mois`,
            },
            unit_amount: plan.priceEuro * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        tier,
      },
      success_url: `${baseUrl}/abonnements?success=1`,
      cancel_url: `${baseUrl}/abonnements?cancelled=1`,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('[CREATE_CHECKOUT]', error)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement' }, { status: 500 })
  }
}
