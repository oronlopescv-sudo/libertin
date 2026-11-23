-- =============================================================================
-- XLIBERTINE — 014 (segue COLAR_NO_SQL_EDITOR_013.sql)
-- Origem: auditoria JEV (residual «membro lê PII de terceiros via REST»).
-- REQUISITO: aplicar SÓ DEPOIS do deploy do commit que muda a fonte de email
--   (getCurrentSupabaseUser + auth-serveur + users/profile + payments
--   portal/status passam a ler email da sessão / service key). Com o deploy
--   anterior, o REVOKE da email/phone/stripe_customer_id abaixo parte Mon
--   profil e o botão «Gérer ma facturation».
-- IDEMPOTENTE — pode correr-se várias vezes.
-- Aplicar NO SQL Editor do Supabase ou via Management API:
--   POST /v1/projects/mfchfnsekoluicxnguoh/database/query
-- =============================================================================

-- 1. Tabela legacy `users` (auth antigo, camelCase): tem hashedPassword.
--    Hoje: RLS ligado mas ZERO políticas + GRANT ALL a anon/membros — a
--    leitura já devolve 0 linhas por RLS, mas fica o GRANT por higiene.
REVOKE ALL ON public.users FROM anon, authenticated;

-- 2. profiles: fechar colunas PII/sensíveis aos membros.
--    (a) tirar o grant de tabela e (b) conceder APENAS as colunas seguras —
--    19 de 22: fora ficam email, phone, stripe_customer_id.
--    NÃO fica fora: role, subscription_* e is_* (a app e o painel precisam).
REVOKE SELECT ON public.profiles FROM authenticated;

GRANT SELECT (
  id, username, date_of_birth, gender, sexual_orientation, location,
  lat, lng, subscription_tier, subscription_start, subscription_end,
  bio, interests, is_verified, is_active, is_nsfw, role, created_at, updated_at
) ON public.profiles TO authenticated;

-- ESCRITA mantém-se como estava (INSERT policy própria + guard 010 de
-- colunas sensíveis via trigger — REVOKE aqui só toca a LEITURA).
