-- Annonces publiées par les membres Premium (l'API vérifie le statut Premium).
create table if not exists public.annonces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 3 and 100),
  body text not null check (char_length(btrim(body)) between 10 and 1500),
  city text not null default '' check (char_length(city) <= 80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);
create index if not exists annonces_actives_idx on public.annonces (is_active, created_at desc);
create index if not exists annonces_user_idx on public.annonces (user_id);

alter table public.annonces enable row level security;

-- Lecture : membres connectés uniquement.
drop policy if exists annonces_select on public.annonces;
create policy annonces_select on public.annonces
  for select to authenticated using (is_active and expires_at > now() or user_id = auth.uid());

-- Écriture : seulement ses propres annonces.
drop policy if exists annonces_insert on public.annonces;
create policy annonces_insert on public.annonces
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists annonces_update on public.annonces;
create policy annonces_update on public.annonces
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists annonces_delete on public.annonces;
create policy annonces_delete on public.annonces
  for delete to authenticated using (user_id = auth.uid());
