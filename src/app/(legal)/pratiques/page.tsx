import Link from 'next/link'

export const metadata = {
  title: 'Glossaire du Libertinage : Échangisme, Mélangisme, Candaulisme... | RencontresPremium',
  description:
    'Toutes les pratiques libertines expliquées simplement : échangisme, mélangisme, côte-à-côtisme, triolisme, candaulisme et plus. Guide pour débutants et confirmés.',
  keywords:
    'échangisme définition, mélangisme, libertinage débutant, candaulisme, côte-à-côtisme, triolisme, pratiques libertines',
}

const pratiques = [
  {
    slug: 'echangisme',
    nom: 'Échangisme',
    def: "Pratiques entre un couple et un ou plusieurs partenaires hors couple, avec échange complet de partenaires. C'est la pratique la plus connue du libertinage.",
  },
  {
    slug: 'melangisme',
    nom: 'Mélangisme',
    def: "Pratiques entre un couple et d'autres partenaires, avec caresses et jeux partagés mais sans rapport complet hors du couple. Souvent une première étape avant l'échangisme.",
  },
  {
    slug: 'cote-a-cotisme',
    nom: 'Côte-à-côtisme',
    def: "Pratiques sans aucun échange de partenaire, en partageant simplement la même pièce qu'un ou plusieurs autres couples. Lié à l'exhibitionnisme et au voyeurisme, idéal pour débuter.",
  },
  {
    slug: 'triolisme',
    nom: 'Triolisme',
    def: "Pratiques entre un couple et une ou un autre partenaire (trio). Peut prendre la forme de mélangisme ou d'échangisme selon les envies de chacun.",
  },
  {
    slug: 'candaulisme',
    nom: 'Candaulisme',
    def: "Pratique où l'un des partenaires prend du plaisir à voir l'autre avec une ou plusieurs autres personnes, avec son consentement plein et entier.",
  },
  {
    slug: 'exhibitionnisme',
    nom: 'Exhibitionnisme',
    def: "Le fait de se montrer ou d'avoir des relations devant d'autres personnes consentantes, dans un cadre privé et légal (clubs, soirées privées).",
  },
  {
    slug: 'voyeurisme',
    nom: 'Voyeurisme',
    def: "L'attirance à observer l'intimité d'une personne ou d'un groupe consentant, en club ou lors de soirées privées.",
  },
  {
    slug: 'entre-femmes',
    nom: 'Entre femmes',
    def: 'Pratiques privilégiant les rapports entre deux femmes, seules ou en présence de partenaires masculins uniquement spectateurs.',
  },
  {
    slug: 'pluralite-masculine',
    nom: 'Pluralité masculine',
    def: 'Pratiques entre une femme ou un couple et plusieurs hommes, toujours dans un cadre consenti et organisé.',
  },
  {
    slug: 'deux-plus-deux',
    nom: '2+2',
    def: 'Pratique échangiste où les couples se trouvent séparés chacun de leur côté, dans la même pièce ou des pièces différentes.',
  },
  {
    slug: 'fetichisme',
    nom: 'Fétichisme',
    def: "Recherche érotique liée à une partie du corps, un objet (lingerie, talons, bottes) ou une matière (cuir, latex, dentelle).",
  },
  {
    slug: 'domination-soumission',
    nom: 'Domination / Soumission',
    def: "Ensemble de pratiques fondées sur une relation consentante et encadrée de dominant à dominé, psychologique et/ou physique.",
  },
  {
    slug: 'soirees-sexy',
    nom: 'Sorties et ambiances sexy',
    def: "Soirées à thème, dîners coquins et sorties en club où l'ambiance prime, sans obligation d'aller plus loin.",
  },
  {
    slug: 'dialogue',
    nom: 'Dialogue uniquement',
    def: "Échanger et discuter sur la plateforme sans projet de rencontre physique. Beaucoup de membres commencent ainsi.",
  },
]

export default function PratiquesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-primary-900 dark:text-primary-100">
          Le glossaire du libertinage
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Débutant ou confirmé, chacun avance à son rythme. Voici toutes les pratiques
          expliquées simplement, sans jugement. Sur RencontresPremium, vous indiquez vos envies
          sur votre profil et ne rencontrez que des personnes compatibles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
        {pratiques.map((p) => (
          <article
            key={p.slug}
            id={p.slug}
            className="card"
            itemScope
            itemType="https://schema.org/DefinedTerm"
          >
            <h2
              className="font-bold font-heading text-lg text-primary-800 dark:text-primary-200 mb-2"
              itemProp="name"
            >
              {p.nom}
            </h2>
            <p
              className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
              itemProp="description"
            >
              {p.def}
            </p>
          </article>
        ))}
      </div>

      <div className="text-center bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold font-heading text-white mb-3">
          Prêt(e) à faire de belles rencontres ?
        </h2>
        <p className="text-white/90 mb-6">
          Inscription gratuite pour les femmes et les couples. Discrétion garantie.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-white text-primary-600 font-bold rounded-xl hover:bg-slate-100 transition-colors"
        >
          Je m&apos;inscris gratuitement
        </Link>
      </div>
    </div>
  )
}
