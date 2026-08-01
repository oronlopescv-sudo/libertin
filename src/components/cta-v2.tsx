'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'

const CTAV2 = React.memo(() => {
  const handleScroll = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <section className="py-24 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
          Pronto para Encontrar Sua Próxima Conexão?
        </h2>

        {/* Description */}
        <p className="text-xl text-slate-300 mb-12 leading-relaxed max-w-2xl mx-auto">
          Junte-se a milhares de adultos que já encontraram conexões incríveis em Libertinelover. Sem julgamento, sem surpresas, apenas diversão discreta.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/register"
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 transform"
          >
            Criar Conta Agora
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 rounded-xl border-2 border-purple-400/50 text-purple-200 font-bold text-lg hover:bg-purple-500/10 hover:border-purple-300 transition-all duration-300"
          >
            Já Tenho Conta
          </Link>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Conta anônima</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>100% privado</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span>Primeiro mês grátis</span>
          </div>
        </div>
      </div>
    </section>
  )
})

CTAV2.displayName = 'CTAV2'

export default CTAV2
