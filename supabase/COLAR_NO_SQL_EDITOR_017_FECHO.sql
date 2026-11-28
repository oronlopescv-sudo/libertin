-- 017 · Fecho de segurança (auditoria 2026-11-28, projeto libertinelover)
-- 1) mensagens: policy comparava gm.group_id com ele próprio (qualquer membro
--    de UM grupo lia/escrevia em TODOS); 2) storage: qualquer pessoa podia
--    apagar/substituir fotos e media de chat de outros; 3) anon fora das views
--    GPS e da tabela photos; 4) handle_new_user não chamável por RPC;
-- 5) search_path fixo; 6) email protegido pelo trigger.

BEGIN;

-- 1. Mensagens ---------------------------------------------------------------
DROP POLICY IF EXISTS xlib_messages_select_membro ON public.messages;
DROP POLICY IF EXISTS xlib_messages_insert_membro ON public.messages;

CREATE POLICY xlib_messages_select_membro ON public.messages
  FOR SELECT TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = messages.group_id
        AND gm.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY xlib_messages_insert_membro ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.group_memberships gm
      WHERE gm.group_id = messages.group_id
        AND gm.user_id = (SELECT auth.uid())
    )
  );

-- 2. Storage: só o dono mexe na própria pasta --------------------------------
--    Caminhos do código: photos → profiles/<uid>/…, chat-media → chat/<uid>/…
DROP POLICY IF EXISTS photos_auth_insert       ON storage.objects;
DROP POLICY IF EXISTS photos_owner_update      ON storage.objects;
DROP POLICY IF EXISTS photos_owner_delete      ON storage.objects;
DROP POLICY IF EXISTS chat_media_auth_insert   ON storage.objects;
DROP POLICY IF EXISTS chat_media_owner_update  ON storage.objects;
DROP POLICY IF EXISTS chat_media_owner_delete  ON storage.objects;

CREATE POLICY photos_owner_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);
CREATE POLICY photos_owner_update ON storage.objects FOR UPDATE TO authenticated
  USING      (bucket_id = 'photos' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'photos' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);
CREATE POLICY photos_owner_delete ON storage.objects FOR DELETE TO authenticated
  USING      (bucket_id = 'photos' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);

CREATE POLICY chat_media_owner_insert ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'chat-media' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);
CREATE POLICY chat_media_owner_update ON storage.objects FOR UPDATE TO authenticated
  USING      (bucket_id = 'chat-media' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text)
  WITH CHECK (bucket_id = 'chat-media' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);
CREATE POLICY chat_media_owner_delete ON storage.objects FOR DELETE TO authenticated
  USING      (bucket_id = 'chat-media' AND (storage.foldername(name))[2] = (SELECT auth.uid())::text);

-- 3. anon fora das views GPS e da tabela photos --------------------------------
REVOKE ALL ON public.profiles_gps FROM anon, public;
REVOKE ALL ON public.proprio_gps  FROM anon, public;

DROP POLICY IF EXISTS xlib_photos_select_public ON public.photos;
CREATE POLICY xlib_photos_select_auth ON public.photos
  FOR SELECT TO authenticated USING (true);

-- 4. handle_new_user só corre como trigger -------------------------------------
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- 5. search_path fixo nas funções assinaladas pelo advisor ---------------------
DO $$
DECLARE f regprocedure;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('limite_membros_grupo','limite_anuncios_ativos',
                        'bloqueia_colunas_sensiveis_profiles','bloqueia_dm_duplicada')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_temp', f);
  END LOOP;
END $$;

-- 6. email passa a ser coluna protegida ----------------------------------------
CREATE OR REPLACE FUNCTION public.bloqueia_colunas_sensiveis_profiles()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $function$
BEGIN
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
     OR (NEW.email              IS DISTINCT FROM OLD.email)
  THEN
    RAISE EXCEPTION
      'xlibertine: colunas sensíveis do perfil (subscription/is_verified/role/is_active/stripe_customer_id/email) só podem ser alteradas pelo servidor'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

COMMIT;
