-- ============================================================================
-- XLIBERTINE — 012: FECHAR LEITURA ANÓNIMA DE `profiles` (email/phone/stripe)
-- ----------------------------------------------------------------------------
-- Executar NO SQL Editor do Supabase (depois do 010 e do 011):
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
-- IDEMPOTENTE: pode correr-se várias vezes (drop+create sempre).
--
-- Contexto (audit JEV 2026-10-09, maior risco de PII): o 010 mantinha
-- `profiles` SELECT público por causa do check-username do registo — e com
-- a anon key no bundle, QUALQUER PESSOA (sem conta) lia email/phone/
-- subscription/stripe_customer_id de TODOS os membros numa query REST direta.
--
-- Este passo:
--   1. Cria a view pública `profiles_public` — SEM PII (id/username/gender/
--      is_verified/created_at, só membros ativos) — para o check-username.
--   2. Troca a política SELECT público (`xlib_profiles_select_public`) do 010
--      por uma apenas para `authenticated` (o app, com sessão, continua a ler).
--   3. Revoga SELECT direto ao role anon: a anon key deixa de ler a tabela.
--
-- ⚠️ Follow-up 013 (documentado no cabeçalho do 010): um membro autenticado
--    ainda consegue ler email/phone de OUTROS via REST (RLS não faz máscara
--    de colunas). Fechar isso exige trocar a fonte do email no app
--    (auth.user em vez de profiles.email) + REVOKE de coluna. Passo separado.
-- ============================================================================


-- 1. View pública sem PII — único caminho de leitura anónimo.
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public AS
SELECT id, username, gender, is_verified, created_at
FROM public.profiles
WHERE is_active = true;
GRANT SELECT ON public.profiles_public TO anon, authenticated;
COMMENT ON VIEW public.profiles_public IS
  'Acesso público SEGURO: sem email/phone/stripe/subscription. Leitura anónima só por aqui (012).';


-- 2. SELECT da tabela passa a exigir sessão (authenticated).
DROP POLICY IF EXISTS xlib_profiles_select_public ON public.profiles;
CREATE POLICY xlib_profiles_select_authenticated ON public.profiles
  FOR SELECT TO authenticated
  USING (true); -- membros leem membros (descobrir/perfil/likes) — colunas sensíveis seguem no follow-up 013


-- 3. A chave anónima deixa de ler a tabela direto (a view é que é pública).
REVOKE SELECT ON public.profiles FROM anon;