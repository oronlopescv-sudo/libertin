-- =====================================================================
-- LIBERTINELOVER — Estrutura completa da base de dados (MySQL)
--
-- Gerado a partir de prisma/schema.prisma, por isso está garantidamente
-- sincronizado com o código (o antigo schema.sql estava incompleto:
-- faltava-lhe a tabela _BlockedBy).
--
-- COMO USAR (phpMyAdmin, sem precisar de SSH):
--   1. hPanel → Bases de dados → phpMyAdmin
--   2. Escolher a base à esquerda
--   3. Separador "Importar" → selecionar este ficheiro → "Executar"
--
-- Em alternativa, por SSH:  npx prisma migrate deploy
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `hashedPassword` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `sexualOrientation` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NOT NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `subscriptionTier` VARCHAR(191) NOT NULL DEFAULT 'FREE',
    `subscriptionStart` DATETIME(3) NULL,
    `subscriptionEnd` DATETIME(3) NULL,
    `stripeCustomerId` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `interests` JSON NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isNSFW` BOOLEAN NOT NULL DEFAULT false,
    `isBanned` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastLoginAt` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_subscriptionEnd_idx`(`subscriptionEnd`),
    INDEX `users_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `photos` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `isCover` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `photos_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_photos` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `rejectionReason` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,

    INDEX `verification_photos_userId_status_idx`(`userId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tier` VARCHAR(191) NOT NULL,
    `priceEuro` DECIMAL(8, 2) NOT NULL,
    `stripeSessionId` VARCHAR(191) NULL,
    `stripeSubscriptionId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `autoRenew` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subscriptions_stripeSessionId_key`(`stripeSessionId`),
    INDEX `subscriptions_userId_endDate_idx`(`userId`, `endDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `creatorId` VARCHAR(191) NOT NULL,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `maxMembers` INTEGER NOT NULL DEFAULT 50,
    `category` VARCHAR(191) NOT NULL,
    `coverPhoto` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `groups_creatorId_idx`(`creatorId`),
    INDEX `groups_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `group_memberships` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'member',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `group_memberships_groupId_idx`(`groupId`),
    UNIQUE INDEX `group_memberships_userId_groupId_key`(`userId`, `groupId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `groupId` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `mediaUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `messages_groupId_createdAt_idx`(`groupId`, `createdAt`),
    INDEX `messages_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `likes` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `likes_userId_idx`(`userId`),
    UNIQUE INDEX `likes_userId_targetId_key`(`userId`, `targetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blocked_users` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `blockedId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blocked_users_userId_blockedId_key`(`userId`, `blockedId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_resets_token_key`(`token`),
    INDEX `password_resets_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_plans` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `priceEuro` DECIMAL(8, 2) NOT NULL,
    `priceDolar` DECIMAL(8, 2) NULL,
    `priceCve` DECIMAL(10, 2) NULL,
    `billingPeriod` VARCHAR(191) NOT NULL DEFAULT 'monthly',
    `maxMessages` INTEGER NOT NULL DEFAULT 0,
    `maxPhotos` INTEGER NOT NULL DEFAULT 0,
    `maxProfiles` INTEGER NOT NULL DEFAULT 0,
    `hasVideoCall` BOOLEAN NOT NULL DEFAULT false,
    `hasVoiceCall` BOOLEAN NOT NULL DEFAULT false,
    `hasAdvancedFilters` BOOLEAN NOT NULL DEFAULT false,
    `hasVerified` BOOLEAN NOT NULL DEFAULT false,
    `hasGallery` BOOLEAN NOT NULL DEFAULT false,
    `hasPriority` BOOLEAN NOT NULL DEFAULT false,
    `features` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `isPopular` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pricing_plans_name_key`(`name`),
    INDEX `pricing_plans_isActive_priceEuro_idx`(`isActive`, `priceEuro`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BlockedBy` (
    `A` VARCHAR(191) NOT NULL,
    `B` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `_BlockedBy_AB_unique`(`A`, `B`),
    INDEX `_BlockedBy_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `photos` ADD CONSTRAINT `photos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `verification_photos` ADD CONSTRAINT `verification_photos_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_memberships` ADD CONSTRAINT `group_memberships_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `group_memberships` ADD CONSTRAINT `group_memberships_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlockedBy` ADD CONSTRAINT `_BlockedBy_A_fkey` FOREIGN KEY (`A`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BlockedBy` ADD CONSTRAINT `_BlockedBy_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;


SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- Formulas de abonnement realmente vendidas.
-- Alinhadas com src/config/plans.ts e com PLANS de src/lib/stripe.ts,
-- que é o que o pagamento valida.
-- =====================================================================

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
