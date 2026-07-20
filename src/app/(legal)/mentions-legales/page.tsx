export const metadata = {
  title: 'Mentions Légales - RencontresPremium.fr',
}

export default function MentionsLegalesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold font-heading mb-8 text-primary-900 dark:text-primary-100">
        Mentions Légales
      </h1>

      <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Éditeur du site</h2>
          <p>
            [Raison sociale à compléter]
            <br />
            [Adresse du siège social]
            <br />
            [Numéro SIRET / RCS]
            <br />
            Email : contact@rencontres-premium.fr
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Directeur de la publication</h2>
          <p>[Nom du directeur de la publication]</p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Hébergement</h2>
          <p>
            [Nom de l&apos;hébergeur]
            <br />
            [Adresse de l&apos;hébergeur]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Contenu réservé aux adultes</h2>
          <p>
            Ce site s&apos;adresse exclusivement à un public majeur (18 ans et plus). Il propose
            un service de mise en relation entre adultes consentants. Conformément à la loi, des
            mesures de vérification d&apos;âge sont appliquées lors de l&apos;inscription.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments du site (design, textes, logo) est protégé par le droit
            de la propriété intellectuelle. Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Signalement</h2>
          <p>
            Pour signaler un contenu illicite ou un comportement inapproprié :
            signalement@rencontres-premium.fr. Les signalements sont traités sous 24 heures.
          </p>
        </section>
      </div>
    </div>
  )
}
