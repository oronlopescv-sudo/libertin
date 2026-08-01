/**
 * 💰 API - PRICING MANAGEMENT (ID specific)
 * GET /api/admin/pricing/[name] - Obter um plano
 * PUT /api/admin/pricing/[name] - Atualizar um plano
 * DELETE /api/admin/pricing/[name] - Deletar um plano
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    name: string
  }
}

/**
 * GET /api/admin/pricing/[name]
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const plan = await prisma.pricingPlan.findUnique({
      where: { name: params.name },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...plan,
      priceEuro: plan.priceEuro.toNumber(),
      priceDolar: plan.priceDolar?.toNumber(),
      priceCve: plan.priceCve?.toNumber(),
      features: typeof plan.features === 'string'
        ? JSON.parse(plan.features)
        : plan.features,
    })
  } catch (error) {
    console.error('Error fetching pricing plan:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar plano de preço' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/pricing/[name]
 * Atualiza um plano de preço
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()

    const plan = await prisma.pricingPlan.update({
      where: { name: params.name },
      data: {
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

    return NextResponse.json({
      ...plan,
      priceEuro: plan.priceEuro.toNumber(),
      priceDolar: plan.priceDolar?.toNumber(),
      priceCve: plan.priceCve?.toNumber(),
      features: typeof plan.features === 'string'
        ? JSON.parse(plan.features)
        : plan.features,
    })
  } catch (error) {
    console.error('Error updating pricing plan:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar plano de preço' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/pricing/[name]
 * Deleta um plano de preço (soft delete)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const plan = await prisma.pricingPlan.update({
      where: { name: params.name },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'Plano deletado com sucesso' })
  } catch (error) {
    console.error('Error deleting pricing plan:', error)
    return NextResponse.json(
      { error: 'Erro ao deletar plano de preço' },
      { status: 500 }
    )
  }
}
