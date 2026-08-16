-- ========================================================
-- password_resets : jetons de réinitialisation de mot de passe
-- (table manquante — référencée par les routes forgot/reset-password
--  mais jamais créée, ce qui cassait tout le flux de récupération).
-- ========================================================

CREATE TABLE IF NOT EXISTS public.password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_resets_token ON public.password_resets(token);

ALTER TABLE public.password_resets ENABLE ROW LEVEL SECURITY;

-- Aucun accès public : les routes forgot/reset-password utilisent la clé de
-- service (contourne le RLS) car il n'y a pas de session utilisateur.
DROP POLICY IF EXISTS "No public access to password_resets" ON public.password_resets;
CREATE POLICY "No public access to password_resets"
  ON public.password_resets FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);