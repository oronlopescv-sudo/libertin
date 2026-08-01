'use client'

import React from 'react'

const FeaturesV2 = React.memo(() => {
  const features = [
    {
      icon: '🔐',
      title: 'Confidentialité totale',
      description: 'Vos données et votre identité sont protégées par un chiffrement de niveau militaire. Personne ne vous découvre sans votre accord.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '✅',
      title: 'Profils vérifiés',
      description: 'Tous les membres passent par une vérification rigoureuse garantissant authenticité et sécurité.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '💬',
      title: 'Chat en temps réel',
      description: 'Échangez en toute compatibilité, organisez des rencontres discrètes et créez de vraies connexions.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '👥',
      title: 'Communauté active',
      description: 'Plus de 50 000 membres actifs chaque jour à la recherche de connexions authentiques.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '📱',
      title: 'Optimisé pour mobile',
      description: 'Accédez au site partout, à toute heure. Rapide et parfaitement responsive.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '🎁',
      title: 'De nombreux avantages',
      description: 'Photos premium, filtres avancés, voix et vidéo. Tout pour trouver les bonnes rencontres.',
      color: 'from-pink-500 to-rose-500'
    }
  ]

  return (
    <section id="features" className="py-24 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Pourquoi choisir
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Libertinelover?
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            La plateforme la plus sûre, la plus discrète et la plus active pour les rencontres entre adultes
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
