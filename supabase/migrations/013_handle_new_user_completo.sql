-- 013 — Trigger de cadastro completo (handle_new_user)
--
-- Contexto: o trigger on_auth_user_created existe em produção mas NÃO estava
-- versionado no repositório (o código fala numa "migration 007" que não o
-- contém). A versão de produção:
--   * ignora `interests` das metadata (o perfil nascia sem centros de interesse);
--   * cria o perfil com is_nsfw = false (o resto do app assume true);
--   * deixa lat/lng nulos quando a metadata não os traz;
--   * não tira espaços ao pseudo ("Condenga" e "Condenga " viraram 2 contas).
--
-- Enquanto a RLS de `profiles` esteja aberta, o upsert do navegador tapava estes
-- buracos. Ao aplicar 010/012 (RLS endurecida) esse upsert deixa de funcionar
-- sem sessão, e o perfil ficaria incompleto. Este trigger passa a ser a ÚNICA
-- fonte de verdade do perfil inicial.
--
-- Idempotente: CREATE OR REPLACE. O trigger em si não é tocado.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta        jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  interesses  text[] := '{}';
  pseudo      text;
begin
  -- interests: array JSON de strings -> text[] (máx. 20 itens de 40 caracteres,
  -- os mesmos limites de PATCH /api/users/profile).
  if jsonb_typeof(meta -> 'interests') = 'array' then
    select coalesce(array_agg(left(btrim(x), 40)), '{}')
      into interesses
      from (
        select x
          from jsonb_array_elements_text(meta -> 'interests') with ordinality as t(x, n)
         where btrim(x) <> ''
         order by n
         limit 20
      ) s;
  end if;

  pseudo := coalesce(nullif(btrim(meta ->> 'username'), ''), split_part(new.email, '@', 1));

  insert into public.profiles (
    id, email, username, date_of_birth, gender, sexual_orientation,
    location, lat, lng, bio, interests,
    subscription_tier, is_verified, is_active, is_nsfw, role
  )
  values (
    new.id,
    new.email,
    pseudo,
    nullif(meta ->> 'dateOfBirth', '')::date,
    coalesce(nullif(meta ->> 'gender', ''), 'homme'),
    coalesce(nullif(meta ->> 'sexualOrientation', ''), 'hetero'),
    coalesce(meta ->> 'location', ''),
    coalesce(nullif(meta ->> 'lat', '')::double precision, 48.8566),
    coalesce(nullif(meta ->> 'lng', '')::double precision, 2.3522),
    left(meta ->> 'bio', 1000),
    interesses,
    'FREE', false, true, true, 'user'
  )
  on conflict (id) do nothing;

  return new;
end
$$;

-- Função de trigger: não deve ser chamável via /rest/v1/rpc/handle_new_user
-- (avisos do Supabase Advisor). O disparo do trigger não precisa de EXECUTE.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
