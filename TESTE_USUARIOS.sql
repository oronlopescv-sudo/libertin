-- ============================================
-- INSERIR 50 CLIENTES DE TESTE + 3 AGENTES
-- ============================================

-- Criar função para hash de password (já existe no Supabase)
-- bcryptjs hash para "TestPass123" = $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2

-- ==========================================
-- 3 AGENTES (ADMIN)
-- ==========================================

INSERT INTO users (email, username, hashedPassword, dateOfBirth, gender, sexualOrientation, location, subscriptionTier, subscriptionEnd, isVerified, createdAt, updatedAt) VALUES

-- Agente 1
('agent.marie@xlibertine.com', 'Marie_Agent', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-03-15', 'femme', 'bisexuelle', 'Paris', 'PASS_VIP', '2027-08-09 23:59:59', true, '2026-01-01 08:00:00', '2026-08-09 10:00:00'),

-- Agente 2
('agent.pierre@xlibertine.com', 'Pierre_Agent', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1988-07-20', 'homme', 'heterosexuelle', 'Lyon', 'PASS_VIP', '2027-08-09 23:59:59', true, '2026-01-01 09:00:00', '2026-08-09 10:00:00'),

-- Agente 3
('agent.sophie@xlibertine.com', 'Sophie_Agent', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1992-11-10', 'femme', 'lesbienne', 'Bordeaux', 'PASS_VIP', '2027-08-09 23:59:59', true, '2026-01-01 10:00:00', '2026-08-09 10:00:00');

-- ==========================================
-- 50 CLIENTES DE TESTE
-- ==========================================

INSERT INTO users (email, username, hashedPassword, dateOfBirth, gender, sexualOrientation, location, subscriptionTier, subscriptionEnd, isVerified, createdAt, updatedAt) VALUES

-- FREE USERS (25 utilizadores)
('client.alice@xlibertine.com', 'Alice_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1995-05-14', 'femme', 'bisexuelle', 'Paris', 'FREE', NULL, false, '2026-08-01 10:00:00', '2026-08-09 10:00:00'),
('client.bob@xlibertine.com', 'Bob_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1992-08-22', 'homme', 'heterosexuelle', 'Lyon', 'FREE', NULL, false, '2026-08-01 10:00:00', '2026-08-09 10:00:00'),
('client.carol@xlibertine.com', 'Carol_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1998-02-10', 'femme', 'lesbienne', 'Bordeaux', 'FREE', NULL, false, '2026-08-02 10:00:00', '2026-08-09 10:00:00'),
('client.david@xlibertine.com', 'David_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-12-05', 'homme', 'bisexuelle', 'Côte d\'Azur', 'FREE', NULL, false, '2026-08-02 10:00:00', '2026-08-09 10:00:00'),
('client.emma@xlibertine.com', 'Emma_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1996-06-18', 'femme', 'heterosexuelle', 'Bruxelas', 'FREE', NULL, false, '2026-08-03 10:00:00', '2026-08-09 10:00:00'),
('client.frank@xlibertine.com', 'Frank_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1989-09-30', 'homme', 'heterosexuelle', 'Luxembourg', 'FREE', NULL, false, '2026-08-03 10:00:00', '2026-08-09 10:00:00'),
('client.grace@xlibertine.com', 'Grace_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1994-01-25', 'femme', 'bisexuelle', 'Paris', 'FREE', NULL, false, '2026-08-04 10:00:00', '2026-08-09 10:00:00'),
('client.henry@xlibertine.com', 'Henry_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1991-04-12', 'homme', 'bisexuelle', 'Lyon', 'FREE', NULL, false, '2026-08-04 10:00:00', '2026-08-09 10:00:00'),
('client.iris@xlibertine.com', 'Iris_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1997-07-08', 'femme', 'lesbienne', 'Bordeaux', 'FREE', NULL, false, '2026-08-05 10:00:00', '2026-08-09 10:00:00'),
('client.jack@xlibertine.com', 'Jack_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1993-10-20', 'homme', 'heterosexuelle', 'Côte d\'Azur', 'FREE', NULL, false, '2026-08-05 10:00:00', '2026-08-09 10:00:00'),
('client.kate@xlibertine.com', 'Kate_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1995-11-11', 'femme', 'bisexuelle', 'Bruxelas', 'FREE', NULL, false, '2026-08-06 10:00:00', '2026-08-09 10:00:00'),
('client.liam@xlibertine.com', 'Liam_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-03-16', 'homme', 'bisexuelle', 'Luxembourg', 'FREE', NULL, false, '2026-08-06 10:00:00', '2026-08-09 10:00:00'),
('client.mia@xlibertine.com', 'Mia_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1998-05-27', 'femme', 'lesbienne', 'Paris', 'FREE', NULL, false, '2026-08-07 10:00:00', '2026-08-09 10:00:00'),
('client.noah@xlibertine.com', 'Noah_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1991-08-31', 'homme', 'heterosexuelle', 'Lyon', 'FREE', NULL, false, '2026-08-07 10:00:00', '2026-08-09 10:00:00'),
('client.olivia@xlibertine.com', 'Olivia_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1996-09-13', 'femme', 'bisexuelle', 'Bordeaux', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.peter@xlibertine.com', 'Peter_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1992-12-02', 'homme', 'bisexuelle', 'Côte d\'Azur', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.quinn@xlibertine.com', 'Quinn_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1997-01-19', 'femme', 'lesbienne', 'Bruxelas', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.rachel@xlibertine.com', 'Rachel_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1994-04-06', 'femme', 'bisexuelle', 'Luxembourg', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.sam@xlibertine.com', 'Sam_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1989-07-23', 'homme', 'heterosexuelle', 'Paris', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.tara@xlibertine.com', 'Tara_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1995-10-14', 'femme', 'lesbienne', 'Lyon', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.uma@xlibertine.com', 'Uma_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1993-02-28', 'femme', 'bisexuelle', 'Bordeaux', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.victor@xlibertine.com', 'Victor_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-06-09', 'homme', 'bisexuelle', 'Côte d\'Azur', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.wendy@xlibertine.com', 'Wendy_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1996-11-21', 'femme', 'lesbienne', 'Bruxelas', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.xavier@xlibertine.com', 'Xavier_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1991-03-17', 'homme', 'heterosexuelle', 'Luxembourg', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.yara@xlibertine.com', 'Yara_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1998-08-03', 'femme', 'bisexuelle', 'Paris', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),
('client.zoe@xlibertine.com', 'Zoe_Free', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1994-09-29', 'femme', 'lesbienne', 'Lyon', 'FREE', NULL, false, '2026-08-08 10:00:00', '2026-08-09 10:00:00'),

-- PREMIUM mensuel (12 utilizadores)
('premium.alice@xlibertine.com', 'Alice_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1993-03-14', 'femme', 'bisexuelle', 'Paris', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-01 10:00:00', '2026-08-09 10:00:00'),
('premium.ben@xlibertine.com', 'Ben_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-07-22', 'homme', 'heterosexuelle', 'Lyon', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-02 10:00:00', '2026-08-09 10:00:00'),
('premium.clara@xlibertine.com', 'Clara_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1996-11-10', 'femme', 'lesbienne', 'Bordeaux', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-03 10:00:00', '2026-08-09 10:00:00'),
('premium.daniel@xlibertine.com', 'Daniel_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1991-02-05', 'homme', 'bisexuelle', 'Côte d\'Azur', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-04 10:00:00', '2026-08-09 10:00:00'),
('premium.eva@xlibertine.com', 'Eva_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1995-06-18', 'femme', 'heterosexuelle', 'Bruxelas', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-05 10:00:00', '2026-08-09 10:00:00'),
('premium.felix@xlibertine.com', 'Felix_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1988-09-30', 'homme', 'heterosexuelle', 'Luxembourg', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-06 10:00:00', '2026-08-09 10:00:00'),
('premium.gina@xlibertine.com', 'Gina_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1994-01-25', 'femme', 'bisexuelle', 'Paris', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-07 10:00:00', '2026-08-09 10:00:00'),
('premium.harry@xlibertine.com', 'Harry_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1989-04-12', 'homme', 'bisexuelle', 'Lyon', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-08 10:00:00', '2026-08-09 10:00:00'),
('premium.iris@xlibertine.com', 'Iris_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1997-07-08', 'femme', 'lesbienne', 'Bordeaux', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-09 10:00:00', '2026-08-09 10:00:00'),
('premium.josh@xlibertine.com', 'Josh_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1992-10-20', 'homme', 'heterosexuelle', 'Côte d\'Azur', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-10 10:00:00', '2026-08-09 10:00:00'),
('premium.kira@xlibertine.com', 'Kira_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1995-11-11', 'femme', 'bisexuelle', 'Bruxelas', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-11 10:00:00', '2026-08-09 10:00:00'),
('premium.lucas@xlibertine.com', 'Lucas_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-03-16', 'homme', 'bisexuelle', 'Luxembourg', 'PASS_EPICURIEN', '2026-11-09 23:59:59', true, '2026-05-12 10:00:00', '2026-08-09 10:00:00'),

-- PREMIUM mensuel (10 utilizadores)
('premium.maya@xlibertine.com', 'Maya_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1998-05-27', 'femme', 'lesbienne', 'Paris', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-09 10:00:00', '2026-08-09 10:00:00'),
('premium.nathan@xlibertine.com', 'Nathan_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1991-08-31', 'homme', 'heterosexuelle', 'Lyon', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-10 10:00:00', '2026-08-09 10:00:00'),
('premium.osha@xlibertine.com', 'Osha_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1996-09-13', 'femme', 'bisexuelle', 'Bordeaux', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-11 10:00:00', '2026-08-09 10:00:00'),
('premium.paul@xlibertine.com', 'Paul_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1992-12-02', 'homme', 'bisexuelle', 'Côte d\'Azur', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-12 10:00:00', '2026-08-09 10:00:00'),
('premium.quinn@xlibertine.com', 'Quinn_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1997-01-19', 'femme', 'lesbienne', 'Bruxelas', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-13 10:00:00', '2026-08-09 10:00:00'),
('premium.rosa@xlibertine.com', 'Rosa_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1994-04-06', 'femme', 'bisexuelle', 'Luxembourg', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-14 10:00:00', '2026-08-09 10:00:00'),
('premium.sergio@xlibertine.com', 'Sergio_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1989-07-23', 'homme', 'heterosexuelle', 'Paris', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-15 10:00:00', '2026-08-09 10:00:00'),
('premium.tina@xlibertine.com', 'Tina_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1995-10-14', 'femme', 'lesbienne', 'Lyon', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-16 10:00:00', '2026-08-09 10:00:00'),
('premium.ugo@xlibertine.com', 'Ugo_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1993-02-28', 'homme', 'bisexuelle', 'Bordeaux', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-17 10:00:00', '2026-08-09 10:00:00'),
('premium.vera@xlibertine.com', 'Vera_Premiummensuel', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-06-09', 'femme', 'heterosexuelle', 'Côte d\'Azur', 'PASS_PRIVILEGE', '2027-08-09 23:59:59', true, '2025-08-18 10:00:00', '2026-08-09 10:00:00'),

-- VIP mensuel (3 utilizadores)
('premium.walter@xlibertine.com', 'Walter_VIP', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1985-11-21', 'homme', 'heterosexuelle', 'Bruxelas', 'PASS_VIP', '2028-08-09 23:59:59', true, '2024-08-09 10:00:00', '2026-08-09 10:00:00'),
('premium.xenia@xlibertine.com', 'Xenia_VIP', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1987-03-17', 'femme', 'bisexuelle', 'Luxembourg', 'PASS_VIP', '2028-08-09 23:59:59', true, '2024-08-10 10:00:00', '2026-08-09 10:00:00'),
('premium.yuri@xlibertine.com', 'Yuri_VIP', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1986-08-03', 'homme', 'bisexuelle', 'Paris', 'PASS_VIP', '2028-08-09 23:59:59', true, '2024-08-11 10:00:00', '2026-08-09 10:00:00');

-- ==========================================
-- RESULTADO
-- ==========================================
-- Total: 53 utilizadores
-- - 3 Agentes (PASS_VIP - Admins)
-- - 25 FREE
-- - 12 PASS_EPICURIEN
-- - 10 PASS_PRIVILEGE
-- - 3 PASS_VIP (Clientes Premium)
--
-- PASSWORDS: Todos têm "TestPass123"
-- LOGIN: email ou username + TestPass123
-- ==========================================
