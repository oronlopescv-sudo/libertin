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