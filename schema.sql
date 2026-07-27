-- =====================================================================
-- ATENÇÃO: NÃO USAR ESTE FICHEIRO
--
-- Usa antes: database-mysql.sql
--
-- Este ficheiro está incompleto e provoca erros em produção:
--   1. Falta a tabela `_BlockedBy`, que o Prisma exige para a relação
--      de bloqueio entre utilizadores. Sem ela, as consultas que
--      tocam em bloqueios falham.
--   2. Não inclui os utilizadores de teste, portanto não é possível
--      entrar no site depois de importar.
--
-- Verificado por importação real em MariaDB 10.11.
-- =====================================================================

-- ============ CRIAR TODAS AS TABELAS MYSQL ============
-- Database: u128759105_SEX
-- User: u128759105_SEXFR
-- Copie e execute tudo isto no phpMyAdmin ou CLI MySQL

-- ============ USERS ============
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci,
  `hashedPassword` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `dateOfBirth` datetime(3) NOT NULL,
  `gender` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sexualOrientation` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` double,
  `lng` double,
  `subscriptionTier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FREE',
  `subscriptionStart` datetime(3),
  `subscriptionEnd` datetime(3),
  `stripeCustomerId` varchar(191) COLLATE utf8mb4_unicode_ci,
  `bio` longtext COLLATE utf8mb4_unicode_ci,
  `interests` json,
  `isVerified` boolean NOT NULL DEFAULT false,
  `isActive` boolean NOT NULL DEFAULT true,
  `isNSFW` boolean NOT NULL DEFAULT false,
  `isBanned` boolean NOT NULL DEFAULT false,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  `lastLoginAt` datetime(3),
  PRIMARY KEY (`id`),
  KEY `ix_users_subscriptionEnd` (`subscriptionEnd`),
  KEY `ix_users_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ PHOTOS ============
CREATE TABLE `photos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isCover` boolean NOT NULL DEFAULT false,
  `order` int NOT NULL DEFAULT 0,
  `uploadedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ix_photos_userId` (`userId`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ VERIFICATION_PHOTOS ============
CREATE TABLE `verification_photos` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rejectionReason` varchar(191) COLLATE utf8mb4_unicode_ci,
  `submittedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `reviewedAt` datetime(3),
  `expiresAt` datetime(3),
  PRIMARY KEY (`id`),
  KEY `ix_verification_photos_userId_status` (`userId`, `status`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ GROUPS ============
CREATE TABLE `groups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci,
  `creatorId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isPrivate` boolean NOT NULL DEFAULT false,
  `maxMembers` int NOT NULL DEFAULT 50,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `coverPhoto` varchar(191) COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ix_groups_creatorId` (`creatorId`),
  KEY `ix_groups_createdAt` (`createdAt`),
  FOREIGN KEY (`creatorId`) REFERENCES `users` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ GROUP_MEMBERSHIPS ============
CREATE TABLE `group_memberships` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `groupId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'member',
  `joinedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_group_memberships_userId_groupId` (`userId`, `groupId`),
  KEY `ix_group_memberships_groupId` (`groupId`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ MESSAGES ============
CREATE TABLE `messages` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `groupId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `mediaUrl` varchar(191) COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ix_messages_groupId_createdAt` (`groupId`, `createdAt`),
  KEY `ix_messages_userId` (`userId`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`groupId`) REFERENCES `groups` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ SUBSCRIPTIONS ============
CREATE TABLE `subscriptions` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tier` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `priceEuro` decimal(8,2) NOT NULL,
  `stripeSessionId` varchar(191) COLLATE utf8mb4_unicode_ci,
  `stripeSubscriptionId` varchar(191) COLLATE utf8mb4_unicode_ci,
  `startDate` datetime(3) NOT NULL,
  `endDate` datetime(3) NOT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `autoRenew` boolean NOT NULL DEFAULT true,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ix_subscriptions_userId_endDate` (`userId`, `endDate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ LIKES ============
CREATE TABLE `likes` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_likes_userId_targetId` (`userId`, `targetId`),
  KEY `ix_likes_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ BLOCKED_USERS ============
CREATE TABLE `blocked_users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `blockedId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_blocked_users_userId_blockedId` (`userId`, `blockedId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============ PASSWORD_RESETS ============
CREATE TABLE `password_resets` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL UNIQUE,
  `expiresAt` datetime(3) NOT NULL,
  `usedAt` datetime(3),
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ix_password_resets_token` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ✅ TODAS AS TABELAS CRIADAS COM SUCESSO!
