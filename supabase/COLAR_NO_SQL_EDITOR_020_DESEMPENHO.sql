-- 020 · Desempenho: índices nas FKs + auth.uid() avaliado uma vez por query
-- (já aplicada no projeto libertinelover em 2026-11-28)

BEGIN;

CREATE INDEX IF NOT EXISTS likes_liked_user_id_idx       ON public.likes (liked_user_id);
CREATE INDEX IF NOT EXISTS password_resets_user_id_idx   ON public.password_resets (user_id);
CREATE INDEX IF NOT EXISTS reports_reporter_id_idx       ON public.reports (reporter_id);
CREATE INDEX IF NOT EXISTS reports_reported_id_idx       ON public.reports (reported_id);

DROP POLICY IF EXISTS annonces_select ON public.annonces;
DROP POLICY IF EXISTS annonces_insert ON public.annonces;
DROP POLICY IF EXISTS annonces_update ON public.annonces;
DROP POLICY IF EXISTS annonces_delete ON public.annonces;

CREATE POLICY annonces_select ON public.annonces FOR SELECT TO authenticated
  USING ((is_active AND expires_at > now()) OR user_id = (SELECT auth.uid()));
CREATE POLICY annonces_insert ON public.annonces FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY annonces_update ON public.annonces FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY annonces_delete ON public.annonces FOR DELETE TO authenticated
  USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS admin_logs_admin_read ON public.admin_logs;
CREATE POLICY admin_logs_admin_read ON public.admin_logs FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  ));

DROP POLICY IF EXISTS password_resets_auth_own   ON public.password_resets;
DROP POLICY IF EXISTS password_resets_block_anon ON public.password_resets;
CREATE POLICY password_resets_auth_own ON public.password_resets FOR SELECT TO authenticated
  USING (user_id::text = (SELECT auth.uid())::text);

COMMIT;
