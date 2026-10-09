-- =============================================================================
-- XLIBERTINE — COLAR TUDO DE UMA VEZ NO SQL EDITOR (010 + 011 + 012)
-- https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
-- IDEMPOTENTE — pode correr-se várias vezes sem risco.
-- CRITICO: a anon key hoje lê mensagens de chat e passwords (legacy users).
-- =============================================================================
-- ============================================================================
-- XLIBERTINE — 010: ENDURECER RLS (fecha o «USING(true)» em todas as tabelas)
-- ----------------------------------------------------------------------------
-- Executar NO SQL Editor do Supabase (DDL não passa por REST):
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- IDEMPOTENTE: pode correr-se várias vezes (drop+create sempre).
--
-- Contexto: praticamente todas as políticas existentes eram
-- `FOR SELECT USING (true)` + `FOR INSERT WITH CHECK (true)` (+/− update/delete
-- aberto). Com a anon key pública no bundle, qualquer pessoa podia ler/escrever
-- tudo: perfis (incluindo email/telefone), fotos de verificação de identidade,
-- mensagens de chat, likes, bloqueios…
--
-- Arquitetura do app (auditada, 2026-10-08):
--   * Browser: `lib/supabase.ts` → chave anon + sessão (JWT do utilizador).
--   * Server com sessão: `createServerSupabaseClient()` (cookies) → `authenticated`.
--   * Server privilegiado: `createServiceRoleClient()` / webhook Stripe → `service_role`
--     (bypassa RLS; NÃO há FORCE ROW LEVEL SECURITY em nenhuma tabela).
--   * Registo: o perfil é criado pelo trigger on_auth_user_created (007) na base;
--     o upsert de login (creerProfilManquant) reconstrói a partir de user_metadata.
--
-- Leituras que PRECISAM continuar anónimas (não fechar):
--   profiles SELECT, groups SELECT, events SELECT, photos SELECT
--   (home pública + auth/check-username + listagem de grupos).
--
-- ⚠️ Follow-up (não resolvido aqui, por exigir migração de leituras):
--   o SELECT público de profiles expõe email/phone/stripe de TODOS numa
--   query de anon key. Passo 2 sugerido: view pública `profiles_public`
--   (sem email/phone/lat/lng/stripe) para as leituras públicas + fechar
--   SELECT da tabela para authenticated. Também pendente: bucket de
--   verificação de identidade está em leitura pública no Storage
--   (fix_everything.sql «vp_public_read») — deve passar a privado.
-- ============================================================================


-- ############################################################################
-- 0. DDL em falta no repositório: blocked_users criado em produção mas não
--    versionado. Idempotente — se a tabela já existe, no-op.
-- ############################################################################
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz NULL DEFAULT now(),
  CONSTRAINT blocked_users_pkey PRIMARY KEY (id),
  CONSTRAINT blocked_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id),
  CONSTRAINT blocked_users_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.profiles (id)
);
CREATE INDEX IF NOT EXISTS blocked_users_user_id_idx ON public.blocked_users (user_id);
CREATE INDEX IF NOT EXISTS blocked_users_blocked_id_idx ON public.blocked_users (blocked_id);

-- ############################################################################
-- 1. TRIGGER DE PROTEÇÃO DO PERFIL (anti-escalada de privilégios)
--    Colunas sensíveis só são alteradas por service_role (webhook Stripe,
--    admin, verificação de fotos). Com a chave anon a circular numa app
--    pública, «is_verified», «role», «is_active» e «subscription_*» não
--    podem ser escritos por utilizador logado — nem por UPDATE em bloco que
--    reenvie valores iguais (comparação OLD vs NEW só falha se MUDARAM).
-- ############################################################################
CREATE OR REPLACE FUNCTION public.bloqueia_colunas_sensiveis_profiles()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Webhook Stripe, rotas admin e foto-de-verificação: chave de serviço.
  IF (SELECT auth.role()) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF (NEW.subscription_tier   IS DISTINCT FROM OLD.subscription_tier)
     OR (NEW.subscription_start IS DISTINCT FROM OLD.subscription_start)
     OR (NEW.subscription_end   IS DISTINCT FROM OLD.subscription_end)
     OR (NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id)
     OR (NEW.is_verified        IS DISTINCT FROM OLD.is_verified)
     OR (NEW.is_active          IS DISTINCT FROM OLD.is_active)
     OR (NEW.role               IS DISTINCT FROM OLD.role)
  THEN
    RAISE EXCEPTION
      'xlibertine: colunas sensíveis do perfil (subscription/is_verified/role/is_active/stripe_customer_id) só podem ser alteradas pelo servidor'
      USING ERRCODE = '42501'; -- insufficient_privilege (o cliente vê 403 do PostgREST)
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protege_sensiveis_profiles ON public.profiles;
CREATE TRIGGER protege_sensiveis_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.bloqueia_colunas_sensiveis_profiles();

-- ############################################################################
-- 2. LIMPAR TODAS AS POLÍTICAS ANTIGAS (nomes espalhados por 000/001/003/005/
--    007/008/fix_everything/APPLY_NOW — apagar à cega deixa resíduos; isto
--    limpa por tabela, de forma robusta)
-- ############################################################################
DO $$
DECLARE registo record;
BEGIN
  FOR registo IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles','photos','likes','blocked_users','messages','notifications',
        'reports','groups','group_memberships','events','event_participants',
        'event_photos','verification_photos','subscriptions','users'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                   registo.policyname, registo.schemaname, registo.tablename);
  END LOOP;
END;
$$;

-- ############################################################################
-- 3. RLS LIGADO EM TODAS AS TABELAS (sem FORCE — service_role tem de passar)
-- ############################################################################
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_photos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_resets     ENABLE ROW LEVEL SECURITY;

-- ############################################################################
-- 4. POLÍTICAS, TABELA A TABELA
--    Convenções: (select auth.uid()) num sub-select é lido uma vez (initplan);
--    «authenticated» = sessão válida; sem políticas = só a chave de serviço.
-- ############################################################################

-- ── profiles ────────────────────────────────────────────────────────────────
-- SELECT público estrutural (home/lista + check-username antes do registo).
-- Sensível: expõe email/phone — follow-up com view pública (cabeçalho).
CREATE POLICY xlib_profiles_select_public ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY xlib_profiles_insert_propria ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

CREATE POLICY xlib_profiles_update_propria ON public.profiles
  FOR UPDATE USING ((select auth.uid()) = id)
             WITH CHECK ((select auth.uid()) = id);

CREATE POLICY xlib_profiles_delete_propria ON public.profiles
  FOR DELETE USING ((select auth.uid()) = id);

-- ── photos ──────────────────────────────────────────────────────────────────
-- Aparecem em perfis/discovery/conversas mesmo para visitantes; o Storage já
-- é público para este bucket, pelo que fechar a tabela não esconderia nada.
CREATE POLICY xlib_photos_select_public ON public.photos
  FOR SELECT USING (true);

CREATE POLICY xlib_photos_insert_propria ON public.photos
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY xlib_photos_update_propria ON public.photos
  FOR UPDATE USING ((select auth.uid()) = user_id)
             WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY xlib_photos_delete_propria ON public.photos
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ── verification_photos (fotos de documento!) ───────────────────────────────
-- Nada público: o dono vê o SEU estado de verificação; análise/revisão via
-- chave de serviço (photo-verification.ts). UPDATE/DELETE só-service.
CREATE POLICY xlib_vp_select_propria ON public.verification_photos
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY xlib_vp_insert_propria ON public.verification_photos
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- ── likes ───────────────────────────────────────────────────────────────────
-- Leitura autenticada nos dois lados: lista de admiradores (liked_user = eu)
-- e verificação de match mútuo (eu dei like a X / X deu a mim).
CREATE POLICY xlib_likes_select_auth ON public.likes
  FOR SELECT USING (
    (select auth.uid()) IS NOT NULL
    AND ((select auth.uid()) = user_id OR (select auth.uid()) = liked_user_id)
  );

CREATE POLICY xlib_likes_insert_propria ON public.likes
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY xlib_likes_delete_propria ON public.likes
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ── blocked_users ───────────────────────────────────────────────────────────
-- Os dois lados são lidos: a minha lista (user_id = eu) e «fui eu bloqueado?»
-- (blocked_id = eu) — discovery/likes/profiles dependem desta segunda leitura.
CREATE POLICY xlib_blocked_select_ambos_lados ON public.blocked_users
  FOR SELECT USING (
    (select auth.uid()) IS NOT NULL
    AND ((select auth.uid()) = user_id OR (select auth.uid()) = blocked_id)
  );

CREATE POLICY xlib_blocked_insert_propria ON public.blocked_users
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY xlib_blocked_delete_propria ON public.blocked_users
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ── messages ────────────────────────────────────────────────────────────────
-- Chat (grupos + conversas privadas category='private_dm'). O anon perde a
-- leitura TOTAL de mensagens; quem é membro do grupo lê o canal inteiro.
-- O realtime (postgres_changes) respeita RLS — chat-box e notification-bell
-- usam o cliente de browser COM sessão, por isso continuam a receber.
CREATE POLICY xlib_messages_select_membro ON public.messages
  FOR SELECT USING (
    (select auth.uid()) IS NOT NULL
    AND (
      user_id = (select auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.group_memberships gm
        WHERE gm.group_id = group_id
          AND gm.user_id = (select auth.uid())
      )
    )
  );

CREATE POLICY xlib_messages_insert_membro ON public.messages
  FOR INSERT WITH CHECK (
    (select auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = group_id
        AND gm.user_id = (select auth.uid())
    )
  );

CREATE POLICY xlib_messages_delete_propria ON public.messages
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ── notifications ───────────────────────────────────────────────────────────
-- Leitura/marcar-lida: só quem a recebe. INSERT: as rotas autenticadas criam
-- notificações PARA OUTRO utilizador (like recebido, nova mensagem no grupo),
-- por isso é «autenticado», não «próprio»; a validação de contexto fica nas
-- rotas (bloqueios, membership). Follow-up: mover estes inserts para a chave
-- de serviço (fecha o vector de spam por membro autenticado).
CREATE POLICY xlib_notifications_select_propria ON public.notifications
  FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY xlib_notifications_update_propria ON public.notifications
  FOR UPDATE USING ((select auth.uid()) = user_id)
             WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY xlib_notifications_insert_auth ON public.notifications
  FOR INSERT WITH CHECK ((select auth.role()) = 'authenticated');

-- ── reports (denúncias) ─────────────────────────────────────────────────────
-- Membro reporta; a fila e a gestão (SELECT/UPDATE) ficam só na chave de
-- serviço (rotas /api/admin/*).
CREATE POLICY xlib_reports_insert_auth ON public.reports
  FOR INSERT WITH CHECK ((select auth.uid()) = reporter_id);

-- ── groups ──────────────────────────────────────────────────────────────────
-- Listagem pública necessáriaanon (/api/groups GET). Escrever = dono do
-- grupo; o member_count do join é recalculado pela chave de serviço
-- (/api/groups/[id]/join) e conversas privadas são criadas pelo próprio
-- criador (creator_id = eu).
CREATE POLICY xlib_groups_select_public ON public.groups
  FOR SELECT USING (true);

CREATE POLICY xlib_groups_insert_criador ON public.groups
  FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);

CREATE POLICY xlib_groups_update_criador ON public.groups
  FOR UPDATE USING ((select auth.uid()) = creator_id)
             WITH CHECK ((select auth.uid()) = creator_id);

CREATE POLICY xlib_groups_delete_criador ON public.groups
  FOR DELETE USING ((select auth.uid()) = creator_id);

-- ── group_memberships ───────────────────────────────────────────────────────
-- Membros autenticados leem a lista (inbox lê o OUTRO membro do DM); o criador
-- de conversa privada insere A SEGUNDA pessoa (par âncora do DM); saída futura
-- de grupo fica habilitada a DELETE do próprio.
CREATE POLICY xlib_gm_select_auth ON public.group_memberships
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY xlib_gm_insert_own_ou_criador_dm ON public.group_memberships
  FOR INSERT WITH CHECK (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_id
        AND g.creator_id = (select auth.uid())
        AND g.category = 'private_dm'
    )
  );

CREATE POLICY xlib_gm_delete_own_ou_criador_dm ON public.group_memberships
  FOR DELETE USING (
    (select auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = group_id
        AND g.creator_id = (select auth.uid())
        AND g.category = 'private_dm'
    )
  );

-- ── events (anúncios/eventos) ───────────────────────────────────────────────
-- SELECT público (eventos são conteúdo promocional). Criar/editar/apagar = o
-- criador. A ativação PAGA (is_active/payment_status/expires_at) é webhook
-- (service). confirmed_count dos joins é recalculado pela chave de serviço
-- (código ajustado em /api/events/join neste mesmo commit).
CREATE POLICY xlib_events_select_public ON public.events
  FOR SELECT USING (true);

CREATE POLICY xlib_events_insert_criador ON public.events
  FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);

CREATE POLICY xlib_events_update_criador ON public.events
  FOR UPDATE USING ((select auth.uid()) = creator_id)
             WITH CHECK ((select auth.uid()) = creator_id);

CREATE POLICY xlib_events_delete_criador ON public.events
  FOR DELETE USING ((select auth.uid()) = creator_id);

-- ── event_participants ──────────────────────────────────────────────────────
CREATE POLICY xlib_ep_select_auth ON public.event_participants
  FOR SELECT USING ((select auth.role()) = 'authenticated');

CREATE POLICY xlib_ep_insert_propria ON public.event_participants
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY xlib_ep_delete_propria ON public.event_participants
  FOR DELETE USING ((select auth.uid()) = user_id);

-- ── event_photos (sem escritores no código → só serviço) ────────────────────
CREATE POLICY xlib_eph_select_public ON public.event_photos
  FOR SELECT USING (true);

-- ── Tabelas SÓ-DE-SERVIÇO (zero políticas) ──────────────────────────────────
-- subscriptions (legado, o webhook escreve em profiles.subscription_*),
-- payment_logs (webhook + owner-dashboard via serviço), admin_logs,
-- password_resets (já fechado na migration add_password_resets),
-- pricing_plans (não usada pelo app), users (tabela legada) e
-- event_photos (escrita). Nada a fazer: sem políticas, anon/authenticated
-- não vê nem escreve nada; service_role passa sempre (sem FORCE RLS).
-- ⚠️ Nunca adicionar FORCE ROW LEVEL SECURITY nestas tabelas: cortaria o
-- service_role do webhook Stripe e de /api/admin/*.

-- FIM — 010_endurecer_rls.sql

-- ============================================================================
-- XLIBERTINE — 011: BUCKET verification-photos PASSA A PRIVADO
-- ----------------------------------------------------------------------------
-- Executar NO SQL Editor do Supabase (DDL não passa por REST):
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- IDEMPOTENTE.
--
-- Contexto: o bucket `verification-photos` guarda os SELFIES/DOCUMENTOS de
-- verificação de identidade. fix_everything.sql (nunca versionado antes de
-- 010) criou o bucket público + a política `vp_public_read` que deixa
-- QUALQUER pessoa (anon key no browser) LER qualquer foto a partir do link.
-- O link fica gravado no campo `url` de verification_photos — ou seja, os
-- documentos de identidade estavam acessíveis sem sessão.
--
-- O app já não depende do URL público:
--   * a fila de revisão do admin recebe um URL ASSINADO gerado pelo servidor
--     (assinaUrlVerificacao() — 1h) — commit desta migration;
--   * o checkout NSFW é corrido pelo servidor contra o URL assinado;
--   * o modal do utilizador só renderiza o preview local (data: URL).
-- ============================================================================

-- 0. Bucket privado — fecha o endpoint /object/public/... imediatamente.
UPDATE storage.buckets SET public = false WHERE id = 'verification-photos';

-- 1. Remover leitura pública/mundial dos objetos do bucket (qualquer
--    política SELECT que mencione o bucket — inclui "vp_public_read").
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND cmd = 'SELECT'
      AND qual::text ILIKE '%verification-photos%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END;
$$;

-- 2. `vp_owner_delete` (USING (bucket_id = ...)) permitia a QUALQUER usuário
--    autenticado apagar fotos de verificação DE OUTREM. A partir de agora,
--    apagar restringe-se à própria pasta (verification/<meuUserId>/...);
--    a chave de serviço não passa por RLS e mantém-se (webhook/admin/reject).
DROP POLICY IF EXISTS "vp_owner_delete" ON storage.objects;
CREATE POLICY "vp_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'verification-photos'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- 3. `vp_auth_insert` (fallback de upload com a sessão do membro, quando a
--    chave de serviço não é utilizável) — agora restrito À PRÓPRIA PASTA:
--    verification/<meuUserId>/... é o path que uploadVerificationPhoto gera
--    (userId vem da sessão, nunca do cliente); antes era todo o bucket.
DROP POLICY IF EXISTS "vp_auth_insert" ON storage.objects;
CREATE POLICY "vp_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'verification-photos'
    AND (storage.foldername(name))[1] = 'verification'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- FIM — 011_bucket_verificacao_privado.sql

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