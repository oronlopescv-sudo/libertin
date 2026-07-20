export function Testimonials() {
  const testimonials = [
    {
      text: "Une plateforme super discrète et facile d'utilisation. Nous avons trouvé exactement ce que nous cherchions!",
      author: 'Marie & Thomas',
      badge: '⭐⭐⭐⭐⭐',
    },
    {
      text: 'Chat privé vraiment sécurisé. Les profils vérifiés nous rassurent beaucoup. À recommander!',
      author: 'Sophie',
      badge: '⭐⭐⭐⭐⭐',
    },
    {
      text: 'Excellent service client et beaucoup de profils intéressants. Nous sommes satisfaits.',
      author: 'Luc & Christelle',
      badge: '⭐⭐⭐⭐⭐',
    },
    {
      text: 'Enfin une plateforme qui respects vraiment notre vie privée. C\'est ce qu\'il nous fallait!',
      author: 'Alice',
      badge: '⭐⭐⭐⭐⭐',
    },
  ]

  return (
    <section className="py-16 md:py-24 px-4 md:px-8 bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-primary-950 dark:to-secondary-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-200">
            Ils nous font confiance
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Découvrez les avis de nos utilisateurs vérifiés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-card hover:shadow-elevated transition-shadow border border-slate-200 dark:border-slate-700"
            >
              <div className="text-2xl mb-4">{testimonial.badge}</div>
              <p className="text-slate-700 dark:text-slate-300 mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-full"></div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{testimonial.author}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">✓ Profil vérifié</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
