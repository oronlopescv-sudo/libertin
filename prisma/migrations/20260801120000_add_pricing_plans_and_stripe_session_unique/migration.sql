-- Table des formules d'abonnement, gérées depuis /admin/pricing.
CREATE TABLE IF NOT EXISTS `pricing_plans` (
  `id`                 VARCHAR(191)  NOT NULL,
  `name`               VARCHAR(191)  NOT NULL,
  `displayName`        VARCHAR(191)  NOT NULL,
  `description`        TEXT          NULL,
  `priceEuro`          DECIMAL(8,2)  NOT NULL,
  `priceDolar`         DECIMAL(8,2)  NULL,
  `priceCve`           DECIMAL(10,2) NULL,
  `billingPeriod`      VARCHAR(191)  NOT NULL DEFAULT 'monthly',
  `maxMessages`        INT           NOT NULL DEFAULT 0,
  `maxPhotos`          INT           NOT NULL DEFAULT 0,
  `maxProfiles`        INT           NOT NULL DEFAULT 0,
  `hasVideoCall`       BOOLEAN       NOT NULL DEFAULT false,
  `hasVoiceCall`       BOOLEAN       NOT NULL DEFAULT false,
  `hasAdvancedFilters` BOOLEAN       NOT NULL DEFAULT false,
  `hasVerified`        BOOLEAN       NOT NULL DEFAULT false,
  `hasGallery`         BOOLEAN       NOT NULL DEFAULT false,
  `hasPriority`        BOOLEAN       NOT NULL DEFAULT false,
  `features`           JSON          NULL,
  `isActive`           BOOLEAN       NOT NULL DEFAULT true,
  `isPopular`          BOOLEAN       NOT NULL DEFAULT false,
  `createdAt`          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`          DATETIME(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  UNIQUE INDEX `pricing_plans_name_key`(`name`),
  INDEX `pricing_plans_isActive_priceEuro_idx`(`isActive`, `priceEuro`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Les trois formules réellement vendues (alignées sur src/config/plans.ts
-- et sur PLANS dans src/lib/stripe.ts, que le paiement valide).
INSERT INTO `pricing_plans` (
  `id`, `name`, `displayName`, `description`, `priceEuro`, `billingPeriod`,
  `maxMessages`, `maxPhotos`, `maxProfiles`,
  `hasVideoCall`, `hasVoiceCall`, `hasAdvancedFilters`,
  `hasVerified`, `hasGallery`, `hasPriority`,
  `features`, `isActive`, `isPopular`, `createdAt`, `updatedAt`
) VALUES
(
  'plan-premium-3m', 'PREMIUM_3M', 'Premium 3 mois',
  'Accès complet pendant 3 mois, sans reconduction automatique.',
  16.00, 'quarterly', 9999, 20, 0,
  false, false, true, false, false, false,
  JSON_ARRAY(
    'Voir tous les profils (couples et célibataires)',
    'Créer et rejoindre des groupes de discussion',
    'Chat illimité en temps réel',
    'Filtres de recherche avancés',
    'Badge Premium sur votre profil'
  ),
  true, false, NOW(3), NOW(3)
),
(
  'plan-premium-12m', 'PREMIUM_12M', 'Premium 1 an',
  'La formule la plus choisie : 12 mois d''accès complet.',
  25.00, 'yearly', 9999, 20, 0,
  false, false, true, false, false, false,
  JSON_ARRAY(
    'Voir tous les profils (couples et célibataires)',
    'Créer et rejoindre des groupes de discussion',
    'Chat illimité en temps réel',
    'Filtres de recherche avancés',
    'Badge Premium sur votre profil'
  ),
  true, true, NOW(3), NOW(3)
),
(
  'plan-premium-24m', 'PREMIUM_24M', 'Premium 2 ans',
  'Le meilleur tarif au mois : 24 mois d''accès complet.',
  70.00, 'biennial', 9999, 20, 0,
  false, false, true, false, false, false,
  JSON_ARRAY(
    'Voir tous les profils (couples et célibataires)',
    'Créer et rejoindre des groupes de discussion',
    'Chat illimité en temps réel',
    'Filtres de recherche avancés',
    'Badge Premium sur votre profil'
  ),
  true, false, NOW(3), NOW(3)
)
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

-- Idempotence des webhooks Stripe : un même paiement ne peut plus
-- prolonger l'abonnement deux fois.
CREATE UNIQUE INDEX `subscriptions_stripeSessionId_key` ON `subscriptions`(`stripeSessionId`);
