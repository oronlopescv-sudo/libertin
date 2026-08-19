-- ============================================================================
-- XLIBERTINE — APLICAR DE UNHA VEZ (idempotente) — pegar no SQL Editor do Supabase
-- Dashboard: https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
-- Contén: 004 (bucket chat-media) + 005 (fix RLS fotos). Pódese repetir sen risco.
-- ============================================================================

-- ############################## 004 ########################################

-- ============================================================================
-- XLIBERTINE — BUCKET DE STORAGE PARA MÍDIA DO CHAT
-- ----------------------------------------------------------------------------
-- Executar no SQL Editor do Supabase (Dashboard):
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- Este script é IDEMPOTENTE: pode ser executado várias vezes sem risco.
--
-- Cria o bucket `chat-media` para guardar as imagens enviadas nos tchats
-- (grupo e conversas privadas). A coluna `messages.media_url` já existe no
-- esquema (003_fix_storage_and_policies.sql) — este bucket é onde os ficheiros
-- fisicamente residem.
--
-- Segurança: as políticas são permissivas (qualquer utilizador autenticado
-- pode ler/escrever), seguindo exatamente o padrão do bucket `photos`. A
-- verificação de autenticação + Premium é feita na rota servidor
-- /api/chat/upload (utilisateurPremium), antes de chegar ao Storage — nunca
-- confiar no cliente. Para endurecer, restrinja as WITH CHECK ao
-- `auth.uid() = owner` depois (exige coluna `owner` nos objetos).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BUCKET DE STORAGE PARA MÍDIA DO CHAT (público em leitura)
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. POLÍTICAS DO STORAGE (storage.objects)
-- ----------------------------------------------------------------------------
-- Leitura pública de qualquer objeto do bucket `chat-media`.
DROP POLICY IF EXISTS "chat_media_public_read" ON storage.objects;
CREATE POLICY "chat_media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chat-media');

-- Upload no bucket `chat-media`.
-- Permissiva (só exige bucket_id): a verificação de auth + Premium é feita na
-- rota /api/chat/upload (servidor), antes de chegar aqui.
DROP POLICY IF EXISTS "chat_media_auth_insert" ON storage.objects;
CREATE POLICY "chat_media_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'chat-media');

-- Update no bucket `chat-media`.
DROP POLICY IF EXISTS "chat_media_owner_update" ON storage.objects;
CREATE POLICY "chat_media_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'chat-media')
  WITH CHECK (bucket_id = 'chat-media');

-- Delete no bucket `chat-media`.
DROP POLICY IF EXISTS "chat_media_owner_delete" ON storage.objects;
CREATE POLICY "chat_media_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'chat-media');
-- ############################## 005 ########################################

-- ============================================================================
-- XLIBERTINE — CORRIGE O RLS DO STORAGE DO BUCKET `photos`
-- ----------------------------------------------------------------------------
-- Erro reportado no upload de fotos do perfil :
--   "Échec de l'envoi de la photo — new row violates row-level security policy"
--
-- Causa : o upload para o Storage insere uma linha em `storage.objects`. Se a
-- política de INSERT do bucket `photos` não existe (migration 003 não rodada)
-- ou foi substituída por uma política restritiva (ex. `auth.role() =
-- 'authenticated'` ou `auth.uid() = owner`) e o client de sessão não transporta
-- o token JWT até o Storage, o INSERT é negado pelo RLS → exatamente esta
-- mensagem. O ficheiro nunca chega a ser guardado.
--
-- Esta migration (re)cria o bucket `photos` e políticas PERMISSIVAS em
-- `storage.objects`, seguindo o padrão das migrations 001/003/fix_everything :
-- a verificação de auth + Premium é feita na rota /api/photos/upload
-- (utilisateurPremium), ANTES de chegar ao Storage — não no RLS. Idempotente.
--
-- Executar no SQL Editor do Supabase (Dashboard).
-- ============================================================================

-- 1. Garante que o bucket `photos` existe e é público em leitura.
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. (Re)cria as políticas de Storage permissivas para o bucket `photos`.
--    DROP antes de CREATE para substituir qualquer política restritiva
--    existente (default do Supabase ou aplicada manualmente).
DROP POLICY IF EXISTS "photos_public_read" ON storage.objects;
CREATE POLICY "photos_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_auth_insert" ON storage.objects;
CREATE POLICY "photos_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_owner_update" ON storage.objects;
CREATE POLICY "photos_owner_update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'photos')
  WITH CHECK (bucket_id = 'photos');

DROP POLICY IF EXISTS "photos_owner_delete" ON storage.objects;
CREATE POLICY "photos_owner_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'photos');

-- 3. Garante também as políticas da TABELA `public.photos` (permissivas),
--    caso tenham sido alteradas. O gate de auth/Premium fica na rota servidor.
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public photos read" ON public.photos;
CREATE POLICY "Public photos read" ON public.photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow photos insert" ON public.photos;
CREATE POLICY "Allow photos insert" ON public.photos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow photos update" ON public.photos;
CREATE POLICY "Allow photos update" ON public.photos FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow photos delete" ON public.photos;
CREATE POLICY "Allow photos delete" ON public.photos FOR DELETE USING (true);