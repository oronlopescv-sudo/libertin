import Link from 'next/link'
import { HeroSection } from '@/components/hero-section'
import { villes } from '@/lib/villes'

// Pratiques affichées directement sur la homepage — format Libertic
const pratiques = [
  { nom: 'Partage de photos', def: 'Partage de photos personnelles privées.' },
  { nom: 'Partage vidéos/webcam', def: 'Partage de vidéos personnelles privées et/ou visioconférence.' },
  { nom: 'Dialogue uniquement', def: 'Dialogue sur la plateforme uniquement.' },
  { nom: 'Exhibitionnisme', def: "Le fait de se montrer ou d'avoir des relations devant d'autres personnes consentantes." },
  { nom: 'Voyeurisme', def: "L'attirance à observer l'intimité d'une personne ou d'un groupe consentant." },
  { nom: 'Échangisme', def: 'Pratiques entre un couple et un ou plusieurs partenaires hors couple.' },
  { nom: 'Mélangisme', def: 'Pratiques entre un couple et d\'autres partenaires, sans rapport complet hors couple.' },
  { nom: 'Côte-à-côtisme', def: "Pratiques sans échange de partenaire, dans la même pièce qu'un ou plusieurs autres couples." },
  { nom: 'Sorties et ambiances sexy', def: 'Soirées à thème, dîners coquins et sorties en club.' },
  { nom: 'Triolisme', def: 'Pratiques entre un couple et une ou un autre partenaire.' },
  { nom: 'Entre femmes', def: 'Pratiques privilégiant les rapports entre deux femmes.' },
  { nom: 'Relations hétéro à deux', def: 'Relation entre un homme et une femme uniquement.' },
  { nom: '2+2', def: 'Couples séparés chacun de leur côté, dans la même pièce ou des pièces différentes.' },
  { nom: 'Relations homo à deux', def: 'Relation entre deux personnes de même sexe.' },
  { nom: 'Pluralité masculine', def: 'Pratiques entre une femme ou un couple et plusieurs hommes.' },
  { nom: 'Fétichisme', def: "Recherche érotique liée à une partie du corps, un objet ou une matière (cuir, latex, dentelle...)." },
  { nom: 'Domination / Soumission', def: 'Pratiques fondées sur une relation consentante de dominant à dominé.' },
  { nom: 'Candaulisme', def: "Pratiques devant le regard consentant et demandeur du partenaire habituel." },
  { nom: 'Selon feeling', def: 'Selon feeling.' },
]

const avantages = [
  { icon: '🤫', titre: 'Discrétion et respect', sous: 'de la vie privée' },
  { icon: '✨', titre: 'Fonctionnalités modernes', sous: 'et exclusives' },
  { icon: '👥', titre: 'Des milliers de membres', sous: 'en France, Belgique, Suisse' },
  { icon: '🌍', titre: 'Débutants ou expérimentés', sous: 'dans votre région' },
  { icon: '🔥', titre: 'Toutes les pratiques', sous: 'libertines' },
  { icon: '💚', titre: 'Inscription gratuite', sous: 'femmes et couples' },
]

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero avec formulaire — format Libertic */}
      <HeroSection />

      {/* Bandeau découverte */}
      <section className="py-12 px-4 bg-white dark:bg-slate-900 text-center">
        <h2 className="text-xl md:text-2xl font-bold font-heading text-slate-900 dark:text-slate-100 max-w-3xl mx-auto">
          <strong className="text-primary-600">
            Découvrez des milliers de couples, femmes et hommes,
          </strong>{' '}
          et faites-vous de nouvelles relations
        </h2>
      </section>

      {/* Proportion unique — deux blocs comme Libertic */}
      <section className="py-14 px-4 bg-slate-100 dark:bg-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-10 text-slate-900 dark:text-slate-100">
            Une proportion unique de <span className="text-primary-600">couples</span> et de{' '}
            <span className="text-primary-600">femmes</span>
          </h2>
          <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl py-10 px-4 text-white shadow-elevated">
              <div className="text-4xl mb-3">👩👫</div>
              <p className="font-bold font-heading text-lg">Couples & femmes</p>
              <p className="text-3xl font-bold font-heading mt-2">78 %</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-10 px-4 shadow-card">
              <div className="text-4xl mb-3">👨</div>
              <p className="font-bold font-heading text-lg text-slate-700 dark:text-slate-300">
                Hommes
              </p>
              <p className="text-3xl font-bold font-heading mt-2 text-slate-500">22 %</p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages — 6 icônes comme Libertic */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-12 text-slate-900 dark:text-slate-100">
            Rejoignez-nous et profitez gratuitement{' '}
            <strong className="text-primary-600">de nombreux avantages</strong>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {avantages.map((a, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-50 to-accent-50 dark:from-primary-950 dark:to-accent-950 border border-primary-100 dark:border-primary-900 flex items-center justify-center text-4xl">
                  {a.icon}
                </div>
                <h3 className="font-bold font-heading text-sm md:text-base text-slate-900 dark:text-slate-100">
                  {a.titre}
                </h3>
                <p className="text-xs md:text-sm text-slate-500">{a.sous}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pratiques sur la homepage — format Libertic */}
      <section className="py-16 px-4 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-center mb-4 text-slate-900 dark:text-slate-100">
            Toutes les pratiques libertines
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
            Indiquez vos envies sur votre profil et ne rencontrez que des personnes
            compatibles. Débutants bienvenus.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {pratiques.map((p, i) => (
              <div key={i}>
                <h3 className="font-bold font-heading text-primary-700 dark:text-primary-300 mb-1">
                  {p.nom}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {p.def}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/pratiques"
              className="text-primary-600 font-semibold text-sm hover:underline"
            >
              Voir le glossaire complet du libertinage →
            </Link>
          </div>
        </div>
      </section>

      {/* Multi-appareils — format Libertic */}
      <section className="py-16 px-4 bg-white dark:bg-slate-900 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold font-heading mb-8 text-slate-900 dark:text-slate-100">
            Restez en contact sur mobile, tablette, ordinateur
          </h2>
          <div className="flex justify-center items-end gap-4 md:gap-8 text-7xl md:text-8xl mb-10 select-none">
            <span className="text-5xl md:text-6xl">📱</span>
            <span>💻</span>
            <span className="text-6xl md:text-7xl">🖥️</span>
          </div>
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-bold font-heading rounded-xl hover:shadow-elevated transition-shadow text-lg tracking-wide"
          >
            JE M&apos;INSCRIS GRATUITEMENT
          </Link>
        </div>
      </section>

      {/* SEO : liens vers les villes */}
      <section className="py-12 px-4 md:px-8 bg-slate-50 dark:bg-slate-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl font-bold font-heading mb-6 text-slate-900 dark:text-slate-100">
            Rencontres libertines dans votre ville
          </h2>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {villes.slice(0, 12).map((v) => (
              <Link
                key={v.slug}
                href={`/rencontre-libertine/${v.slug}`}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm text-slate-700 dark:text-slate-300 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                {v.nom}
              </Link>
            ))}
          </div>
          <Link
            href="/rencontre-libertine"
            className="text-primary-600 font-semibold text-sm hover:underline"
          >
            Voir toutes les villes →
          </Link>
        </div>
      </section>
    </div>
  )
}
