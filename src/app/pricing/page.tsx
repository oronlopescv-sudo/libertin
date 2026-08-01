import Link from 'next/link'
import { PLANS, BENEFITS, formatEuro } from '@/config/plans'

/**
 * 💰 PAGE PUBLIQUE DES TARIFS
 * URL: /pricing
 *
 * Les formules affichées viennent de @/config/plans, la même source que
 * l'espace membre et que la validation du paiement. Un plan montré ici est
 * donc toujours réellement achetable.
 */

export const metadata = {
  title: "Nos abonnements — Libertinelover",
  description:
    "Découvrez les formules Premium de Libertinelover : accès illimité aux profils, groupes et chat. Inscription gratuite pour les femmes et les couples.",
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* En-tête */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4">
          Nos abonnements
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Un paiement unique, sans reconduction automatique et sans prélèvement caché.
        </p>

        <div className="mt-8 inline-flex items-start gap-3 text-left bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-xl px-5 py-4 max-w-xl">
          <span className="text-green-600 text-xl leading-none">✓</span>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <strong>Femmes et couples :</strong> inscription et accès complet entièrement
            gratuits. Aucun abonnement nécessaire.
          </p>
        </div>
      </div>

      {/* Formules */}
      <div className="max-w-5xl mx-auto px-4 pb-8">
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded-2xl border-2 bg-white dark:bg-slate-800 p-6 flex flex-col transition-shadow hover:shadow-elevated ${
                plan.highlighted
                  ? 'border-primary-500 md:scale-105'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  ⭐ Le plus choisi
                </span>
              )}

              <h2 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                {plan.name}
              </h2>

              <div className="mb-1">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">
                  {formatEuro(plan.priceEuro)}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                soit {plan.monthly} · valable {plan.durationMonths} mois
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <span className="text-green-600 leading-none mt-1">✓</span>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/abonnements"
                className={`block w-full py-3 px-4 rounded-lg font-bold text-center transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white hover:shadow-elevated'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                Choisir cette formule
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Rappel : le paiement se fait depuis l'espace membre */}
      <div className="max-w-5xl mx-auto px-4 pb-20 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Le paiement se fait depuis votre espace membre.{' '}
          <Link href="/register" className="text-primary-600 font-semibold hover:underline">
            Créez votre compte gratuitement
          </Link>{' '}
          pour commencer.
        </p>
      </div>
    </div>
  )
}
