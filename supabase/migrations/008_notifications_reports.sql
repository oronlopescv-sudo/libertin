-- 008 — Correções de base da produção (chat + sino + sinalizações).
--
-- Diagnóstico efetuado a 2026-09-30, interrogando diretamente o PostgREST de
-- produção (coluna a coluna, apenas leitura):
--   ✅ id, created_at, group_id, user_id, user_name, user_avatar, content
--   ❌ media_url  → coluna INEXISTENTE na tabela messages de produção!
--
-- Consequência: a rota /api/messages/[groupId] insere media_url em todos os
-- envios, e o GET a seleciona. Postgres rejeita o insert inteiro
-- (42703 column "media_url" does not exist) → «Erreur lors de l'envoi du
-- message» no chat. O upload de imagem de tchat também depende dela.
--
--   ❌ GET /rest/v1/notifications  → 404 (tabela não existe)
--   ❌ GET /rest/v1/reports        → 404 (tabela não existe)
--   ❌ verification_photos.created_at → coluna inexistente (fila admin 500)
-- Consequência: sino de notificações nunca grava nada e «Signaler» morto.
--
-- Aplicar no painel Supabase → SQL Editor (a service key local está morta,
-- por isso este ficheiro é o caminho de aplicar em produção).
-- Idempotente: pode correr várias vezes.

-- =============================================================
-- 1. 🛠 CORREÇÃO DO CHAT — criar a coluna que falta
-- =============================================================
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Defesa adicional: se alguma coluna antiga foi marcada NOT NULL numa DDL
-- divergente, a rota nunca a preenche — relaxa (idempotente).
ALTER TABLE public.messages ALTER COLUMN user_name DROP NOT NULL;
ALTER TABLE public.messages ALTER COLUMN user_avatar DROP NOT NULL;

-- =============================================================
-- 2. reports — sinalizações («Signaler un profil»)
-- =============================================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  detail TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- O site valida quem assina no servidor (rota /api/reports, identidade via
-- cookie de sessão); a RLS apenas autoriza o cliente de sessão a gravar.
DROP POLICY IF EXISTS "Allow reports insert" ON public.reports;
CREATE POLICY "Allow reports insert" ON public.reports
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public reports read" ON public.reports;
CREATE POLICY "Public reports read" ON public.reports
  FOR SELECT USING (true);

-- =============================================================
-- 2b. Fila de verificação do admin — coluna de ordenação em falta
--     /api/admin/verifications ordena por created_at (photo-verification.ts
--     linha ~218); sem a coluna, o painel de verificação 500. O FK
--     verification_photos_user_id_fkey já existe em produção (testado).
-- =============================================================
ALTER TABLE public.verification_photos
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- =============================================================
-- 3. notifications — sino da barra superior
-- =============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON public.notifications(user_id);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow notifications insert" ON public.notifications;
CREATE POLICY "Allow notifications insert" ON public.notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow notifications read" ON public.notifications;
CREATE POLICY "Allow notifications read" ON public.notifications
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow notifications update" ON public.notifications;
CREATE POLICY "Allow notifications update" ON public.notifications
  FOR UPDATE USING (true) WITH CHECK (true);

-- =============================================================
-- 4. Realtime — publicar messages e notifications
--    (idempotente: adiciona só o que falta na publicação).
-- =============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- =============================================================
-- 5. Storage — bucket das imagens de tchat (o upload corre com service_role
--    no servidor; bucket público para as URLs públicas do chat funcionarem).
--    Guarda: se o anon não consegue ler buckets, isto é inconclusivo —
--    por isso cria com ON CONFLICT DO NOTHING (sem risco).
-- =============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- Se a inserção ainda falhar depois deste script, correr e colar o resultado
-- para o Claude (diagnóstico da política RLS):
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies where schemaname='public' and tablename='messages';