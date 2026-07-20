export const metadata = {
  title: 'Politique de Confidentialité - RencontresPremium.fr',
}

export default function PrivacitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold font-heading mb-8 text-primary-900 dark:text-primary-100">
        Politique de Confidentialité
      </h1>

      <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Notre engagement</h2>
          <p>
            La discrétion est au cœur de notre service. Vos données personnelles ne sont jamais
            vendues, louées ou partagées avec des tiers à des fins commerciales. Cette politique
            est conforme au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Données collectées</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email et mot de passe (chiffré, jamais lisible)</li>
            <li>Date de naissance (vérification de majorité uniquement)</li>
            <li>Pseudo, bio, photos et centres d&apos;intérêt que vous choisissez de publier</li>
            <li>Messages échangés dans les groupes (visibles uniquement par les membres)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Ce que les autres membres voient</h2>
          <p>
            Uniquement votre pseudo, vos photos publiques, votre bio et votre localisation
            approximative. Votre email, votre nom réel et vos informations de paiement ne sont
            jamais visibles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Paiements</h2>
          <p>
            Les paiements sont traités par Stripe (certifié PCI-DSS niveau 1). Nous ne stockons
            aucun numéro de carte bancaire. Le libellé de facturation est neutre et discret sur
            votre relevé bancaire.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Vos droits (RGPD)</h2>
          <p>Vous disposez à tout moment des droits suivants :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Droit d&apos;accès et de portabilité de vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement (suppression du compte en un clic)</li>
            <li>Droit d&apos;opposition au traitement</li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits : privacy@rencontres-premium.fr. Réponse sous 30 jours
            maximum.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Conservation</h2>
          <p>
            Les données sont conservées tant que votre compte est actif. Après suppression du
            compte, toutes vos données sont effacées définitivement sous 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">Sécurité</h2>
          <p>
            Connexions chiffrées (HTTPS/TLS), mots de passe hachés avec bcrypt, accès aux
            serveurs restreint et journalisé. En cas de violation de données, vous serez informé
            sous 72 heures conformément au RGPD.
          </p>
        </section>
      </div>
    </div>
  )
}
