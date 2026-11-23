-- =============================================================================
-- XLIBERTINE — 013 (segue COLAR_NO_SQL_EDITOR_010_011_012.sql)
-- Origem: auditoria JEV da lógica geral (2026-11-23, «NÃO APROVA»).
-- IDEMPOTENTE — pode correr-se várias vezes sem risco.
-- Aplicar NO SQL Editor do Supabase
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
-- ou via Management API (POST /v1/projects/{ref}/database/query).
-- Esquema real confirmado no código: annonces tem is_active + expires_at;
-- apagar um anúncio é DELETE físico (rota /api/annonces/[id]).
-- =============================================================================

-- ============================================================================
-- 1. NOTIFICAÇÕES — fechar INSERT a membros (vector de spam/assédio).
-- Qualquer membro autenticado podia inserir uma notificação em nome de
-- quem quisesse (notificação falsa «Nouveau like» com link arbitrário).
-- As rotas agora inserem com a chave de serviço (likes, messages).
-- ============================================================================
DROP POLICY IF EXISTS xlib_notifications_insert_auth ON public.notifications;

-- ============================================================================
-- 2. BLOCKED_USERS — UNIQUE (user_id, blocked_id): um duplo clique em
-- «Bloquer» devolve 23505 em vez de criar linhas duplicadas.
-- (013.1) Também UNIQUE (event_id, user_id) em event_participants: o atrapa
-- 23505 da rota /api/events/join só funciona se a constraint existir —
-- fix_everything.sql tem-na, mas a migração original dos eventos não.
-- Se já houver duplicados, o índice falha — avisar e limpar antes.
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS blocked_users_par_unico
  ON public.blocked_users (user_id, blocked_id);

CREATE UNIQUE INDEX IF NOT EXISTS event_participants_par_unico
  ON public.event_participants (event_id, user_id);

-- ============================================================================
-- 3. CONVERSAS PRIVADAS (private_dm) — um par não pode ter duas DMs.
-- Trigger AFTER INSERT em group_memberships: quando a DM chega a 2 membros,
-- compara o par ordenado com TODAS as DMs vivas; duplicado → 23505.
-- Um advisory lock serializa DMs concorrentes (o 2.º request por fim vê as
-- linhas do 1.º commitado e falha com 23505, que a rota atrapa).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.bloqueia_dm_duplicada()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  grupo_categoria text;
  n_membros int;
  par_atual text;
  grupo_conflito uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('xlib_dm_par'));

  SELECT category INTO grupo_categoria FROM public.groups WHERE id = NEW.group_id;
  IF grupo_categoria IS DISTINCT FROM 'private_dm' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO n_membros FROM public.group_memberships WHERE group_id = NEW.group_id;
  IF n_membros IS DISTINCT FROM 2 THEN
    RETURN NEW; -- só valida a DM completa (2 membros)
  END IF;

  SELECT string_agg(user_id::text, '|' ORDER BY user_id::text)
    INTO par_atual
    FROM public.group_memberships
    WHERE group_id = NEW.group_id;

  SELECT g.id INTO grupo_conflito
    FROM public.groups g
    JOIN public.group_memberships m ON m.group_id = g.id
    WHERE g.category = 'private_dm'
      AND g.id <> NEW.group_id
    GROUP BY g.id
    HAVING count(*) = 2
       AND string_agg(m.user_id::text, '|' ORDER BY m.user_id::text) = par_atual
    LIMIT 1;

  IF grupo_conflito IS NOT NULL THEN
    RAISE EXCEPTION 'DM duplicada para o mesmo par'
      USING ERRCODE = '23505',
            DETAIL = format('grupo %s já é a DM do par %s', grupo_conflito, par_atual);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dm_par_unico ON public.group_memberships;
CREATE TRIGGER trg_dm_par_unico
  AFTER INSERT ON public.group_memberships
  FOR EACH ROW EXECUTE FUNCTION public.bloqueia_dm_duplicada();

-- ============================================================================
-- 4. LIMITES — triggers em vez de «count antes do insert» (corrida deixava
-- exceder o limite). Ambos usam ERRCODE 23505: as rotas atrapam e traduzem.
-- ============================================================================
-- 4a. Grupos: max_members.
CREATE OR REPLACE FUNCTION public.limite_membros_grupo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  maximo int;
  atual int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('xlib_join_grupo'));
  SELECT max_members INTO maximo FROM public.groups WHERE id = NEW.group_id;
  IF maximo IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO atual FROM public.group_memberships WHERE group_id = NEW.group_id;
  IF atual >= maximo THEN
    RAISE EXCEPTION 'Grupo cheio (max_members)'
      USING ERRCODE = '23505', DETAIL = 'max_members atingido';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limite_membros_grupo ON public.group_memberships;
CREATE TRIGGER trg_limite_membros_grupo
  BEFORE INSERT ON public.group_memberships
  FOR EACH ROW EXECUTE FUNCTION public.limite_membros_grupo();

-- 4b. Anúncios: máximo 5 ativos (is_active e não expirados) por membro.
CREATE OR REPLACE FUNCTION public.limite_anuncios_ativos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ativos int;
BEGIN
  SELECT count(*) INTO ativos
    FROM public.annonces
    WHERE user_id = NEW.user_id
      AND is_active IS TRUE
      AND expires_at > now();
  IF ativos >= 5 THEN
    RAISE EXCEPTION 'Máximo de 5 anúncios ativos'
      USING ERRCODE = '23505', DETAIL = 'limite de anúncios atingido';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limite_anuncios ON public.annonces;
CREATE TRIGGER trg_limite_anuncios
  BEFORE INSERT ON public.annonces
  FOR EACH ROW EXECUTE FUNCTION public.limite_anuncios_ativos();
