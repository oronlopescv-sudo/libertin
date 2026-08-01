-- CreateTable pricing_plans
CREATE TABLE `pricing_plans` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `displayName` VARCHAR(191) NOT NULL,
  `description` LONGTEXT NOT NULL,
  `priceEuro` DECIMAL(8,2) NOT NULL,
  `priceDolar` DECIMAL(8,2),
  `priceCve` DECIMAL(10,2),
  `billingPeriod` VARCHAR(191) NOT NULL DEFAULT 'monthly',
  `maxMessages` INT NOT NULL,
  `maxPhotos` INT NOT NULL,
  `maxProfiles` INT NOT NULL,
  `hasVideoCall` BOOLEAN NOT NULL DEFAULT false,
  `hasVoiceCall` BOOLEAN NOT NULL DEFAULT false,
  `hasAdvancedFilters` BOOLEAN NOT NULL DEFAULT false,
  `hasVerified` BOOLEAN NOT NULL DEFAULT false,
  `hasGallery` BOOLEAN NOT NULL DEFAULT false,
  `hasPriority` BOOLEAN NOT NULL DEFAULT false,
  `features` JSON NOT NULL DEFAULT '[]',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `isPopular` BOOLEAN NOT NULL DEFAULT false,
  `stripeProductId` VARCHAR(191),
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `pricing_plans_name_key`(`name`),
  INDEX `pricing_plans_isActive_idx`(`isActive`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Inserir planos padrão
INSERT INTO `pricing_plans` (
  `id`, `name`, `displayName`, `description`, `priceEuro`, `priceDolar`, `priceCve`,
  `billingPeriod`, `maxMessages`, `maxPhotos`, `maxProfiles`,
  `hasVideoCall`, `hasVoiceCall`, `hasAdvancedFilters`, `hasVerified`, `hasGallery`, `hasPriority`,
  `features`, `isActive`, `isPopular`, `createdAt`, `updatedAt`
) VALUES
(
  'free-plan-001', 'FREE', 'Explorador', 'Perfeito para começar',
  0.00, 0.00, 0.00, 'monthly',
  10, 3, 0,
  false, false, false, false, false, false,
  JSON_ARRAY('✓ Criação de perfil básico', '✓ 10 mensagens/dia', '✓ Procura simples', '✓ Ver fotos de perfil'),
  true, false, NOW(), NOW()
),
(
  'starter-plan-001', 'STARTER', 'Premium', 'Para conexões sérias',
  9.99, 10.99, 1050.00, 'monthly',
  500, 15, 0,
  false, false, true, false, false, false,
  JSON_ARRAY('✓ Perfil completo', '✓ Mensagens ilimitadas', '✓ Chat em tempo real', '✓ Ver quem gostou de você', '✓ Filtros avançados', '✓ Sem anúncios'),
  true, false, NOW(), NOW()
),
(
  'pro-plan-001', 'PRO', 'VIP', 'Experiência completa',
  29.99, 32.99, 3150.00, 'monthly',
  9999, 50, 0,
  true, true, true, true, true, true,
  JSON_ARRAY('✓ Tudo no Premium +', '✓ Destaque no feed', '✓ Prioridade no suporte', '✓ Galerias privadas', '✓ Cupom 20% desconto', '✓ Acesso antecipado'),
  true, true, NOW(), NOW()
),
(
  'business-plan-001', 'BUSINESS', 'Elite', 'Para os mais exigentes',
  99.99, 109.99, 10500.00, 'monthly',
  9999, 100, 0,
  true, true, true, true, true, true,
  JSON_ARRAY('✓ Tudo no VIP +', '✓ Account manager dedicado', '✓ Suporte 24/7 prioritário', '✓ Analytics avançados', '✓ Disconto 30% anual', '✓ Verificação com rush'),
  true, false, NOW(), NOW()
),
(
  'vip-plan-001', 'VIP', 'Libertine Master', 'Status supremo',
  199.99, 219.99, 21000.00, 'monthly',
  9999, 200, 0,
  true, true, true, true, true, true,
  JSON_ARRAY('✓ Tudo no Elite +', '✓ Badge VIP exclusivo', '✓ Concierge pessoal', '✓ Acesso VIP eventos', '✓ Lifetime benefits', '✓ Customização total'),
  true, false, NOW(), NOW()
);
