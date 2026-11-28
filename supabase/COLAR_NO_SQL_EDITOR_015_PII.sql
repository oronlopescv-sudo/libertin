-- ══════════════════════════════════════════════════════════════════════════
-- 015 · COLAR NO SQL EDITOR (Supabase → xlibertine)
-- PII colunar: `email`, `phone` e `stripe_customer_id` de
-- `public.profiles` deixam de ser LIDOS por membros (role authenticated).
-- ── PORQUÊ ────────────────────────────────────────────────────────────────
-- Residual da auditoria 014: um membro com sessão conseguia, via REST
-- direta, ler o email (e phone/stripe_customer_id) de QUALQUER outro
-- membro. O código já não depende destas colunas pela sessão (commit
-- a4d3c9d + correção do create-checkout): o e-mail do membro vem da
-- SESSION auth e o stripe_customer_id da chave de serviço.
-- ── O QUE MUDA ────────────────────────────────────────────────────────────
-- 1. REVOKE SELECT inteiro em `profiles` para authenticated.
-- 2. GRANT SELECT nas colunas seguras (tudo o que a app usa em listas,
--    descobrir, conversas — e o que o membro precisa de SI MESMO).
-- O anon JÁ sem SELECT (012/013). Insert/Update/Delete ficam tal como
-- estão (RLS continua a filtrar as linhas). service_role e o trigger
-- handle_new_user não são afetados. A view profiles_public não muda.
-- ── REVERTER (se um dia for preciso) ──────────────────────────────────────
-- REVOKE SELECT ON public.profiles FROM authenticated;
-- GRANT SELECT ON public.profiles TO authenticated;
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

REVOKE SELECT ON public.profiles FROM authenticated;

GRANT SELECT (
  id, username,
  date_of_birth, gender, sexual_orientation, location,
  lat, lng,
  subscription_tier, subscription_start, subscription_end,
  bio, interests,
  is_verified, is_active, is_nsfw, role,
  created_at, updated_at
) ON public.profiles TO authenticated;

COMMIT;

-- ── VERIFICAÇÃO (correr colado, à parte, após o COMMIT) ───────────────────
-- Devolve 19 (todas as seguras, nenhuma PII):
--   SELECT DISTINCT column_name FROM information_schema.role_column_grants
--   WHERE table_schema='public' AND table_name='profiles'
--     AND grantee='authenticated' AND privilege_type='SELECT'
--   ORDER BY column_name;
-- Esperado: 'bio','created_at','date_of_birth','gender','id',
-- 'interests','is_active','is_nsfw','is_verified','lat','lng','location',
-- 'role','sexual_orientation','subscription_end','subscription_start',
-- 'subscription_tier','updated_at','username'
-- (sem 'email', sem 'phone', sem 'stripe_customer_id')
