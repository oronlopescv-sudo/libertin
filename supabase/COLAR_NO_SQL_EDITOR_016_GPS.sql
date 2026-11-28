-- ══════════════════════════════════════════════════════════════════════════
-- 016 · COLAR NO SQL EDITOR (Supabase → xlibertine)
-- GPS colunar: `lat`/`lng` EXATOS deixam de ser legíveis por membros.
-- ── PORQUÊ ────────────────────────────────────────────────────────────────
-- O 015 deixou lat/lng no conjunto legível; um membro via REST lia o
-- ponto exato (metros) de QUALQUER membro. A app só mostra a DISTÂNCIA,
-- que precisa de ~2 casas decimais (≈1 km), e o exato apenas de SI
-- PRÓPRIO (cálculo da distância no cartão de perfil).
-- ── O QUE MUDA ────────────────────────────────────────────────────────────
-- 1. REVOKE SELECT (tabela) + REVOKE das colunas lat/lng (os grants PÓS-015
--    são coluna-a-coluna: o REVOKE de tabela sozinho NÃO as fecha).
-- 2. GRANT SELECT nas 17 seguras.
-- 2. VIEW public.profiles_gps — coords ARRENDADAS a 2 casas de todos os
--    membros ATIVOS (para a distância; o view corre como dono, por isso
--    filtra is_active no WHERE — e anon NEM SEQUER tem grant).
-- 3. VIEW public.proprio_gps — lat/lng EXATOS só da linha id=auth.uid()
--    do próprio membro (para o cálculo «perto de ti»).
-- RLS fica igual; INSERT/UPDATE/DELETE ficam igual; service_role/trigger
-- handle_new_user intocados. A UI não muda: antes o JS arredondava para
-- mostrar; agora o arredondamento passa a garantia da BD.
-- ── REVERTER (se um dia for preciso) ──────────────────────────────────────
-- REVOKE SELECT ON public.profiles_gps, public.proprio_gps FROM authenticated;
-- REVOKE SELECT ON public.profiles FROM authenticated;
-- GRANT SELECT ON public.profiles TO authenticated;
-- DROP VIEW public.proprio_gps, public.profiles_gps;
-- ══════════════════════════════════════════════════════════════════════════

BEGIN;

REVOKE SELECT ON public.profiles FROM authenticated;

-- O 015 criou grants COLUNA-A-COLUNA (lat/lng incluídos no lote de 19):
-- o REVOKE de tabela não as limpa — estas duas linhas é que fecham de vez.
REVOKE SELECT (lat, lng) ON public.profiles FROM authenticated;

GRANT SELECT (
  id, username,
  date_of_birth, gender, sexual_orientation, location,
  subscription_tier, subscription_start, subscription_end,
  bio, interests,
  is_verified, is_active, is_nsfw, role,
  created_at, updated_at
) ON public.profiles TO authenticated;

-- Distância entre membros: só as coords arredondadas saem daqui.
CREATE OR REPLACE VIEW public.profiles_gps AS
  SELECT
    id,
    round(lat::numeric, 2)::double precision AS lat,
    round(lng::numeric, 2)::double precision AS lng
  FROM public.profiles
  WHERE is_active = true;

GRANT SELECT ON public.profiles_gps TO authenticated;

-- O membro vê as PRÓPRIAS coords exatas (cálculo da distância no cliente).
CREATE OR REPLACE VIEW public.proprio_gps AS
  SELECT id, lat, lng
  FROM public.profiles
  WHERE id = auth.uid();

GRANT SELECT ON public.proprio_gps TO authenticated;

COMMIT;

-- ── VERIFICAÇÃO (correr à parte, após o COMMIT) ───────────────────────────
-- 1) 17 colunas (sem lat, sem lng, e ainda sem email/phone/stripe):
-- SELECT DISTINCT column_name FROM information_schema.role_column_grants
-- WHERE table_schema='public' AND table_name='profiles'
--   AND grantee='authenticated' AND privilege_type='SELECT'
-- ORDER BY column_name;
-- Esperado: bio, created_at, date_of_birth, gender, id, interests,
-- location, role, sexual_orientation, subscription_end, subscription_start,
-- subscription_tier, updated_at, username, is_active, is_nsfw, is_verified
--
-- 2) Duas views com grant: SELECT table_name, grantee
-- FROM information_schema.role_table_grants
-- WHERE table_schema='public' AND table_name IN ('profiles_gps','proprio_gps');
