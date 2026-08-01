'use client'

import React, { useCallback } from 'react'
import Link from 'next/link'

const HeroSectionV2 = React.memo(() => {
  const handleExplore = useCallback(() => {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 pt-20">
        {/* Tagline */}
        <div className="animate-fade-in-down">
          <span className="inline-block px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-sm font-semibold tracking-wide">
            🔥 Comunidade de Adultos Premium
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="animate-fade-in-down animation-delay-200 mt-8 text-5xl sm:text-6xl lg:text-7xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 leading-tight">
          Libertinelover
        </h1>

        {/* Subheading */}
        <p className="animate-fade-in-down animation-delay-400 mt-6 text-lg sm:text-xl text-slate-300 text-center max-w-2xl leading-relaxed">
          Encontros discretos, seguros e sensuais para adultos que exploram suas fantasias sem julgamento
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-in-down animation-delay-600 mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center">
          <Link
            href="/register"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-105 transform"
          >
            Criar Conta Grátis
          </Link>
          <button
            onClick={handleExplore}
            className="px-8 py-4 rounded-xl border-2 border-purple-400/50 text-purple-200 font-bold text-lg hover:bg-purple-500/10 hover:border-purple-300 transition-all duration-300"
          >
            Conhecer Mais ↓
          </button>
        </div>

        {/* Trust Badges */}
        <div className="animate-fade-in-up animation-delay-800 mt-16 flex flex-col sm:flex-row gap-8 text-center text-sm text-slate-400">
          <div>
            <div className="text-2xl font-bold text-purple-300">50K+</div>
            <p>Membros Verificados</p>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block" />
          <div>
            <div className="text-2xl font-bold text-purple-300">24/7</div>
            <p>Suporte Discreto</p>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block" />
          <div>
            <div className="text-2xl font-bold text-purple-300">🔐 100%</div>
            <p>Privado & Seguro</p>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="animate-bounce mt-20">
          <svg className="w-6 h-6 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
      `}</style>
    </section>
  )
})

HeroSectionV2.displayName = 'HeroSectionV2'

export default HeroSectionV2
