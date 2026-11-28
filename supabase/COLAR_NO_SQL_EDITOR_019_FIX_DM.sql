-- 019 · Corrige a 018: a policy de INSERT em group_memberships consultava a
-- própria tabela (recursão infinita) e impedia criar DMs novas. A verificação
-- "DM ainda vazia" passa para uma função SECURITY DEFINER.

BEGIN;

CREATE OR REPLACE FUNCTION public.xlib_dm_vazia(gid text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT NOT EXISTS (SELECT 1 FROM public.group_memberships WHERE group_id = gid);
$$;

REVOKE ALL ON FUNCTION public.xlib_dm_vazia(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.xlib_dm_vazia(text) TO authenticated;

DROP POLICY IF EXISTS xlib_gm_insert_premium ON public.group_memberships;

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
        AND public.xlib_dm_vazia(group_memberships.group_id)
      )
    )
  );

COMMIT;
