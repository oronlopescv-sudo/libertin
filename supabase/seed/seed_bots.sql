-- ========================================================
-- LIBERTINELOVERS - SEED DE PERFIS BOT
-- Executar no SQL Editor do Supabase depois de criar as tabelas
-- ========================================================

-- Bots femininos
INSERT INTO public.profiles (
  email, username, phone, date_of_birth, gender, sexual_orientation,
  location, lat, lng, subscription_tier, bio, interests,
  is_verified, is_active, is_nsfw, role
) VALUES
(
  'sophie.bot@libertin.local', 'Sophie_Elegance_Bot', NULL, '1993-04-20', 'femme', 'bi',
  'Bordeaux', 44.8378, -0.5792, 'PASS_EPICURIEN',
  'Femme solo élégante et mystérieuse, curieuse de rencontres raffinées à Bordeaux.',
  ARRAY['Cocktails & Lounges', 'Mélangisme', 'Courtoisie', 'Aventures discrètes'],
  true, true, false, 'user'
),
(
  'chloe.bot@libertin.local', 'Chloé_Genève_Bot', NULL, '1992-08-11', 'femme', 'bi',
  'Genève', 46.2044, 6.1432, 'PASS_PRIVILEGE',
  'Genevoise indépendante, passionnée par les escapades et les complicités sans prise de tête.',
  ARRAY['Hôtels de charme', 'Cocktails & Lounges', 'Mélangisme', 'Espaces bien-être'],
  true, true, false, 'user'
),
(
  'emma.bot@libertin.local', 'Emma_Paris_Bot', NULL, '1995-02-14', 'femme', 'hetero',
  'Paris', 48.8566, 2.3522, 'FREE',
  'Parisienne coquette et discrète, à la recherche de belles rencontres galantes.',
  ARRAY['Soirées privées', 'Discrétion', 'Champagne Bar'],
  false, true, false, 'user'
),
(
  'laura.bot@libertin.local', 'Laura_Lyon_Bot', NULL, '1991-07-30', 'femme', 'libertin',
  'Lyon', 45.7640, 4.8357, 'PASS_PRIVILEGE',
  'Lyonnaise épicurienne, adepte des clubs select et des soirées en petit comité.',
  ARRAY['Clubs libertins', 'Savoir-vivre', 'Soirées en villa'],
  true, true, true, 'user'
);

-- Bots masculinos
INSERT INTO public.profiles (
  email, username, phone, date_of_birth, gender, sexual_orientation,
  location, lat, lng, subscription_tier, bio, interests,
  is_verified, is_active, is_nsfw, role
) VALUES
(
  'alexandre.bot@libertin.local', 'Alexandre_Gentleman_Bot', NULL, '1985-11-03', 'homme', 'hetero',
  'Lyon', 45.7640, 4.8357, 'FREE',
  'Homme solo galant et respectueux, habitué des événements libertins sélectifs.',
  ARRAY['Savoir-vivre', 'Clubs lyonnais', 'Rencontres éphémères'],
  false, true, false, 'user'
),
(
  'sebastien.bot@libertin.local', 'Sébastien_Monaco_Bot', NULL, '1984-07-19', 'homme', 'hetero',
  'Monaco', 43.7384, 7.4246, 'PASS_PRIVILEGE',
  'Gentleman monégasque épicurien, courtois et respectueux des limites de chacun.',
  ARRAY['Yachting & Soirées', 'Courtoisie', 'Champagne Bar', 'Respect & Bienveillance'],
  true, true, false, 'user'
),
(
  'julien.bot@libertin.local', 'Julien_Nice_Bot', NULL, '1988-03-12', 'homme', 'libertin',
  'Nice', 43.7102, 7.2620, 'PASS_VIP',
  'Niçois ensoleillé, amateur de soirées sur la Côte et de rencontres décontractées.',
  ARRAY['Soirées en villa', 'Piscine & Champagne', 'Mélangisme soft'],
  true, true, true, 'user'
),
(
  'maxime.bot@libertin.local', 'Maxime_Bruxelles_Bot', NULL, '1986-09-25', 'homme', 'bi',
  'Bruxelles', 50.8503, 4.3517, 'PASS_PRIVILEGE',
  'Bruxellois festif et ouvert d’esprit, amateur de clubs privés et de belles découvertes.',
  ARRAY['Clubs libertins', 'Bières artisanales & Champagne', 'Échangisme soft', 'Discrétion'],
  true, true, true, 'user'
);

-- Bots casais
INSERT INTO public.profiles (
  email, username, phone, date_of_birth, gender, sexual_orientation,
  location, lat, lng, subscription_tier, bio, interests,
  is_verified, is_active, is_nsfw, role
) VALUES
(
  'coupleparis.bot@libertin.local', 'MarcEtElena_Paris_Bot', NULL, '1988-06-12', 'couple', 'libertin',
  'Paris', 48.8566, 2.3522, 'PASS_PRIVILEGE',
  'Couple épicurien et complice, passionné par les clubs privés parisiens et les soirées intimes.',
  ARRAY['Clubs libertins', 'Soirées privées', 'Échangisme soft', 'Discrétion', 'Voyeurisme'],
  true, true, true, 'user'
),
(
  'couplecannes.bot@libertin.local', 'JulienEtChloe_Cannes_Bot', NULL, '1991-09-15', 'couple', 'libertin',
  'Cannes', 43.5528, 7.0174, 'PASS_VIP',
  'Couple solaire de la Côte d’Azur, organisateur de soirées en villa privée.',
  ARRAY['Soirées en villa', 'Piscine & Champagne', 'Discrétion absolue', 'Mélangisme soft'],
  true, true, true, 'user'
);
