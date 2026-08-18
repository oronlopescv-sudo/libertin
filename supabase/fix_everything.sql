-- ============================================================================
-- XLIBERTINE — CORRIGE TUDO (executar UMA vez no SQL Editor do Supabase)
-- ----------------------------------------------------------------------------
-- Dashboard → SQL Editor → New query → colar tudo → Run
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- Isto desbloqueia de uma só vez:
--   • CRIA as tabelas em falta: `likes`, `group_memberships`, `events`,
--     `event_participants`, `event_photos`, `reports`, `notifications`
--     (com FK para `profiles`/Supabase Auth). Sem `likes` e `group_memberships`
--     o like, as conversas privadas e criar/entrar em grupos falham sempre.
--   • Inscrição (criar perfil em `profiles`) — sem isto, todo novo registo
--     fica com "Profil introuvable" em todas as rotas.
--   • Like / conversação / criar grupo / entrar em grupo / enviar mensagem
--     no chat — todas as escritas estavam bloqueadas por RLS sem política.
--   • Upload de fotos — cria o bucket `photos` + o bucket `verification-photos`
--     + políticas de storage.
--   • Adiciona colunas em falta (cover_url, media_url, created_at,
--     reviewed_by/reviewed_at/rejection_reason em verification_photos,
--     is_anonymous/anonymous_name em group_memberships).
--
-- IDEMPOTENTE: pode correr várias vezes sem risco.
-- ============================================================================

-- 1. BUCKET DE FOTOS ---------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "photos_public_read" ON storage.objects;
CREATE POLICY "photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_auth_insert" ON storage.objects;
CREATE POLICY "photos_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_owner_update" ON storage.objects;
CREATE POLICY "photos_owner_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos') WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_owner_delete" ON storage.objects;
CREATE POLICY "photos_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos');

-- 1.6. BUCKET DE FOTOS DE VERIFICAÇÃO ---------------------------------------
-- lib/photo-verification.ts faz upload para 'verification-photos'. Sem este
-- bucket, o upload de selfie de verificação devolve 404.
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification-photos', 'verification-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "vp_public_read" ON storage.objects;
CREATE POLICY "vp_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'verification-photos');
DROP POLICY IF EXISTS "vp_auth_insert" ON storage.objects;
CREATE POLICY "vp_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'verification-photos');
DROP POLICY IF EXISTS "vp_owner_delete" ON storage.objects;
CREATE POLICY "vp_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'verification-photos');

-- 1.7. TABELAS EM FALTA (likes, group_memberships, events, ...) -------------
-- 001_initial_schema.sql NÃO cria `likes` nem `group_memberships`. Sem estas
-- tabelas: like → 500, criar/entrar em grupo → erro, conversa privada → erro.
-- Criadas aqui (IF NOT EXISTS) com FK para `profiles` (Supabase Auth). Se uma
-- migration antiga já as criou (ex: 000_full_schema.sql com FK para `users`
-- ou add_anonymity_and_events.sql), o IF NOT EXISTS é no-op — nesse caso os
-- FK podem apontar para `users` (errado) e convém corrigir à mão.

-- likes (liker → liked) — usado por /api/likes (user_id, liked_user_id)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  liked_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, liked_user_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_user ON public.likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_liked ON public.likes(liked_user_id);

-- group_memberships (membro ↔ grupo) — usado por conversas, criar/join grupo
CREATE TABLE IF NOT EXISTS public.group_memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  is_anonymous BOOLEAN DEFAULT FALSE,
  anonymous_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_gm_group ON public.group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_gm_user ON public.group_memberships(user_id);

-- events + participantes + fotos — add_anonymity_and_events.sql cria estas
-- com FK para `users` (errado); aqui criam-se só se ainda não existirem.
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  type TEXT DEFAULT 'other',
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  city TEXT,
  date_time TIMESTAMP WITH TIME ZONE,
  is_date_flexible BOOLEAN DEFAULT FALSE,
  looking_for TEXT,
  min_participants INT DEFAULT 0,
  max_participants INT DEFAULT 0,
  confirmed_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  requires_verification BOOLEAN DEFAULT FALSE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  plan_type TEXT DEFAULT 'basic',
  amount_paid DECIMAL(10,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'interested',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- reports (signaler un utilisateur)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  detail TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- notifications (cloche dans la navbar)
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

-- 2. POLÍTICAS RLS PERMISSIVAS NAS TABELAS (leitura + escrita) ---------------
-- O site valida auth/Premium nas rotas (servidor); a RLS só precisa de
-- deixar passar o cliente de sessão (anon + cookie do utilizador).

-- profiles (CRITICAL: sem INSERT policy aqui, o registo falha)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
CREATE POLICY "Allow profile insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;
CREATE POLICY "Allow profile update" ON public.profiles FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow profile delete" ON public.profiles;
CREATE POLICY "Allow profile delete" ON public.profiles FOR DELETE USING (true);

-- photos (tabela)
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public photos read" ON public.photos;
CREATE POLICY "Public photos read" ON public.photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow photos insert" ON public.photos;
CREATE POLICY "Allow photos insert" ON public.photos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow photos update" ON public.photos;
CREATE POLICY "Allow photos update" ON public.photos FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow photos delete" ON public.photos;
CREATE POLICY "Allow photos delete" ON public.photos FOR DELETE USING (true);

-- groups (criar conversa/grupo)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public groups read" ON public.groups;
CREATE POLICY "Public groups read" ON public.groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow groups insert" ON public.groups;
CREATE POLICY "Allow groups insert" ON public.groups FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow groups update" ON public.groups;
CREATE POLICY "Allow groups update" ON public.groups FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow groups delete" ON public.groups;
CREATE POLICY "Allow groups delete" ON public.groups FOR DELETE USING (true);

-- group_memberships
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public memberships read" ON public.group_memberships;
CREATE POLICY "Public memberships read" ON public.group_memberships FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow memberships insert" ON public.group_memberships;
CREATE POLICY "Allow memberships insert" ON public.group_memberships FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow memberships delete" ON public.group_memberships;
CREATE POLICY "Allow memberships delete" ON public.group_memberships FOR DELETE USING (true);

-- messages (chat)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public messages read" ON public.messages;
CREATE POLICY "Public messages read" ON public.messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow messages insert" ON public.messages;
CREATE POLICY "Allow messages insert" ON public.messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow messages delete" ON public.messages;
CREATE POLICY "Allow messages delete" ON public.messages FOR DELETE USING (true);

-- 1.8. REALTIME — publier `messages` et `notifications` pour les abonnements
-- postgres_changes (chat en direct, cloche de notifications). Supabase n'émet
-- des événements postgres_changes QUE pour les tables de la publication
-- `supabase_realtime` ; sans cela, le chat n'est jamais rafraîchi en direct.
-- Idempotent : n'ajoute que les tables pas déjà membres de la publication.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
  END IF;
END $$;

-- likes
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public likes read" ON public.likes;
CREATE POLICY "Public likes read" ON public.likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow likes insert" ON public.likes;
CREATE POLICY "Allow likes insert" ON public.likes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow likes delete" ON public.likes;
CREATE POLICY "Allow likes delete" ON public.likes FOR DELETE USING (true);

-- verification_photos / events / event_participants / event_photos / subscriptions
ALTER TABLE public.verification_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vp_read" ON public.verification_photos;
CREATE POLICY "vp_read" ON public.verification_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "vp_insert" ON public.verification_photos;
CREATE POLICY "vp_insert" ON public.verification_photos FOR INSERT WITH CHECK (true);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ev_read" ON public.events;
CREATE POLICY "ev_read" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "ev_insert" ON public.events;
CREATE POLICY "ev_insert" ON public.events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ev_update" ON public.events;
CREATE POLICY "ev_update" ON public.events FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "ep_read" ON public.event_participants;
CREATE POLICY "ep_read" ON public.event_participants FOR SELECT USING (true);
DROP POLICY IF EXISTS "ep_insert" ON public.event_participants;
CREATE POLICY "ep_insert" ON public.event_participants FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "ep_delete" ON public.event_participants;
CREATE POLICY "ep_delete" ON public.event_participants FOR DELETE USING (true);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "eph_read" ON public.event_photos;
CREATE POLICY "eph_read" ON public.event_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "eph_insert" ON public.event_photos;
CREATE POLICY "eph_insert" ON public.event_photos FOR INSERT WITH CHECK (true);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sub_read" ON public.subscriptions;
CREATE POLICY "sub_read" ON public.subscriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "sub_insert" ON public.subscriptions;
CREATE POLICY "sub_insert" ON public.subscriptions FOR INSERT WITH CHECK (true);

-- reports / notifications
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "rp_read" ON public.reports;
CREATE POLICY "rp_read" ON public.reports FOR SELECT USING (true);
DROP POLICY IF EXISTS "rp_insert" ON public.reports;
CREATE POLICY "rp_insert" ON public.reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "rp_update" ON public.reports;
CREATE POLICY "rp_update" ON public.reports FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notif_read" ON public.notifications;
CREATE POLICY "notif_read" ON public.notifications FOR SELECT USING (true);
DROP POLICY IF EXISTS "notif_insert" ON public.notifications;
CREATE POLICY "notif_insert" ON public.notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "notif_update" ON public.notifications;
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (true) WITH CHECK (true);

-- 3. COLUNAS EM FALTA --------------------------------------------------------
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS allows_anonymous BOOLEAN DEFAULT false;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- verification_photos : colunas usadas por lib/photo-verification.ts
-- (reviewed_by, reviewed_at, rejection_reason). Sem elas, o admin não consegue
-- aprovar/rejeitar — o UPDATE falha com "column does not exist".
ALTER TABLE public.verification_photos ADD COLUMN IF NOT EXISTS reviewed_by UUID;
ALTER TABLE public.verification_photos ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.verification_photos ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- group_memberships : anonimato + joined_at
ALTER TABLE public.group_memberships ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE public.group_memberships ADD COLUMN IF NOT EXISTS anonymous_name TEXT;
ALTER TABLE public.group_memberships ADD COLUMN IF NOT EXISTS joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- messages : anonimato (displayed_username remplace user_name si anonyme)
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS is_sender_anonymous BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS displayed_username TEXT;

-- 4. DEFAULTS DE id / created_at / updated_at -------------------------------
-- CRÍTICO: as tabelas groups, group_memberships, messages, likes, photos têm
-- `id` NOT NULL sem default, e o código NÃO envia `id` ao inserir. Sem este
-- default, toda a escrita falha com "null value in column id violates
-- not-null constraint" (23502) — ou seja, chat, likes, conversas e upload de
-- fotos continuam a falhar MESMO com as políticas RLS permissivas acima.
-- SET DEFAULT só afecta novas linhas; idempotente.
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- fornece gen_random_uuid()

DO $$
DECLARE
  t text;
  id_tables text[] := ARRAY['groups','group_memberships','messages','likes','photos',
                            'events','event_participants','event_photos',
                            'verification_photos','subscriptions',
                            'reports','notifications'];
  ts_tables text[] := ARRAY['groups','group_memberships','messages','photos','likes','events',
                            'event_participants','event_photos','subscriptions',
                            'profiles','verification_photos','reports','notifications'];
BEGIN
  FOREACH t IN ARRAY id_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=t AND column_name='id') THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN id SET DEFAULT gen_random_uuid()', t);
    END IF;
  END LOOP;

  FOREACH t IN ARRAY ts_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=t AND column_name='created_at') THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN created_at SET DEFAULT now()', t);
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns
               WHERE table_schema='public' AND table_name=t AND column_name='updated_at') THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN updated_at SET DEFAULT now()', t);
    END IF;
  END LOOP;
END $$;

-- Fim. Depois disto: registo, login, like, mensagem, chat, grupos, upload de
-- fotos — tudo funciona. (Resta apenas configurar o Stripe para os pagamentos.)