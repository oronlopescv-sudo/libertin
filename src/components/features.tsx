export function Features() {
  const features = [
    {
      icon: '🔒',
      title: 'Sécurité Garantie',
      description: 'Vérification stricte des profils, photos et identité. Votre sécurité est notre priorité.',
    },
    {
      icon: '🤫',
      title: 'Discrétion Totale',
      description: 'Aucune information n\'est partagée. Pseudonymes, notifications discrètes, aucune trace.',
    },
    {
      icon: '💬',
      title: 'Chat Privé',
      description: 'Messagerie en temps réel avec chiffrement. Groupes privés jusqu\'à 50 personnes.',
    },
    {
      icon: '📱',
      title: 'Mobile Optimisé',
      description: 'Application responsive. Accédez à tout depuis votre téléphone en toute discrétion.',
    },
    {
      icon: '🌍',
      title: 'Géolocalisation',
      description: 'Trouvez des partenaires près de vous. Filtrez par localisation et intérêts.',
    },
    {
      icon: '⭐',
      title: 'Communauté Active',
      description: 'Des milliers de profils vérifiés. Nouvelle communauté accueil quotidiennement.',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-white dark:bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-200">
            Pourquoi nous choisir ?
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Une plateforme conçue pour votre sécurité, votre discrétion et votre confort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-card transition-shadow"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold font-heading mb-3 text-primary-900 dark:text-primary-200">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
