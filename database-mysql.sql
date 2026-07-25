-- =====================================================================
-- RencontresPremium - Estrutura MySQL
-- Gerado a partir de prisma/schema.prisma (provider = mysql)
--
-- Como usar:
--   phpMyAdmin -> escolher a base de dados u128759105_SEX
--   -> separador "Importar" -> escolher este ficheiro -> Executar
--
-- Este ficheiro cria as tabelas E os utilizadores de teste.
-- Pode ser executado mais do que uma vez sem duplicar dados.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============ UTILIZADORES ============

CREATE TABLE IF NOT EXISTS `users` (
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
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `photos` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `isCover` BOOLEAN NOT NULL DEFAULT false,
  `order` INTEGER NOT NULL DEFAULT 0,
  `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `photos_userId_idx`(`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `photos_userId_fkey` FOREIGN KEY (`userId`)
    REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `verification_photos` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `url` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
  `rejectionReason` VARCHAR(191) NULL,
  `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewedAt` DATETIME(3) NULL,
  `expiresAt` DATETIME(3) NULL,
  INDEX `verification_photos_userId_status_idx`(`userId`, `status`),
  PRIMARY KEY (`id`),
  CONSTRAINT `verification_photos_userId_fkey` FOREIGN KEY (`userId`)
    REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ SUBSCRIÇÕES ============

CREATE TABLE IF NOT EXISTS `subscriptions` (
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
  INDEX `subscriptions_userId_endDate_idx`(`userId`, `endDate`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ GRUPOS & CHAT ============

CREATE TABLE IF NOT EXISTS `groups` (
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
  PRIMARY KEY (`id`),
  CONSTRAINT `groups_creatorId_fkey` FOREIGN KEY (`creatorId`)
    REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `group_memberships` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `groupId` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'member',
  `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `group_memberships_groupId_idx`(`groupId`),
  UNIQUE INDEX `group_memberships_userId_groupId_key`(`userId`, `groupId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `group_memberships_userId_fkey` FOREIGN KEY (`userId`)
    REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `group_memberships_groupId_fkey` FOREIGN KEY (`groupId`)
    REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `messages` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `groupId` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `mediaUrl` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `messages_groupId_createdAt_idx`(`groupId`, `createdAt`),
  INDEX `messages_userId_idx`(`userId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `messages_userId_fkey` FOREIGN KEY (`userId`)
    REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `messages_groupId_fkey` FOREIGN KEY (`groupId`)
    REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============ PREFERÊNCIAS & BLOQUEIOS ============

CREATE TABLE IF NOT EXISTS `likes` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `targetId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `likes_userId_idx`(`userId`),
  UNIQUE INDEX `likes_userId_targetId_key`(`userId`, `targetId`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `blocked_users` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `blockedId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `blocked_users_userId_blockedId_key`(`userId`, `blockedId`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `usedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `password_resets_token_key`(`token`),
  INDEX `password_resets_token_idx`(`token`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabela implícita da relação muitos-para-muitos User <-> User (bloqueios)
CREATE TABLE IF NOT EXISTS `_BlockedBy` (
  `A` VARCHAR(191) NOT NULL,
  `B` VARCHAR(191) NOT NULL,
  UNIQUE INDEX `_BlockedBy_AB_unique`(`A`, `B`),
  INDEX `_BlockedBy_B_index`(`B`),
  CONSTRAINT `_BlockedBy_A_fkey` FOREIGN KEY (`A`)
    REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `_BlockedBy_B_fkey` FOREIGN KEY (`B`)
    REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- DADOS DE TESTE
-- Password para as tres contas: Test1234!
-- =====================================================================

INSERT INTO `users`
  (`id`, `email`, `hashedPassword`, `username`, `dateOfBirth`, `gender`,
   `sexualOrientation`, `location`, `bio`, `interests`, `isVerified`,
   `subscriptionTier`, `subscriptionStart`, `subscriptionEnd`,
   `createdAt`, `updatedAt`, `lastLoginAt`)
VALUES
  ('seed-user-alice', 'alice@test.fr',
   '$2a$12$s6DKWrr2I.jc.K8bB3Xs2.jRppuewswb3NNxWuhFsxRiXpxoKceme',
   'Alice_Lyon', '1992-04-12 00:00:00.000', 'femme', 'bi', 'Lyon',
   'Curieuse et discrète. Ouverte aux belles rencontres.',
   '["Soirées privées","Voyages","Danse"]', true,
   'PREMIUM_12M', NOW(3), DATE_ADD(NOW(3), INTERVAL 1 YEAR),
   NOW(3), NOW(3), NOW(3)),

  ('seed-user-couple', 'couple@test.fr',
   '$2a$12$s6DKWrr2I.jc.K8bB3Xs2.jRppuewswb3NNxWuhFsxRiXpxoKceme',
   'Duo_Paris', '1988-09-03 00:00:00.000', 'couple', 'hetero', 'Paris',
   'Couple complice depuis 8 ans, nous cherchons des rencontres élégantes.',
   '["Clubs","Gastronomie","Art & culture"]', true,
   'PREMIUM_24M', NOW(3), DATE_ADD(NOW(3), INTERVAL 1 YEAR),
   NOW(3), NOW(3), NOW(3)),

  ('seed-user-marc', 'free@test.fr',
   '$2a$12$s6DKWrr2I.jc.K8bB3Xs2.jRppuewswb3NNxWuhFsxRiXpxoKceme',
   'Marc_Free', '1995-01-20 00:00:00.000', 'homme', 'hetero', 'Marseille',
   NULL, NULL, false,
   'FREE', NULL, NULL,
   NOW(3), NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

INSERT INTO `groups`
  (`id`, `name`, `description`, `creatorId`, `isPrivate`, `maxMembers`,
   `category`, `createdAt`, `updatedAt`)
VALUES
  ('seed-group-1', 'Soirées Rhône-Alpes',
   'Organisation de soirées privées dans la région lyonnaise. Ambiance élégante et bienveillante.',
   'seed-user-alice', false, 50, 'casual', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);

INSERT INTO `group_memberships` (`id`, `userId`, `groupId`, `role`, `joinedAt`)
VALUES
  ('seed-mem-1', 'seed-user-alice', 'seed-group-1', 'admin', NOW(3)),
  ('seed-mem-2', 'seed-user-couple', 'seed-group-1', 'member', NOW(3))
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

INSERT INTO `messages` (`id`, `userId`, `groupId`, `content`, `createdAt`, `updatedAt`)
VALUES
  ('seed-msg-1', 'seed-user-alice', 'seed-group-1',
   'Bienvenue dans le groupe ! Présentez-vous en quelques mots.', NOW(3), NOW(3)),
  ('seed-msg-2', 'seed-user-couple', 'seed-group-1',
   'Merci pour l''accueil, ravis d''être là.', NOW(3), NOW(3))
ON DUPLICATE KEY UPDATE `updatedAt` = NOW(3);
