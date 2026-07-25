'use client'

export default function Home() {
  const stats = {
    total: 12847,
    femmesCouples: 76,
    hommes: 24,
  }

  const features = [
    {
      icon: '👩‍🦱',
      title: 'Pour Femmes & Couples',
      desc: 'Accès 100% GRATUIT à tous les profils'
    },
    {
      icon: '💬',
      title: 'Chat en Direct',
      desc: 'Messagerie privée en temps réel'
    },
    {
      icon: '📸',
      title: 'Galerie de Profils',
      desc: 'Photos vérifiées de nos membres'
    }
  ]

  const plans = [
    { name: '3 Mois', price: 16, months: 3 },
    { name: '12 Mois ⭐', price: 25, months: 12 },
    { name: '24 Mois', price: 70, months: 24 }
  ]

  return (
    <div>
      {/* Hero */}
      <section className="gradient-primary text-white py-20 text-center">
        <div className="container">
          <h1 className="text-5xl font-bold mb-4">Bienvenue sur RencontresPremium</h1>
          <p className="text-xl mb-10 opacity-95">Le 1er réseau social libertinge en France</p>

          <div className="flex justify-center gap-12 mb-12 flex-wrap">
            <div>
              <div className="text-4xl font-bold">{stats.total.toLocaleString()}</div>
              <div className="text-sm opacity-90">Membres actifs</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{stats.femmesCouples}%</div>
              <div className="text-sm opacity-90">Femmes & Couples</div>
            </div>
            <div>
              <div className="text-4xl font-bold">{stats.hommes}%</div>
              <div className="text-sm opacity-90">Hommes</div>
            </div>
          </div>

          <a href="/register" className="btn-primary inline-block bg-white text-primary-500 hover:bg-gray-100">
            💌 JE M'INSCRIS GRATUITEMENT
          </a>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Pourquoi RencontresPremium?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="card p-8 text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-primary-500 mb-3">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Plans Premium (Hommes)</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((p, i) => (
              <div key={i} className="card p-8 text-center hover:shadow-xl hover:border-primary-500 border-2 border-transparent transition">
                <h4 className="text-xl font-bold mb-4 text-secondary-500">{p.name}</h4>
                <div className="text-5xl font-bold text-primary-500 mb-6">€{p.price}</div>
                <p className="text-gray-600 mb-6">{p.months} mois d'accès premium</p>
                <button className="btn-primary w-full">Acheter</button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
