import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { villes, getVille, getVillesProches } from '@/lib/villes'

interface Props {
  params: { ville: string }
}

// Génération statique de toutes les pages villes au build
export function generateStaticParams() {
  return villes.map((v) => ({ ville: v.slug }))
}

export function generateMetadata({ params }: Props): Metadata {
  const ville = getVille(params.ville)
  if (!ville) return {}

  return {
    title: `Rencontre Libertine ${ville.nom} (${ville.departement}) : Couples et Célibataires | RencontresPremium`,
    description: `Rencontrez des couples libertins et célibataires à ${ville.nom} et en ${ville.region}. Inscription gratuite pour les femmes et couples. Profils vérifiés, discrétion garantie.`,
    keywords: `rencontre libertine ${ville.nom.toLowerCase()}, libertins ${ville.nom.toLowerCase()}, couple échangiste ${ville.nom.toLowerCase()}, club libertin ${ville.departement}, ${ville.region.toLowerCase()}`,
    alternates: {
      canonical: `https://rencontres-premium.fr/rencontre-libertine/${ville.slug}`,
    },
    openGraph: {
      title: `Rencontres libertines à ${ville.nom} — Couples et célibataires`,
      description: ville.intro,
      type: 'website',
    },
  }
}

export default function VillePage({ params }: Props) {
  const ville = getVille(params.ville)
  if (!ville) notFound()

  const proches = getVillesProches(ville)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
      {/* Fil d'Ariane */}
      <nav className="text-xs text-slate-500 mb-8" aria-label="Fil d'Ariane">
        <Link href="/" className="hover:text-primary-600">
          Accueil
        </Link>
        {' › '}
        <Link href="/rencontre-libertine" className="hover:text-primary-600">
          Rencontre libertine
        </Link>
        {' › '}
        <span className="text-slate-700 dark:text-slate-300">{ville.nom}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-100">
        Rencontre libertine à {ville.nom}
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
        {ville.intro}
      </p>

      {/* CTA principal */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-6 md:p-8 mb-12 text-center">
        <p className="text-white font-bold font-heading text-xl mb-2">
          Couples et célibataires vous attendent à {ville.nom}
        </p>
        <p className="text-white/90 text-sm mb-5">
          Inscription 100% gratuite pour les femmes et les couples · Profils vérifiés
        </p>
        <Link
          href={`/register`}
          className="inline-block px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
        >
          Voir les profils de {ville.nom}
        </Link>
      </div>

      {/* Contenu local unique */}
      <div className="space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold font-heading mb-3 text-slate-900 dark:text-slate-100">
            Le libertinage à {ville.nom} et en {ville.region}
          </h2>
          <p>
            Avec environ {ville.habitants} d&apos;habitants, {ville.nom} ({ville.departement})
            compte une communauté libertine active de couples, femmes et hommes de tous âges.
            Que vous habitiez {ville.quartiers[0]}, {ville.quartiers[1]} ou{' '}
            {ville.quartiers[2]}, vous trouverez sur RencontresPremium des membres vérifiés
            près de chez vous, du côte-à-côtisme pour débuter jusqu&apos;à l&apos;échangisme
            pour les plus expérimentés.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3 text-slate-900 dark:text-slate-100">
            Comment rencontrer des libertins à {ville.nom} ?
          </h2>
          <p>
            Créez votre profil gratuitement, indiquez {ville.nom} comme localisation et
            précisez vos envies parmi{' '}
            <Link href="/pratiques" className="text-primary-600 underline">
              toutes les pratiques libertines
            </Link>
            . Vous pourrez ensuite découvrir les profils de la région, rejoindre les groupes de
            discussion locaux et organiser vos rencontres en toute discrétion. Notre
            plateforme garantit une proportion unique de femmes et de couples grâce à son
            modèle d&apos;inscription gratuite pour elles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3 text-slate-900 dark:text-slate-100">
            Discrétion et sécurité avant tout
          </h2>
          <p>
            Tous les profils de {ville.nom} peuvent être vérifiés par photo. Votre email et
            votre identité restent privés : seul votre pseudo est visible. Les groupes de
            discussion sont privés et le libellé bancaire de l&apos;abonnement est neutre.
          </p>
        </section>
      </div>

      {/* Maillage interne : villes proches */}
      {proches.length > 0 && (
        <section className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold font-heading mb-4 text-slate-900 dark:text-slate-100">
            Rencontres libertines près de {ville.nom}
          </h2>
          <div className="flex flex-wrap gap-2">
            {proches.map((p) => (
              <Link
                key={p.slug}
                href={`/rencontre-libertine/${p.slug}`}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                {p.nom}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* JSON-LD pour Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: `Rencontre libertine à ${ville.nom}`,
            description: ville.intro,
            about: {
              '@type': 'City',
              name: ville.nom,
              containedInPlace: { '@type': 'AdministrativeArea', name: ville.region },
            },
          }),
        }}
      />
    </div>
  )
}
