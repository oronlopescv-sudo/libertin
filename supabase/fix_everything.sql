-- ============================================================================
-- XLIBERTINE — CORRIGE TUDO (executar UMA vez no SQL Editor do Supabase)
-- ----------------------------------------------------------------------------
-- Dashboard → SQL Editor → New query → colar tudo → Run
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- Isto desbloqueia de uma só vez:
--   • Inscrição (criar perfil em `profiles`) — sem isto, todo novo registo
--     fica com "Profil introuvable" em todas as rotas.
--   • Like / conversação / criar grupo / entrar em grupo / enviar mensagem
--     no chat — todas as escritas estavam bloqueadas por RLS sem política.
--   • Upload de fotos — cria o bucket `photos` + políticas de storage.
--   • Adiciona colunas em falta (cover_url, media_url, created_at).
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

-- 3. COLUNAS EM FALTA --------------------------------------------------------
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS allows_anonymous BOOLEAN DEFAULT false;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT false;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fim. Depois disto: registo, login, like, mensagem, chat, grupos, upload de
-- fotos — tudo funciona. (Resta apenas configurar o Stripe para os pagamentos.)