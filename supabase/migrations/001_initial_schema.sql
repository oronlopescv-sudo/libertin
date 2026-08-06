-- ========================================================
-- LIBERTINELOVERS - SCHEMA INITIAL SUPABASE (POSTGRESQL)
-- Projeto: mfchfnsekoluicxnguoh
-- Executar este script no "SQL Editor" do Supabase:
-- https://supabase.com/dashboard/project/mfchfnsekoluicxnguoh/sql/new
-- ========================================================

-- 1. TABELA PROFILES / UTILISATEURS
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT DEFAULT 'couple',
  sexual_orientation TEXT DEFAULT 'libertin',
  location TEXT DEFAULT 'Paris',
  lat DOUBLE PRECISION DEFAULT 48.8566,
  lng DOUBLE PRECISION DEFAULT 2.3522,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_nsfw BOOLEAN DEFAULT TRUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow user insert profile" ON public.profiles;
CREATE POLICY "Allow user insert profile" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow user update profile" ON public.profiles;
CREATE POLICY "Allow user update profile" ON public.profiles FOR UPDATE USING (true);


-- 2. TABELA PHOTOS
CREATE TABLE IF NOT EXISTS public.photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_cover BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public photos read" ON public.photos;
CREATE POLICY "Public photos read" ON public.photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow photos insert" ON public.photos;
CREATE POLICY "Allow photos insert" ON public.photos FOR INSERT WITH CHECK (true);


-- 3. TABELA VERIFICATION_PHOTOS
CREATE TABLE IF NOT EXISTS public.verification_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.verification_photos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public verif photos read" ON public.verification_photos;
CREATE POLICY "Public verif photos read" ON public.verification_photos FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow verif photos insert" ON public.verification_photos;
CREATE POLICY "Allow verif photos insert" ON public.verification_photos FOR INSERT WITH CHECK (true);


-- 4. TABELA GROUPS
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  creator_name TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  max_members INT DEFAULT 50,
  member_count INT DEFAULT 1,
  category TEXT DEFAULT 'clubs',
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public groups read" ON public.groups;
CREATE POLICY "Public groups read" ON public.groups FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow groups insert" ON public.groups;
CREATE POLICY "Allow groups insert" ON public.groups FOR INSERT WITH CHECK (true);


-- 5. TABELA MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public messages read" ON public.messages;
CREATE POLICY "Public messages read" ON public.messages FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow messages insert" ON public.messages;
CREATE POLICY "Allow messages insert" ON public.messages FOR INSERT WITH CHECK (true);


-- 6. TABELA SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public subscriptions read" ON public.subscriptions;
CREATE POLICY "Public subscriptions read" ON public.subscriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow subscriptions insert" ON public.subscriptions;
CREATE POLICY "Allow subscriptions insert" ON public.subscriptions FOR INSERT WITH CHECK (true);
