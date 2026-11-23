-- ===========================================================================
-- XLIBERTINE — SCHEMA COMPLETO PARA COLAR NO SQL EDITOR
-- https://supabase.com/dashboard/project/<ref>/sql/new
-- Gerado dia 2026-11-23 a partir do ESTADO REAL de produção
-- (projeto mfchfnsekoluicxnguoh, 21 objetos: introspeção via REST/OpenAPI +
-- migrações 001→014, COLAR_010_011_012 e COLAR_013 consolidados).
--
-- Este único ficheiro reconstrói a BD de raíz:
--   1. Tabelas (colunas/tipos/defaults/not-null EXATOS da produção)
--   2. FKs + UNIQUEs + índices
--   3. Guard trigger de colunas sensíveis (010)
--   4. Triggers de limites/DM-duplicada (013)
--   5. RLS ligado em TODAS as tabelas + políticas endurecidas (010/012/013/014)
--   6. View pública profiles_public sem PII (012) + REVOKE anon (012)
--   7. Storage: photos + chat-media públicos, verification-photos PRIVADO (011)
--
-- Tabelas legadas presentes em produção e reproduzidas por paridade:
--   users (auth antigo, camelCase), subscriptions (userId TEXT, sem FK),
--   admin_logs/payment_logs (sem políticas — só service_role).
-- Sem dados; os bots ficam em supabase/seed/seed_bots.sql (correr à parte).
-- ===========================================================================

begin;

create extension if not exists pgcrypto;

-- ── profiles ──
create table if not exists public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  email text NOT NULL,
  username text NOT NULL,
  phone text,
  date_of_birth date,
  gender text DEFAULT 'couple',
  sexual_orientation text DEFAULT 'libertin',
  location text DEFAULT 'Paris',
  lat double precision DEFAULT 48.8566,
  lng double precision DEFAULT 2.3522,
  subscription_tier text DEFAULT 'FREE',
  subscription_start timestamptz,
  subscription_end timestamptz,
  stripe_customer_id text,
  bio text,
  interests text[],
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  is_nsfw boolean DEFAULT true,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
-- ── photos ──
create table if not exists public.photos (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  url text NOT NULL,
  is_cover boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  uploaded_at timestamp NOT NULL DEFAULT now(),
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE
);
-- ── verification_photos ──
create table if not exists public.verification_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  url text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  rejection_reason text,
  submitted_at timestamp NOT NULL DEFAULT now(),
  reviewed_at timestamp,
  expires_at timestamp,
  reviewed_by uuid,
  created_at timestamptz DEFAULT now(),
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE
);
create index if not exists idx_verification_photos_user on public.verification_photos (user_id);
-- ── groups ──
create table if not exists public.groups (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  name text NOT NULL,
  description text,
  creator_id uuid NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  max_members integer NOT NULL DEFAULT 50,
  category text NOT NULL,
  coverPhoto text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  creator_name text,
  member_count integer NOT NULL DEFAULT 1,
foreign key (creator_id) references public.profiles(id) ON DELETE SET NULL
);
-- ── messages ──
create table if not exists public.messages (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  group_id text NOT NULL,
  content text NOT NULL,
  mediaUrl text,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  user_name text,
  user_avatar text,
  displayed_username text,
  media_url text,
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE,
foreign key (group_id) references public.groups(id) ON DELETE CASCADE
);
create index if not exists idx_messages_group on public.messages (group_id);
-- ── likes ──
create table if not exists public.likes (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  liked_user_id uuid NOT NULL,
  createdAt timestamp NOT NULL DEFAULT now(),
  unique (user_id, liked_user_id),
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE,
foreign key (liked_user_id) references public.profiles(id) ON DELETE CASCADE
);
create index if not exists idx_likes_user on public.likes (user_id);
create index if not exists idx_likes_liked on public.likes (liked_user_id);
-- ── blocked_users ──
create table if not exists public.blocked_users (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
foreign key (user_id) references public.profiles(id),
foreign key (blocked_id) references public.profiles(id)
);
create index if not exists blocked_users_user_id_idx on public.blocked_users (user_id);
create index if not exists blocked_users_blocked_id_idx on public.blocked_users (blocked_id);
create unique index if not exists blocked_users_par_unico on public.blocked_users (user_id, blocked_id);
-- ── group_memberships ──
create table if not exists public.group_memberships (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  group_id text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamp NOT NULL DEFAULT now(),
  unique (group_id, user_id),
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE,
foreign key (group_id) references public.groups(id) ON DELETE CASCADE
);
create index if not exists idx_gm_group on public.group_memberships (group_id);
create index if not exists idx_gm_user on public.group_memberships (user_id);
-- ── events ──
create table if not exists public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  creator_id uuid NOT NULL,
  type varchar(50) NOT NULL,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  location varchar(255),
  city varchar(100),
  date_time timestamp,
  is_date_flexible boolean DEFAULT false,
  looking_for text,
  min_participants integer,
  max_participants integer,
  confirmed_count integer DEFAULT 0,
  is_public boolean DEFAULT true,
  requires_verification boolean DEFAULT false,
  is_nsfw boolean DEFAULT true,
  plan_type varchar(50),
  amount_paid numeric,
  payment_status varchar(50),
  stripe_payment_id varchar(255),
  is_active boolean DEFAULT false,
  created_at timestamp DEFAULT now(),
  expires_at timestamp,
  updated_at timestamp DEFAULT now(),
foreign key (creator_id) references public.profiles(id) ON DELETE SET NULL
);
create index if not exists idx_events_creator on public.events (creator_id);
create index if not exists idx_events_active on public.events (is_active, expires_at);
create index if not exists idx_events_city on public.events (city);
-- ── event_participants ──
create table if not exists public.event_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status varchar(50),
  joined_at timestamp DEFAULT now(),
foreign key (event_id) references public.events(id) ON DELETE CASCADE,
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE
);
create index if not exists idx_event_participants_event on public.event_participants (event_id);
create index if not exists idx_event_participants_user on public.event_participants (user_id);
create unique index if not exists event_participants_par_unico on public.event_participants (event_id, user_id);
-- ── event_photos ──
create table if not exists public.event_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  event_id uuid NOT NULL,
  url varchar(500) NOT NULL,
  status varchar(50) DEFAULT 'pending',
  uploaded_at timestamp DEFAULT now(),
foreign key (event_id) references public.events(id) ON DELETE CASCADE
);
-- ── notifications ──
create table if not exists public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid,
  type text,
  title text,
  body text,
  link text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE
);
create index if not exists idx_notif_user on public.notifications (user_id);
-- ── reports ──
create table if not exists public.reports (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  reporter_id uuid,
  reported_id uuid,
  reason text NOT NULL,
  detail text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
foreign key (reporter_id) references public.profiles(id) ON DELETE SET NULL,
foreign key (reported_id) references public.profiles(id) ON DELETE CASCADE
);
-- ── subscriptions ──
create table if not exists public.subscriptions (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  userId text NOT NULL,
  tier text NOT NULL,
  priceEuro numeric NOT NULL,
  stripeSessionId text,
  stripeSubscriptionId text,
  startDate timestamp NOT NULL,
  endDate timestamp NOT NULL,
  status text NOT NULL DEFAULT 'active',
  autoRenew boolean NOT NULL DEFAULT true,
  createdAt timestamp NOT NULL DEFAULT now()
);
-- ── pricing_plans ──
create table if not exists public.pricing_plans (
  id text NOT NULL primary key,
  name text NOT NULL,
  displayName text NOT NULL,
  description text NOT NULL,
  priceEuro numeric NOT NULL,
  priceDolar numeric,
  priceCve numeric,
  billingPeriod text NOT NULL DEFAULT 'monthly',
  maxMessages integer NOT NULL,
  maxPhotos integer NOT NULL,
  maxProfiles integer NOT NULL,
  hasVideoCall boolean NOT NULL DEFAULT false,
  hasVoiceCall boolean NOT NULL DEFAULT false,
  hasAdvancedFilters boolean NOT NULL DEFAULT false,
  hasVerified boolean NOT NULL DEFAULT false,
  hasGallery boolean NOT NULL DEFAULT false,
  hasPriority boolean NOT NULL DEFAULT false,
  features jsonb NOT NULL,
  isActive boolean NOT NULL DEFAULT true,
  isPopular boolean NOT NULL DEFAULT false,
  stripeProductId text,
  createdAt timestamp NOT NULL DEFAULT now(),
  updatedAt timestamp NOT NULL
);
-- ── annonces ──
create table if not exists public.annonces (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  city text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + '30 days'::interval),
foreign key (user_id) references public.profiles(id) ON DELETE CASCADE
);
create index if not exists annonces_actives_idx on public.annonces (is_active, created_at desc);
create index if not exists annonces_user_idx on public.annonces (user_id);
-- ── password_resets ──
create table if not exists public.password_resets (
  id text NOT NULL DEFAULT gen_random_uuid() primary key,
  user_id uuid NOT NULL,
  token text NOT NULL,
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  used boolean NOT NULL DEFAULT false
);
create index if not exists idx_password_resets_token on public.password_resets (token);
-- ── admin_logs ──
create table if not exists public.admin_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  admin_id text NOT NULL,
  action text NOT NULL,
  target_id text,
  reason text,
  created_at timestamp DEFAULT now()
);
-- ── payment_logs ──
create table if not exists public.payment_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() primary key,
  stripe_charge_id text,
  stripe_customer_id text,
  amount integer,
  currency text,
  status text,
  created_at timestamp DEFAULT now()
);
-- ── users ──
create table if not exists public.users (
  id text NOT NULL primary key,
  email text NOT NULL,
  phone text,
  hashedPassword text NOT NULL,
  username text NOT NULL,
  dateOfBirth timestamp NOT NULL,
  gender text NOT NULL,
  sexualOrientation text NOT NULL,
  location text NOT NULL,
  lat double precision,
  lng double precision,
  subscriptionTier text NOT NULL DEFAULT 'FREE',
  subscriptionStart timestamp,
  subscriptionEnd timestamp,
  stripeCustomerId text,
  bio text,
  interests jsonb,
  isVerified boolean NOT NULL DEFAULT false,
  isActive boolean NOT NULL DEFAULT true,
  isNSFW boolean NOT NULL DEFAULT false,
  isBanned boolean NOT NULL DEFAULT false,
  createdAt timestamp NOT NULL DEFAULT now(),
  updatedAt timestamp NOT NULL,
  lastLoginAt timestamp
);
-- ── view pública sem PII (012) ──────────────────────────────────────────────
drop view if exists public.profiles_public;
create view public.profiles_public as
select id, username, gender, is_verified, created_at
from public.profiles
where is_active = true;
grant select on public.profiles_public to anon, authenticated;
comment on view public.profiles_public is
  'Acesso público SEGURO: sem email/phone/stripe/subscription. Leitura anónima só por aqui (012).';


-- ── guard de colunas sensíveis (010) ───────────────────────────────────────
drop trigger if exists protege_sensiveis_profiles on public.profiles;
CREATE OR REPLACE FUNCTION public.bloqueia_colunas_sensiveis_profiles()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Webhook Stripe, rotas admin e foto-de-verificação: chave de serviço.
  IF (SELECT auth.role()) = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF (NEW.subscription_tier   IS DISTINCT FROM OLD.subscription_tier)
     OR (NEW.subscription_start IS DISTINCT FROM OLD.subscription_start)
     OR (NEW.subscription_end   IS DISTINCT FROM OLD.subscription_end)
     OR (NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id)
     OR (NEW.is_verified        IS DISTINCT FROM OLD.is_verified)
     OR (NEW.is_active          IS DISTINCT FROM OLD.is_active)
     OR (NEW.role               IS DISTINCT FROM OLD.role)
  THEN
    RAISE EXCEPTION
      'xlibertine: colunas sensíveis do perfil (subscription/is_verified/role/is_active/stripe_customer_id) só podem ser alteradas pelo servidor'
      USING ERRCODE = '42501'; -- insufficient_privilege (o cliente vê 403 do PostgREST)
  END IF;

  RETURN NEW;
END;
$$;
create trigger protege_sensiveis_profiles
  before update on public.profiles
  for each row execute function public.bloqueia_colunas_sensiveis_profiles();
CREATE OR REPLACE FUNCTION public.bloqueia_dm_duplicada()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  grupo_categoria text;
  n_membros int;
  par_atual text;
  grupo_conflito uuid;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('xlib_dm_par'));

  SELECT category INTO grupo_categoria FROM public.groups WHERE id = NEW.group_id;
  IF grupo_categoria IS DISTINCT FROM 'private_dm' THEN
    RETURN NEW;
  END IF;

  SELECT count(*) INTO n_membros FROM public.group_memberships WHERE group_id = NEW.group_id;
  IF n_membros IS DISTINCT FROM 2 THEN
    RETURN NEW; -- só valida a DM completa (2 membros)
  END IF;

  SELECT string_agg(user_id::text, '|' ORDER BY user_id::text)
    INTO par_atual
    FROM public.group_memberships
    WHERE group_id = NEW.group_id;

  SELECT g.id INTO grupo_conflito
    FROM public.groups g
    JOIN public.group_memberships m ON m.group_id = g.id
    WHERE g.category = 'private_dm'
      AND g.id <> NEW.group_id
    GROUP BY g.id
    HAVING count(*) = 2
       AND string_agg(m.user_id::text, '|' ORDER BY m.user_id::text) = par_atual
    LIMIT 1;

  IF grupo_conflito IS NOT NULL THEN
    RAISE EXCEPTION 'DM duplicada para o mesmo par'
      USING ERRCODE = '23505',
            DETAIL = format('grupo %s já é a DM do par %s', grupo_conflito, par_atual);
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.limite_membros_grupo()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  maximo int;
  atual int;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('xlib_join_grupo'));
  SELECT max_members INTO maximo FROM public.groups WHERE id = NEW.group_id;
  IF maximo IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT count(*) INTO atual FROM public.group_memberships WHERE group_id = NEW.group_id;
  IF atual >= maximo THEN
    RAISE EXCEPTION 'Grupo cheio (max_members)'
      USING ERRCODE = '23505', DETAIL = 'max_members atingido';
  END IF;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.limite_anuncios_ativos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  ativos int;
BEGIN
  SELECT count(*) INTO ativos
    FROM public.annonces
    WHERE user_id = NEW.user_id
      AND is_active IS TRUE
      AND expires_at > now();
  IF ativos >= 5 THEN
    RAISE EXCEPTION 'Máximo de 5 anúncios ativos'
      USING ERRCODE = '23505', DETAIL = 'limite de anúncios atingido';
  END IF;
  RETURN NEW;
END;
$$;
drop trigger if exists trg_dm_par_unico on public.group_memberships;
create trigger trg_dm_par_unico after insert on public.group_memberships
  for each row execute function bloqueia_dm_duplicada();
drop trigger if exists trg_limite_membros_grupo on public.group_memberships;
create trigger trg_limite_membros_grupo before insert on public.group_memberships
  for each row execute function limite_membros_grupo();
drop trigger if exists trg_limite_anuncios on public.annonces;
create trigger trg_limite_anuncios before insert on public.annonces
  for each row execute function limite_anuncios_ativos();
alter table public.profiles enable row level security;
alter table public.photos enable row level security;
alter table public.likes enable row level security;
alter table public.blocked_users enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;
alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;
alter table public.events enable row level security;
alter table public.event_participants enable row level security;
alter table public.event_photos enable row level security;
alter table public.verification_photos enable row level security;
alter table public.subscriptions enable row level security;
alter table public.users enable row level security;
alter table public.pricing_plans enable row level security;
alter table public.admin_logs enable row level security;
alter table public.payment_logs enable row level security;
alter table public.password_resets enable row level security;
alter table public.annonces enable row level security;

-- ── profiles (010 + 012: SELECT só autenticado) ─────────────────────────────
create policy xlib_profiles_select_authenticated on public.profiles
  for select to authenticated using (true);
create policy xlib_profiles_insert_propria on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy xlib_profiles_update_propria on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy xlib_profiles_delete_propria on public.profiles
  for delete using ((select auth.uid()) = id);
revoke select on public.profiles from anon;

-- ── photos ──────────────────────────────────────────────────────────────────
create policy xlib_photos_select_public on public.photos for select using (true);
create policy xlib_photos_insert_propria on public.photos
  for insert with check ((select auth.uid()) = user_id);
create policy xlib_photos_update_propria on public.photos
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy xlib_photos_delete_propria on public.photos
  for delete using ((select auth.uid()) = user_id);

-- ── verification_photos (fotos de documento! nada público) ─────────────────
create policy xlib_vp_select_propria on public.verification_photos
  for select using ((select auth.uid()) = user_id);
create policy xlib_vp_insert_propria on public.verification_photos
  for insert with check ((select auth.uid()) = user_id);

-- ── likes ───────────────────────────────────────────────────────────────────
create policy xlib_likes_select_auth on public.likes
  for select using ((select auth.uid()) is not null
    and ((select auth.uid()) = user_id or (select auth.uid()) = liked_user_id));
create policy xlib_likes_insert_propria on public.likes
  for insert with check ((select auth.uid()) = user_id);
create policy xlib_likes_delete_propria on public.likes
  for delete using ((select auth.uid()) = user_id);

-- ── blocked_users ───────────────────────────────────────────────────────────
create policy xlib_blocked_select_ambos_lados on public.blocked_users
  for select using ((select auth.uid()) is not null
    and ((select auth.uid()) = user_id or (select auth.uid()) = blocked_id));
create policy xlib_blocked_insert_propria on public.blocked_users
  for insert with check ((select auth.uid()) = user_id);
create policy xlib_blocked_delete_propria on public.blocked_users
  for delete using ((select auth.uid()) = user_id);

-- ── messages (só membros do grupo) ──────────────────────────────────────────
create policy xlib_messages_select_membro on public.messages
  for select using ((select auth.uid()) is not null and (
    user_id = (select auth.uid())
    or exists (select 1 from public.group_memberships gm
      where gm.group_id = group_id and gm.user_id = (select auth.uid()))));
create policy xlib_messages_insert_membro on public.messages
  for insert with check ((select auth.uid()) = user_id
    and exists (select 1 from public.group_memberships gm
      where gm.group_id = group_id and gm.user_id = (select auth.uid())));
create policy xlib_messages_delete_propria on public.messages
  for delete using ((select auth.uid()) = user_id);

-- ── notifications (INSERT por membros FECHADO pelo 013 — rotas usam serviço)
create policy xlib_notifications_select_propria on public.notifications
  for select using ((select auth.uid()) = user_id);
create policy xlib_notifications_update_propria on public.notifications
  for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ── reports ─────────────────────────────────────────────────────────────────
create policy xlib_reports_insert_auth on public.reports
  for insert with check ((select auth.uid()) = reporter_id);

-- ── groups ──────────────────────────────────────────────────────────────────
create policy xlib_groups_select_public on public.groups for select using (true);
create policy xlib_groups_insert_criador on public.groups
  for insert with check ((select auth.uid()) = creator_id);
create policy xlib_groups_update_criador on public.groups
  for update using ((select auth.uid()) = creator_id) with check ((select auth.uid()) = creator_id);
create policy xlib_groups_delete_criador on public.groups
  for delete using ((select auth.uid()) = creator_id);

-- ── group_memberships ───────────────────────────────────────────────────────
create policy xlib_gm_select_auth on public.group_memberships
  for select using ((select auth.role()) = 'authenticated');
create policy xlib_gm_insert_own_ou_criador_dm on public.group_memberships
  for insert with check ((select auth.uid()) = user_id
    or exists (select 1 from public.groups g
      where g.id = group_id and g.creator_id = (select auth.uid())
        and g.category = 'private_dm'));
create policy xlib_gm_delete_own_ou_criador_dm on public.group_memberships
  for delete using ((select auth.uid()) = user_id
    or exists (select 1 from public.groups g
      where g.id = group_id and g.creator_id = (select auth.uid())
        and g.category = 'private_dm'));

-- ── events ──────────────────────────────────────────────────────────────────
create policy xlib_events_select_public on public.events for select using (true);
create policy xlib_events_insert_criador on public.events
  for insert with check ((select auth.uid()) = creator_id);
create policy xlib_events_update_criador on public.events
  for update using ((select auth.uid()) = creator_id) with check ((select auth.uid()) = creator_id);
create policy xlib_events_delete_criador on public.events
  for delete using ((select auth.uid()) = creator_id);

-- ── event_participants ──────────────────────────────────────────────────────
create policy xlib_ep_select_auth on public.event_participants
  for select using ((select auth.role()) = 'authenticated');
create policy xlib_ep_insert_propria on public.event_participants
  for insert with check ((select auth.uid()) = user_id);
create policy xlib_ep_delete_propria on public.event_participants
  for delete using ((select auth.uid()) = user_id);

-- ── event_photos (sem escritores → só serviço) ──────────────────────────────
create policy xlib_eph_select_public on public.event_photos for select using (true);

-- ── annonces (014) ──────────────────────────────────────────────────────────
create policy annonces_select on public.annonces
  for select to authenticated
  using ((is_active and expires_at > now()) or user_id = auth.uid());
create policy annonces_insert on public.annonces
  for insert to authenticated with check (user_id = auth.uid());
create policy annonces_update on public.annonces
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy annonces_delete on public.annonces
  for delete to authenticated using (user_id = auth.uid());

-- ── password_resets (sem acesso público) ────────────────────────────────────
create policy "No public access to password_resets" on public.password_resets
  for all to anon, authenticated using (false) with check (false);

-- subscriptions, pricing_plans, users, admin_logs, payment_logs:
-- NENHUMA política — só service_role (webhook Stripe / api/admin).

-- ── storage ─────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('photos','photos',true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('chat-media','chat-media',true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('verification-photos','verification-photos',false)
  on conflict (id) do update set public = false;

create policy "photos_public_read" on storage.objects
  for select using (bucket_id = 'photos');
create policy "photos_auth_insert" on storage.objects
  for insert with check (bucket_id = 'photos');
create policy "photos_owner_update" on storage.objects
  for update using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos');
create policy "photos_owner_delete" on storage.objects
  for delete using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "cm_public_read" on storage.objects
  for select using (bucket_id = 'chat-media');

-- verification-photos PRIVADO (011): sem SELECT policy → só URLs assinadas.
create policy "vp_owner_delete" on storage.objects
  for delete using (bucket_id = 'verification-photos'
    and (storage.foldername(name))[2] = (select auth.uid())::text);
create policy "vp_auth_insert" on storage.objects
  for insert with check (bucket_id = 'verification-photos'
    and (storage.foldername(name))[1] = 'verification'
    and (storage.foldername(name))[2] = (select auth.uid())::text);

-- ── trigger de registro (007, recriado — cria perfil no signup) ─────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, username, date_of_birth, gender,
    sexual_orientation, location, subscription_tier)
  values (new.id, new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    null,
    coalesce(new.raw_user_meta_data->>'gender','couple'),
    coalesce(new.raw_user_meta_data->>'sexualOrientation','libertin'),
    coalesce(new.raw_user_meta_data->>'location','Paris'),
    'FREE')
  on conflict (id) do nothing;
  return new;
exception when others then return new; -- não bloqueia o signup
end; $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

commit;

