export const metadata = {
  title: 'Conditions Générales de Vente - RencontresPremium.fr',
}

export default function CGVPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 prose-slate">
      <h1 className="text-3xl font-bold font-heading mb-8 text-primary-900 dark:text-primary-100">
        Conditions Générales de Vente et d&apos;Utilisation
      </h1>

      <div className="space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold font-heading mb-3">1. Objet</h2>
          <p>
            Les présentes conditions régissent l&apos;utilisation de la plateforme
            RencontresPremium.fr, service de mise en relation entre adultes consentants. En
            créant un compte, vous acceptez intégralement ces conditions.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">2. Accès réservé aux majeurs</h2>
          <p>
            L&apos;accès au site est strictement réservé aux personnes âgées de 18 ans révolus.
            Toute fausse déclaration d&apos;âge entraîne la suppression immédiate et définitive
            du compte, sans remboursement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">3. Abonnements et tarifs</h2>
          <p>Trois formules Premium sont proposées, en paiement unique :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Premium 3 mois : 16 € TTC</li>
            <li>Premium 12 mois : 25 € TTC</li>
            <li>Premium 24 mois : 70 € TTC</li>
          </ul>
          <p className="mt-2">
            Le paiement est traité par Stripe. Aucune coordonnée bancaire n&apos;est stockée par
            RencontresPremium.fr. L&apos;abonnement est activé immédiatement après confirmation
            du paiement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">4. Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L221-28 du Code de la consommation, le droit de
            rétractation ne peut être exercé pour les contenus numériques fournis immédiatement
            après l&apos;achat avec votre accord exprès. En activant votre abonnement, vous
            renoncez expressément à votre droit de rétractation.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">5. Comportement des membres</h2>
          <p>Sont strictement interdits et entraînent la suspension du compte :</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Tout contenu ou comportement impliquant des mineurs</li>
            <li>Le harcèlement, les menaces ou la diffusion d&apos;images sans consentement</li>
            <li>La prostitution, le proxénétisme ou toute activité commerciale</li>
            <li>L&apos;usurpation d&apos;identité et les faux profils</li>
            <li>Le partage de coordonnées de tiers sans leur accord</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">6. Résiliation</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis votre profil. La suppression
            du compte entraîne l&apos;effacement de vos données personnelles sous 30 jours,
            conformément à notre politique de confidentialité.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold font-heading mb-3">7. Contact</h2>
          <p>
            Pour toute question : support@rencontres-premium.fr
          </p>
        </section>
      </div>
    </div>
  )
}
