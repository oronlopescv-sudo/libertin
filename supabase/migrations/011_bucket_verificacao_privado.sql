-- ============================================================================
-- XLIBERTINE — 011: BUCKET verification-photos PASSA A PRIVADO
-- ----------------------------------------------------------------------------
-- Executar NO SQL Editor do Supabase (DDL não passa por REST):
--   https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
--
-- IDEMPOTENTE.
--
-- Contexto: o bucket `verification-photos` guarda os SELFIES/DOCUMENTOS de
-- verificação de identidade. fix_everything.sql (nunca versionado antes de
-- 010) criou o bucket público + a política `vp_public_read` que deixa
-- QUALQUER pessoa (anon key no browser) LER qualquer foto a partir do link.
-- O link fica gravado no campo `url` de verification_photos — ou seja, os
-- documentos de identidade estavam acessíveis sem sessão.
--
-- O app já não depende do URL público:
--   * a fila de revisão do admin recebe um URL ASSINADO gerado pelo servidor
--     (assinaUrlVerificacao() — 1h) — commit desta migration;
--   * o checkout NSFW é corrido pelo servidor contra o URL assinado;
--   * o modal do utilizador só renderiza o preview local (data: URL).
-- ============================================================================

-- 0. Bucket privado — fecha o endpoint /object/public/... imediatamente.
UPDATE storage.buckets SET public = false WHERE id = 'verification-photos';

-- 1. Remover leitura pública/mundial dos objetos do bucket (qualquer
--    política SELECT que mencione o bucket — inclui "vp_public_read").
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND cmd = 'SELECT'
      AND qual::text ILIKE '%verification-photos%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
  END LOOP;
END;
$$;

-- 2. `vp_owner_delete` (USING (bucket_id = ...)) permitia a QUALQUER usuário
--    autenticado apagar fotos de verificação DE OUTREM. A partir de agora,
--    apagar restringe-se à própria pasta (verification/<meuUserId>/...);
--    a chave de serviço não passa por RLS e mantém-se (webhook/admin/reject).
DROP POLICY IF EXISTS "vp_owner_delete" ON storage.objects;
CREATE POLICY "vp_owner_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'verification-photos'
    AND (storage.foldername(name))[2] = (select auth.uid())::text
  );

-- 3. `vp_auth_insert` mantém-se como estava (fallback de upload com a sessão
--    do membro, quando a chave de serviço não é utilizável) — recriada aqui
--    só para ficar versionada junto do resto do bucket.
DROP POLICY IF EXISTS "vp_auth_insert" ON storage.objects;
CREATE POLICY "vp_auth_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'verification-photos');

-- FIM — 011_bucket_verificacao_privado.sql