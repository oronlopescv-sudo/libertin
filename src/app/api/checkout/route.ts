/**
 * 💳 STRIPE CHECKOUT API
 * POST /api/checkout
 * 
 * Cria uma sessão de checkout do Stripe
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
})

// Mapear planos para Product IDs do Stripe
// MUDAR ESTES IDS PELOS REAIS DO STRIPE
const STRIPE_PRODUCTS: Record<string, string> = {
  FREE: process.env.STRIPE_PRODUCT_FREE || 'prod_placeholder_free',
  STARTER: process.env.STRIPE_PRODUCT_STARTER || 'prod_placeholder_starter',
  PRO: process.env.STRIPE_PRODUCT_PRO || 'prod_placeholder_pro',
  BUSINESS: process.env.STRIPE_PRODUCT_BUSINESS || 'prod_placeholder_business',
  VIP: process.env.STRIPE_PRODUCT_VIP || 'prod_placeholder_vip',
}

export async function POST(request: NextRequest) {
  try {
    // Obter sessão do usuário
    const session = await getServerSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Você deve estar conectado' },
        { status: 401 }
      )
    }

    // Obter dados do request
    const body = await request.json()
    const { planName } = body

    // Validar plano
    if (!planName || !STRIPE_PRODUCTS[planName]) {
      return NextResponse.json(
        { error: 'Plano inválido' },
        { status: 400 }
      )
    }

    // Se for FREE, não precisa checkout
    if (planName === 'FREE') {
      // Atualizar subscription do usuário diretamente
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        )
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: 'FREE',
          subscriptionStart: new Date(),
          subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        },
      })

      return NextResponse.json(
        { success: true, message: 'Inscrito no plano FREE' },
        { status: 200 }
      )
    }

    // Obter informações do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Criar ou obter Stripe Customer
    let stripeCustomerId = user.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      })

      stripeCustomerId = customer.id

      // Salvar Stripe Customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      })
    }

    // Criar sessão de checkout
    const origin = request.headers.get('origin') || 'https://seu-dominio.com'

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product: STRIPE_PRODUCTS[planName],
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId: user.id,
        planName: planName,
      },
    })

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error('Erro no checkout:', error)
    return NextResponse.json(
      { error: 'Erro ao criar checkout' },
      { status: 500 }
    )
  }
}
