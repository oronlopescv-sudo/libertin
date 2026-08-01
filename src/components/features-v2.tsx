'use client'

import React from 'react'

const FeaturesV2 = React.memo(() => {
  const features = [
    {
      icon: '🔐',
      title: 'Privacidade Total',
      description: 'Seus dados e identidade são protegidos com criptografia de nível militar. Ninguém descobre sem sua permissão.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '✅',
      title: 'Perfis Verificados',
      description: 'Todos os membros passam por verificação rigorosa para garantir autenticidade e segurança.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💬',
      title: 'Chat em Tempo Real',
      description: 'Converse com compatibilidade, organize encontros discretos e desenvolva conexões reais.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '👥',
      title: 'Comunidade Ativa',
      description: 'Mais de 50.000 membros ativos todos os dias buscando conexões autênticas.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📱',
      title: 'Mobile Optimizado',
      description: 'Acesse de qualquer lugar, qualquer hora. Aplicativo rápido e responsivo.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '🎁',
      title: 'Muitos Benefícios',
      description: 'Fotos premium, filtros avançados, voz e vídeo. Tudo para encontrar conexões perfeitas.',
      color: 'from-pink-500 to-rose-500'
    }
  ]

  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Por Que Escolher
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Libertinelover?
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            A plataforma mais segura, discreta e ativa para encontros de adultos no mercado
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2"
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

              {/* Content */}
              <div className="relative z-10">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-300 leading-relaxed">{feature.description}</p>
              </div>

              {/* Border Glow */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 -z-10 blur-xl transition-opacity duration-300`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})

FeaturesV2.displayName = 'FeaturesV2'

export default FeaturesV2
