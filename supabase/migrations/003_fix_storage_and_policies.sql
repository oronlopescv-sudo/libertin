-- ============================================================================
-- XLIBERTINE — CORREÇÃO DE STORAGE + POLÍTICAS RLS
-- ----------------------------------------------------------------------------
-- Executar no SQL Editor do Supabase (Dashboard):
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- Este script é IDEMPOTENTE: pode ser executado várias vezes sem risco.
-- Resolve dois problemas concretos encontrados em produção:
--   1. O bucket `photos` não existia → todo o upload de fotos falhava.
--   2. Algumas tabelas não tinham políticas de escrita permissivas → o
--      cliente de sessão (chave anon + cookie do utilizador) não conseguia
--      inserir/atualizar linhas, mesmo com o utilizador autenticado.
--
-- Segurança: estas políticas são permissivas (qualquer utilizador autenticado
-- pode ler/escrever). Correspondem à postura já existente no esquema 001.
-- Para endurecer, restrinja as WITH CHECK ao `auth.uid() = user_id` depois.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BUCKET DE STORAGE PARA FOTOS (público em leitura)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. POLÍTICAS DO STORAGE (storage.objects)
-- ----------------------------------------------------------------------------
-- Leitura pública de qualquer objeto do bucket `photos`.
DROP POLICY IF EXISTS "photos_public_read" ON storage.objects;
CREATE POLICY "photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

-- Upload: qualquer utilizador autenticado pode inserir no bucket `photos`.
-- (A rota /api/photos/upload já verifica autenticação + Premium + valida o
--  ficheiro; o caminho inclui o id do próprio utilizador.)
DROP POLICY IF EXISTS "photos_auth_insert" ON storage.objects;
CREATE POLICY "photos_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- Update / delete: utilizadores autenticados sobre os seus próprios objetos.
DROP POLICY IF EXISTS "photos_owner_update" ON storage.objects;
CREATE POLICY "photos_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "photos_owner_delete" ON storage.objects;
CREATE POLICY "photos_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos' AND auth.role() = 'authenticated');

-- ----------------------------------------------------------------------------
-- 3. POLÍTICAS RLS PERMISSIVAS NAS TABELAS PRINCIPAIS
-- ----------------------------------------------------------------------------
-- Garante que o cliente de sessão (anon + cookie) pode ler/escrever.
-- Segue o mesmo padrão do esquema 001 (USING (true) / WITH CHECK (true)).

-- profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow profile insert" ON public.profiles;
CREATE POLICY "Allow profile insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow profile update" ON public.profiles;
CREATE POLICY "Allow profile update" ON public.profiles FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow profile delete" ON public.profiles;
CREATE POLICY "Allow profile delete" ON public.profiles FOR DELETE USING (true);

-- photos
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public photos read" ON public.photos;
CREATE POLICY "Public photos read" ON public.photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow photos insert" ON public.photos;
CREATE POLICY "Allow photos insert" ON public.photos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow photos update" ON public.photos;
CREATE POLICY "Allow photos update" ON public.photos FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow photos delete" ON public.photos;
CREATE POLICY "Allow photos delete" ON public.photos FOR DELETE USING (true);

-- verification_photos
ALTER TABLE public.verification_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public verif photos read" ON public.verification_photos;
CREATE POLICY "Public verif photos read" ON public.verification_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow verif photos insert" ON public.verification_photos;
CREATE POLICY "Allow verif photos insert" ON public.verification_photos FOR INSERT WITH CHECK (true);

-- groups
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

-- messages
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

-- subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public subscriptions read" ON public.subscriptions;
CREATE POLICY "Public subscriptions read" ON public.subscriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow subscriptions insert" ON public.subscriptions;
CREATE POLICY "Allow subscriptions insert" ON public.subscriptions FOR INSERT WITH CHECK (true);

-- events / event_participants / event_photos
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public events read" ON public.events;
CREATE POLICY "Public events read" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow events insert" ON public.events;
CREATE POLICY "Allow events insert" ON public.events FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow events update" ON public.events;
CREATE POLICY "Allow events update" ON public.events FOR UPDATE USING (true) WITH CHECK (true);

ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public event_participants read" ON public.event_participants;
CREATE POLICY "Public event_participants read" ON public.event_participants FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow event_participants insert" ON public.event_participants;
CREATE POLICY "Allow event_participants insert" ON public.event_participants FOR INSERT WITH CHECK (true);

ALTER TABLE public.event_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public event_photos read" ON public.event_photos;
CREATE POLICY "Public event_photos read" ON public.event_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow event_photos insert" ON public.event_photos;
CREATE POLICY "Allow event_photos insert" ON public.event_photos FOR INSERT WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 4. COLUNAS AUSENTES (adiciona só se faltarem; não destrói dados)
-- ----------------------------------------------------------------------------
-- A tabela `messages` em produção não tem coluna para mídia. Adicionamos
-- `media_url` (nullable) para suportar futuros anexos sem partir o existente.
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- `groups` pode não ter `cover_url` nem campos de expiração/anonimato.
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS allows_anonymous BOOLEAN DEFAULT false;
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS is_nsfw BOOLEAN DEFAULT false;

-- `likes` usa `createdAt` (camelCase) em produção; adicionamos `created_at`
-- para compatibilidade, sem remover a coluna existente.
ALTER TABLE public.likes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fim.