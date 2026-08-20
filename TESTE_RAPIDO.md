# ⚡ TESTE RÁPIDO - 3 PASSOS

## 1️⃣ ABRIR SUPABASE

```
https://app.supabase.com
→ Projeto mfchfnsekoluicxnguoh
→ SQL Editor
→ New Query
```

## 2️⃣ COPIAR ESTE SQL

```sql
-- Agentes (3)
INSERT INTO users (email, username, hashedMot de passe, dateOfBirth, gender, sexualOrientation, location, abonnementTier, abonnementEnd, isVerified, createdAt, updatedAt) VALUES
('agent.marie@xlibertine.com', 'Marie_Agent', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1990-03-15', 'femme', 'bisexuelle', 'Paris', 'PASS_VIP', '2027-08-09 23:59:59', true, '2026-01-01 08:00:00', '2026-08-09 10:00:00'),
('agent.pierre@xlibertine.com', 'Pierre_Agent', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1988-07-20', 'homme', 'heterosexuelle', 'Lyon', 'PASS_VIP', '2027-08-09 23:59:59', true, '2026-01-01 09:00:00', '2026-08-09 10:00:00'),
('agent.sophie@xlibertine.com', 'Sophie_Agent', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/nP2', '1992-11-10', 'femme', 'lesbienne', 'Bordeaux', 'PASS_VIP', '2027-08-09 23:59:59', true, '2026-01-01 10:00:00', '2026-08-09 10:00:00');
```

**Ou copiar tudo de TESTE_USUARIOS.sql**

## 3️⃣ EXECUTAR

```
1. Clica no SQL
2. Clica "Run" (azul)
3. Aguarda 2-3 segundos
4. Pronto! ✅
```

---

## 🧪 TESTAR LOGIN

**Email:** `agent.marie@xlibertine.com`  
**Mot de passe:** `TestPass123`

---

**Cada utilisateur tem mot de passe:** `TestPass123`

Ver lista completa em: `TESTE_USUARIOS_GUIA.md`
