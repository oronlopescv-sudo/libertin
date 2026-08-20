-- 006_rename_tiers_to_monthly.sql
-- Renomme les anciens tiers d'abonnement (avec durée) en pacquets MENSUALS
-- (sans notion de durée). À exécuter une fois en production pour aligner les
-- données existantes avec le nouveau modèle de facturation mensuelle récurrente.
--
--   PREMIUM_3M  / CREATOR_3M  -> PASS_EPICURIEN
--   PREMIUM_12M / CREATOR_12M -> PASS_PRIVILEGE
--   PREMIUM_24M / VIP_24M     -> PASS_VIP
--
-- Aucun utilisateur ne perd l'accès : chaque ancien tier est mappé vers son
-- équivalent mensuel. Les abonnements restent actifs jusqu'à subscription_end.

BEGIN;

UPDATE profiles
SET subscription_tier = 'PASS_EPICURIEN'
WHERE subscription_tier IN ('PREMIUM_3M', 'CREATOR_3M');

UPDATE profiles
SET subscription_tier = 'PASS_PRIVILEGE'
WHERE subscription_tier IN ('PREMIUM_12M', 'CREATOR_12M');

UPDATE profiles
SET subscription_tier = 'PASS_VIP'
WHERE subscription_tier IN ('PREMIUM_24M', 'VIP_24M');

-- Table `subscriptions` (legacy) si elle existe.
UPDATE subscriptions
SET tier = 'PASS_EPICURIEN'
WHERE tier IN ('PREMIUM_3M', 'CREATOR_3M');

UPDATE subscriptions
SET tier = 'PASS_PRIVILEGE'
WHERE tier IN ('PREMIUM_12M', 'CREATOR_12M');

UPDATE subscriptions
SET tier = 'PASS_VIP'
WHERE tier IN ('PREMIUM_24M', 'VIP_24M');

-- Table `users` (legacy, non utilisée par le code) si elle existe.
UPDATE users
SET subscription_tier = 'PASS_EPICURIEN'
WHERE subscription_tier IN ('PREMIUM_3M', 'CREATOR_3M');

UPDATE users
SET subscription_tier = 'PASS_PRIVILEGE'
WHERE subscription_tier IN ('PREMIUM_12M', 'CREATOR_12M');

UPDATE users
SET subscription_tier = 'PASS_VIP'
WHERE subscription_tier IN ('PREMIUM_24M', 'VIP_24M');

COMMIT;