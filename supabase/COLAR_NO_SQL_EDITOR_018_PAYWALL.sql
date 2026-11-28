-- 018 · Paywall na base de dados + campos de pagamento dos eventos + DMs fechadas
-- (auditoria 2026-11-28, projeto libertinelover)

BEGIN;

-- 0. Premium calculado como em lib/premium.ts --------------------------------
CREATE OR REPLACE FUNCTION public.xlib_e_premium(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE((
    SELECT
      lower(coalesce(u.email, '')) = 'orsonricardo@hotmail.fr'
      OR p.role = 'admin'
      OR (
        p.subscription_tier IN ('PASS_EPICURIEN','PASS_PRIVILEGE','PASS_VIP')
        AND (p.subscription_end IS NULL OR p.subscription_end >= now())
      )
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.id = uid
  ), false);
$$;

REVOKE ALL ON FUNCTION public.xlib_e_premium(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.xlib_e_premium(uuid) TO authenticated;

-- 1. group_memberships --------------------------------------------------------
--    a) entrar num grupo: Premium, grupo público, nunca numa DM;
--    b) criar DM: o criador Premium junta os 2 membros enquanto a DM está vazia
--       (depois disso ninguém entra — lugar vago não é reocupado).
DROP POLICY IF EXISTS xlib_gm_insert_own_ou_criador_dm ON public.group_memberships;

CREATE POLICY xlib_gm_insert_premium ON public.group_memberships
  FOR INSERT TO authenticated
  WITH CHECK (
    public.xlib_e_premium((SELECT auth.uid()))
    AND (
      (
        user_id = (SELECT auth.uid())
        AND EXISTS (
          SELECT 1 FROM public.groups g
          WHERE g.id = group_memberships.group_id
            AND g.category IS DISTINCT FROM 'private_dm'
            AND g.is_private IS NOT TRUE
        )
      )
      OR (
        EXISTS (
          SELECT 1 FROM public.groups g
          WHERE g.id = group_memberships.group_id
            AND g.category = 'private_dm'
            AND g.creator_id = (SELECT auth.uid())
        )
        AND NOT EXISTS (
          SELECT 1 FROM public.group_memberships m
          WHERE m.group_id = group_memberships.group_id
        )
      )
    )
  );

-- 2. groups: criar grupo/DM exige Premium ---------------------------------------
DROP POLICY IF EXISTS xlib_groups_insert_criador ON public.groups;
CREATE POLICY xlib_groups_insert_criador ON public.groups
  FOR INSERT TO authenticated
  WITH CHECK (
    creator_id = (SELECT auth.uid())
    AND public.xlib_e_premium((SELECT auth.uid()))
  );

-- 3. event_participants: participar exige Premium e evento ativo -------------
DROP POLICY IF EXISTS xlib_ep_insert_propria ON public.event_participants;
CREATE POLICY xlib_ep_insert_propria ON public.event_participants
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND public.xlib_e_premium((SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.events e
      WHERE e.id = event_participants.event_id
        AND e.is_active = true
        AND (e.expires_at IS NULL OR e.expires_at > now())
    )
  );

-- 4. events: campos de pagamento só pelo servidor --------------------------------
CREATE OR REPLACE FUNCTION public.bloqueia_pagamento_eventos()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
  IF (SELECT auth.role()) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Um evento novo nasce sempre por pagar e inativo; o webhook ativa-o.
    NEW.payment_status    := 'pending';
    NEW.is_active         := false;
    NEW.stripe_payment_id := NULL;
    NEW.confirmed_count   := 0;
    RETURN NEW;
  END IF;

  IF (NEW.payment_status    IS DISTINCT FROM OLD.payment_status)
     OR (NEW.amount_paid       IS DISTINCT FROM OLD.amount_paid)
     OR (NEW.plan_type         IS DISTINCT FROM OLD.plan_type)
     OR (NEW.stripe_payment_id IS DISTINCT FROM OLD.stripe_payment_id)
     OR (NEW.is_active         IS DISTINCT FROM OLD.is_active)
     OR (NEW.expires_at        IS DISTINCT FROM OLD.expires_at)
     OR (NEW.confirmed_count   IS DISTINCT FROM OLD.confirmed_count)
  THEN
    RAISE EXCEPTION
      'xlibertine: campos de pagamento/ativação do evento só podem ser alterados pelo servidor'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS protege_pagamento_eventos ON public.events;
CREATE TRIGGER protege_pagamento_eventos
  BEFORE INSERT OR UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.bloqueia_pagamento_eventos();

COMMIT;
