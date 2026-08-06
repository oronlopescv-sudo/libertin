import { SubscriptionPlan, SubscriptionTier } from './types';

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'FREE',
    title: 'Compte Découverte',
    durationMonths: 0,
    totalPrice: 0,
    pricePerMonth: 0,
    savings: '100% Gratuit',
    features: [
      'Création de profil libertin anonyme',
      'Accès aux groupes en mode lecture',
      'Envoi de photos de vérification',
      'Support par email en Français',
    ],
  },
  {
    id: 'PREMIUM_3M',
    title: 'Pass Épicurien 3 Mois',
    durationMonths: 3,
    totalPrice: 16,
    pricePerMonth: 5.33,
    savings: 'Économisez 20%',
    features: [
      'Accès illimité à tous les profils vérifiés',
      'Tchat privé & envoi de messages dans les groupes',
      'Filtres de recherche géolocalisés avancés (GPS)',
      'Accès aux albums photos privés',
      'Badge Membre Vérifié mis en valeur',
    ],
  },
  {
    id: 'PREMIUM_12M',
    title: 'Pass Privilège 12 Mois',
    durationMonths: 12,
    totalPrice: 25,
    pricePerMonth: 2.08,
    popular: true,
    savings: 'MEILLEUR VALEUR (-60%)',
    features: [
      'Toutes les fonctionnalités Premium 3M',
      'Création illimitée de groupes de soirées & clubs',
      'Priorité absolue sur la modération & vérification',
      'Visibilité prioritaire dans l\'onglet Découvrir',
      'Mode Fantôme (visites de profil 100% invisibles)',
      'Invitation exclusive aux soirées privées partenaire',
    ],
  },
  {
    id: 'PREMIUM_24M',
    title: 'Pass VIP Elite 24 Mois',
    durationMonths: 24,
    totalPrice: 70,
    pricePerMonth: 2.91,
    savings: 'Sérénité Totale (2 ans)',
    features: [
      'Toutes les fonctionnalités Privilège 12M',
      'Statut VIP Or permanent sur la communauté',
      'Conseiller libertin dédié pour vos sorties',
      'Aucune publicité & aucune restriction d\'envoi',
    ],
  },
];

export function getPlanDetails(tier: SubscriptionTier): SubscriptionPlan {
  return SUBSCRIPTION_PLANS.find((p) => p.id === tier) || SUBSCRIPTION_PLANS[0];
}

/**
 * Calculates end date based on duration in months
 */
export function calculateSubscriptionEndDate(startDate: Date, durationMonths: number): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + durationMonths);
  return endDate;
}
