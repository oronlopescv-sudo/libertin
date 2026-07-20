import { Metadata } from 'next'
import Link from 'next/link'
import { villes } from '@/lib/villes'

export const metadata: Metadata = {
  title: 'Rencontre Libertine par Ville : Paris, Lyon, Marseille... | RencontresPremium',
  description:
    'Trouvez des couples libertins et célibataires dans votre ville : Paris, Lyon, Marseille, Toulouse, Bordeaux et toute la France. Inscription gratuite femmes et couples.',
  keywords:
    'rencontre libertine france, libertins par ville, couple échangiste région, site libertin local',
  alternates: {
    canonical: 'https://rencontres-premium.fr/rencontre-libertine',
  },
}

export default function VillesIndexPage() {
  // Regrouper par région
  const parRegion = villes.reduce<Record<string, typeof villes>>((acc, v) => {
    ;(acc[v.region] ??= []).push(v)
    return acc
  }, {})

  const regions = Object.keys(parRegion).sort()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-100 text-center">
        Rencontres libertines partout en France
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 text-center max-w-2xl mx-auto">
        Choisissez votre ville pour découvrir les couples et célibataires libertins près de
        chez vous. Inscription gratuite pour les femmes et les couples.
      </p>

      <div className="space-y-10">
        {regions.map((region) => (
          <section key={region}>
            <h2 className="text-lg font-bold font-heading mb-4 text-slate-900 dark:text-slate-100">
              {region}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {parRegion[region]
                .sort((a, b) => a.nom.localeCompare(b.nom))
                .map((v) => (
                  <Link
                    key={v.slug}
                    href={`/rencontre-libertine/${v.slug}`}
                    className="card !p-4 hover:border-primary-400 transition-colors"
                  >
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {v.nom}
                    </p>
                    <p className="text-xs text-slate-500">Département {v.departement}</p>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>

      <div className="text-center mt-16 bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8">
        <h2 className="text-xl font-bold font-heading text-white mb-3">
          Votre ville n&apos;est pas listée ?
        </h2>
        <p className="text-white/90 text-sm mb-5">
          Inscrivez-vous et indiquez votre localisation : les membres de toute la France sont
          visibles avec le filtre de distance.
        </p>
        <Link
          href="/register"
          className="inline-block px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
        >
          Créer mon profil gratuit
        </Link>
      </div>
    </div>
  )
}
