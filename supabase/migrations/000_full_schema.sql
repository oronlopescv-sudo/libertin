-- ============================================================================
-- XLIBERTINE — SCHEMA COMPLETO (rodar de uma vez só no Supabase SQL Editor)
-- ============================================================================
-- Ordem corrigida (groups antes de messages, pois messages referencia groups)
-- Inclui tabelas que faltavam: group_memberships, admin_logs, payment_logs
-- ============================================================================

-- ----------------------------------------------------------------------------
-- USERS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(NOW(), date_of_birth))::INT) STORED,
  gender TEXT NOT NULL CHECK (gender IN ('couple', 'homme', 'femme')),
  sexual_orientation TEXT NOT NULL,
  location TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  bio TEXT,
  photos JSONB DEFAULT '[]',
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  stripe_customer_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  blocked_user_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- GROUPS (criado antes de messages, pois messages referencia esta tabela)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id),
  creator_name TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  max_members INT DEFAULT 50,
  member_count INT DEFAULT 0,
  category TEXT,
  cover_url TEXT,
  -- Campos adicionados pela feature de anonimato/expiração:
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  allows_anonymous BOOLEAN DEFAULT TRUE,
  is_nsfw BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- GROUP MEMBERSHIPS (faltava — necessária para anonimato e associação de membros)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'creator', 'moderator')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  anonymous_name TEXT,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

-- ----------------------------------------------------------------------------
-- MESSAGES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  is_sender_anonymous BOOLEAN DEFAULT FALSE,
  displayed_username TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- VERIFICATION PHOTOS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- EVENTS (festa privada, gang bang, troca de casais, etc — €100/150/200)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  city VARCHAR(100),
  date_time TIMESTAMP,
  is_date_flexible BOOLEAN DEFAULT false,
  looking_for TEXT,
  min_participants INT,
  max_participants INT,
  confirmed_count INT DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  requires_verification BOOLEAN DEFAULT false,
  is_nsfw BOOLEAN DEFAULT true,
  plan_type VARCHAR(50),
  amount_paid DECIMAL(10, 2),
  payment_status VARCHAR(50),
  stripe_payment_id VARCHAR(255),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50),
  joined_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- ADMIN LOGS (faltava — usado por banUser/unbanUser/flagGroup/deleteGroup)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  target_id UUID,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- PAYMENT LOGS (faltava — usado pelo webhook do Stripe)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  amount INT,
  currency TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_expires ON groups(expires_at);
CREATE INDEX IF NOT EXISTS idx_verification_photos_user ON verification_photos(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id OR is_verified);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Anyone can read active events" ON events
  FOR SELECT USING (is_active = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read participants of active events" ON event_participants
  FOR SELECT USING (
    (SELECT is_active FROM events WHERE id = event_id) = true
    OR auth.uid() = user_id
  );

-- ============================================================================
-- SEED: Grupo "Nudes Anônimos" (criado após haver ao menos 1 admin)
-- Rode este INSERT separadamente, DEPOIS de criar seu usuário admin,
-- trocando 'SEU_EMAIL_ADMIN_AQUI' pelo seu email.
-- ============================================================================
-- INSERT INTO groups (name, description, creator_id, creator_name, is_private, max_members, category, cover_url, is_nsfw, allows_anonymous)
-- VALUES (
--   'Nudes Anônimos',
--   'Partilhe fotos & vídeos 100% anônimo. Apenas PREMIUM. Ambiente discreto e respeitoso.',
--   (SELECT id FROM users WHERE email = 'SEU_EMAIL_ADMIN_AQUI' LIMIT 1),
--   'xlibertine Admin',
--   true,
--   500,
--   'discretion',
--   'https://via.placeholder.com/400x300?text=Nudes+Anonimos',
--   true,
--   true
-- );
