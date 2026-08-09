-- ============================================================================
-- ANONYMITY & EVENTS SYSTEM
-- ============================================================================

-- Update groups table with expiration & anonymity
ALTER TABLE groups ADD COLUMN IF NOT EXISTS (
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  allows_anonymous BOOLEAN DEFAULT true,
  is_nsfw BOOLEAN DEFAULT false,
  max_participants INT DEFAULT 50
);

-- Update group_memberships with anonymity
ALTER TABLE group_memberships ADD COLUMN IF NOT EXISTS (
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_name VARCHAR(50)
);

-- Update messages with anonymous display
ALTER TABLE messages ADD COLUMN IF NOT EXISTS (
  is_sender_anonymous BOOLEAN DEFAULT false,
  displayed_username VARCHAR(100)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Event info
  type VARCHAR(50) NOT NULL, -- 'festa' | 'gang_bang' | 'troca' | 'other'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  -- Location & timing
  location VARCHAR(255),
  city VARCHAR(100),
  date_time TIMESTAMP,
  is_date_flexible BOOLEAN DEFAULT false,
  
  -- Participants
  looking_for TEXT, -- "8 homens, 18-50 anos"
  min_participants INT,
  max_participants INT,
  confirmed_count INT DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN DEFAULT true,
  requires_verification BOOLEAN DEFAULT false,
  is_nsfw BOOLEAN DEFAULT true,
  
  -- Payment
  plan_type VARCHAR(50), -- 'basic' | 'featured' | 'vip_gold'
  amount_paid DECIMAL(10, 2),
  payment_status VARCHAR(50), -- 'pending' | 'paid' | 'failed'
  stripe_payment_id VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create event participants table
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50), -- 'interested' | 'confirmed' | 'cancelled'
  joined_at TIMESTAMP DEFAULT NOW()
);

-- Create event photos table
CREATE TABLE IF NOT EXISTS event_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_active ON events(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_expires ON groups(expires_at);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Anyone can read active events" ON events
  FOR SELECT USING (is_active = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE USING (auth.uid() = creator_id);

-- RLS Policies for event participants
CREATE POLICY "Users can join events" ON event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read participants of active events" ON event_participants
  FOR SELECT USING (
    (SELECT is_active FROM events WHERE id = event_id) = true
    OR auth.uid() = user_id
  );

-- Seed: Create "Nudes Anônimos" group
INSERT INTO groups (name, description, creator_id, creator_name, is_private, max_members, category, cover_url, is_nsfw, allows_anonymous)
VALUES (
  'Nudes Anônimos',
  'Partilhe fotos & vídeos 100% anônimo. Apenas PREMIUM. Ambiente discreto e respeitoso.',
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  'xlibertine Admin',
  true,
  500,
  'discretion',
  'https://via.placeholder.com/400x300?text=Nudes+Anonimos',
  true,
  true
)
ON CONFLICT DO NOTHING;
