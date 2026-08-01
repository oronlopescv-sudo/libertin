/**
 * 💰 API - PRICING MANAGEMENT
 * GET /api/admin/pricing - Listar todos os planos
 * POST /api/admin/pricing - Criar novo plano
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/pricing
 * Retorna todos os planos de preço
 */
export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { priceEuro: 'asc' },
    })

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      priceEuro: plan.priceEuro.toNumber(),
      priceDolar: plan.priceDolar?.toNumber(),
      priceCve: plan.priceCve?.toNumber(),
      billingPeriod: plan.billingPeriod,
      maxMessages: plan.maxMessages,
      maxPhotos: plan.maxPhotos,
      maxProfiles: plan.maxProfiles,
      hasVideoCall: plan.hasVideoCall,
      hasVoiceCall: plan.hasVoiceCall,
      hasAdvancedFilters: plan.hasAdvancedFilters,
      hasVerified: plan.hasVerified,
      hasGallery: plan.hasGallery,
      hasPriority: plan.hasPriority,
      features: typeof plan.features === 'string' 
        ? JSON.parse(plan.features) 
        : plan.features,
      isPopular: plan.isPopular,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    }))

    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error('Error fetching pricing plans:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar planos de preço' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/pricing
 * Cria um novo plano de preço
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const plan = await prisma.pricingPlan.create({
      data: {
        name: body.name,
        displayName: body.displayName,
        description: body.description,
        priceEuro: body.priceEuro,
        priceDolar: body.priceDolar,
        priceCve: body.priceCve,
        billingPeriod: body.billingPeriod,
        maxMessages: body.maxMessages,
        maxPhotos: body.maxPhotos,
        maxProfiles: body.maxProfiles,
        hasVideoCall: body.hasVideoCall,
        hasVoiceCall: body.hasVoiceCall,
        hasAdvancedFilters: body.hasAdvancedFilters,
        hasVerified: body.hasVerified,
        hasGallery: body.hasGallery,
        hasPriority: body.hasPriority,
        features: JSON.stringify(body.features),
        isActive: body.isActive,
        isPopular: body.isPopular,
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating pricing plan:', error)
    return NextResponse.json(
      { error: 'Erro ao criar plano de preço' },
      { status: 500 }
    )
  }
}
