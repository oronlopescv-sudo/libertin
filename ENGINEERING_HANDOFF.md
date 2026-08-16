# 🔧 HANDOFF TÉCNICO - xlibertine.com
**Data:** 09 de Agosto de 2026  
**Versão:** 1.0  
**Status:** Pronto para Produção (exceto Stripe)  
**Commits:** 75ce7f0 (HEAD)

---

## 👨‍💼 INFORMAÇÃO CRÍTICA PARA ENGENHEIROS

### REPOSITÓRIO
```
GitHub: https://github.com/oronlopescv-sudo/libertin
Branch: main (production)
Clone: git clone https://github.com/oronlopescv-sudo/libertin.git
```

### STACK TÉCNICO
```
Frontend:     Next.js 15, React 19, TypeScript, Tailwind CSS
Backend:      Next.js Route Handlers, Node.js
Database:     Supabase (PostgreSQL) com RLS
Auth:         JWT + bcryptjs + httpOnly cookies
Email:        Resend API
Payments:     Stripe (NÃO FEITO - deixado para fim)
Hosting:      Hostinger (Shared Hosting + VPS)
```

### VARIÁVEIS CRÍTICAS
```env
# SUPABASE (CONFIGURADO)
NEXT_PUBLIC_SUPABASE_URL=https://mfchfnsekoluicxnguoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<retirado do repositório — ver painel Supabase>

# RESEND (PRECISA CONFIGURAR)
RESEND_API_KEY=re_YOUR_KEY_HERE
NEXT_PUBLIC_BASE_URL=https://xlibertine.com

# HOSTINGER
NODE_ENV=production
```

---

## 📁 ESTRUTURA DO PROJETO

```
libertin/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts          ← POST /api/auth/register
│   │   │   ├── login/route.ts              ← POST /api/auth/login
│   │   │   ├── logout/route.ts             ← POST /api/auth/logout
│   │   │   ├── forgot-mot de passe/route.ts    ← POST /api/auth/forgot-mot de passe
│   │   │   └── réinitialisation-mot de passe/route.ts     ← POST /api/auth/réinitialisation-mot de passe
│   │   ├── groups/
│   │   ├── messages/
│   │   ├── payments/
│   │   └── users/
│   ├── (pages)
│   │   ├── page.tsx                        ← Homepage
│   │   ├── register/page.tsx               ← Registo (2-step form)
│   │   ├── login/page.tsx                  ← Login
│   │   ├── profil/page.tsx                 ← Profil (protegido)
│   │   ├── forgot-mot de passe/page.tsx        ← Reset mot de passe request
│   │   ├── réinitialisation-mot de passe/page.tsx         ← Reset mot de passe (com token)
│   │   ├── decouvrir/page.tsx              ← Ver perfis
│   │   ├── groupes/page.tsx                ← Groupes
│   │   ├── abonnements/page.tsx            ← Plans
│   │   ├── admin/page.tsx                  ← Admin panel
│   │   └── chat/[groupId]/page.tsx         ← Chat
│   └── layout.tsx                          ← Root layout
│
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── register-form.tsx
│   ├── login-form.tsx
│   ├── forgot-mot de passe-form.tsx
│   ├── réinitialisation-mot de passe-form.tsx
│   ├── abonnement-plans.tsx
│   ├── profile-card.tsx
│   ├── group-card.tsx
│   ├── event-card.tsx
│   └── chat-box.tsx
│
├── context/
│   └── auth-context.tsx                   ← AuthProvider (FUNCIONANDO)
│
├── lib/
│   ├── supabase.ts                        ← Supabase client
│   ├── types.ts                           ← TypeScript interfaces
│   └── geo.ts                             ← Villes e coordenadas
│
├── middleware.ts                          ← Proteção de rotas
│
├── public/
│   └── (assets)
│
├── supabase/
│   └── migrations/
│       └── 000_full_schema.sql            ← Schema completo
│
├── .env.example                           ← Template variáveis
├── .env.local                             ← Dev (NÃO COMMITAR)
├── .env.production                        ← Prod (NÃO COMMITAR)
├── middleware.ts
│
├── AUDIT_REPORT_2026-08-09.md            ← Audit com 30 issues
├── TEST_REPORT_2026-08-09.md             ← Testes
├── FIXES_COMPLETED.md                    ← O que foi feito
├── RESEND_SETUP.md                       ← Setup Resend
└── RESEND_COMPLETE.md                    ← Documentaction Resend
```

---

## 🗄️ SCHEMA SUPABASE

### Tabelas Principais
```sql
-- users (com RLS)
id UUID PRIMARY KEY
email VARCHAR UNIQUE
username VARCHAR
hashedMot de passe VARCHAR
dateOfBirth DATE
gender VARCHAR (couple, femme, homme)
sexualOrientation VARCHAR
location VARCHAR
abonnementTier VARCHAR (FREE, PREMIUM_3M, PREMIUM_12M, VIP_24M)
abonnementEnd TIMESTAMP
isVerified BOOLEAN
createdAt TIMESTAMP
updatedAt TIMESTAMP

-- mot de passe_réinitialisations (com RLS - bloqueado para ann)
id UUID PRIMARY KEY
userId UUID FK users
token VARCHAR UNIQUE (SHA256 hash)
expiresAt TIMESTAMP
used BOOLEAN
createdAt TIMESTAMP

-- groups (com RLS)
id UUID PRIMARY KEY
name VARCHAR
description TEXT
creatorId UUID FK users
isPrivate BOOLEAN
maxMembers INTEGER
category VARCHAR
isActive BOOLEAN
createdAt TIMESTAMP
updatedAt TIMESTAMP

-- messages (com RLS)
id UUID PRIMARY KEY
groupId UUID FK groups
userId UUID FK users
content TEXT
createdAt TIMESTAMP

-- pricing_plans (com RLS)
id UUID PRIMARY KEY
name VARCHAR
price DECIMAL
currency VARCHAR
durationMonths INTEGER

-- photos, verification_photos, abonnements, likes, blocked_users, etc.
```

### RLS Policies Ativas
- `users`: Leitura pública, edição própria
- `mot de passe_réinitialisations`: Bloqué ann, auth só own
- `pricing_plans`: Leitura pública
- Resto: Acesso restrito ao proprietário

---

## 🔐 FLUXOS DE AUTENTICAÇÃO

### 1. REGISTO
```typescript
// POST /api/auth/register
{
  email: "user@example.com",
  mot de passe: "SecurePass123",
  username: "john_doe",
  dateOfBirth: "1995-05-15",
  gender: "homme",
  sexualOrientation: "bisexuelle",
  location: "Paris"
}

// Retorna:
{
  success: true,
  user: { id: "...", email: "...", username: "..." },
  token: "eyJ..." // Base64 JWT
}

// Salva: localStorage.setItem('auth_token', token)
// Redireciona: /profil
```

### 2. LOGIN
```typescript
// POST /api/auth/login
{
  email: "user@example.com",
  mot de passe: "SecurePass123"
}

// Retorna:
{
  success: true,
  user: { id: "...", email: "...", username: "..." },
  token: "eyJ..."
}

// Salva: localStorage + cookie auth_token (httpOnly, 7 jours)
// Redireciona: /profil
```

### 3. PASSWORD RECOVERY
```typescript
// Step 1: POST /api/auth/forgot-mot de passe
{ email: "user@example.com" }
// → Gera token, envoie email com link

// Step 2: User clica link no email
// → Vai para /réinitialisation-mot de passe?token=xxx&email=yyy

// Step 3: POST /api/auth/réinitialisation-mot de passe
{
  token: "abc123...",
  email: "user@example.com",
  newMot de passe: "NewPass456"
}
// → Valida token, atualiza mot de passe, marca como usado
```

### 4. ROTAS PROTEGIDAS
```typescript
// middleware.ts intercepta:
// /profil, /admin, /chat → requer auth_token cookie
// Se sem token: redireciona /login
```

---

## 📊 DADOS FAKE CRIADOS

36 perfis fake distribuídos por 6 cidades:
- **Paris:** 6 perfis
- **Lyon:** 6 perfis
- **Bordeaux:** 6 perfis
- **Côte d'Azur:** 6 perfis
- **Bruxelas:** 6 perfis
- **Luxembourg:** 6 perfis

Detalhes: username, email, age, gender, orientation, location

---

## 🚀 SETUP LOCAL (Desenvolvimento)

### 1. Clone e Install
```bash
git clone https://github.com/oronlopescv-sudo/libertin.git
cd libertin
npm install
```

### 2. Variáveis (.env.local)
```bash
# Copy from .env.example
cp .env.example .env.local

# Modifier .env.local com:
NEXT_PUBLIC_SUPABASE_URL=https://mfchfnsekoluicxnguoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=<retirado do repositório — ver painel Supabase>

RESEND_API_KEY=re_test_key (optionnel em dev)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run Dev
```bash
npm run dev
# Abre http://localhost:3000
```

### 4. Build & Test
```bash
npm run build
# Sem erros = pronto para deploy
```

---

## 📤 DEPLOYMENT (Hostinger)

### Via GitHub Push (Auto-Deploy)
```bash
# 1. Commit localmente
git add .
git commit -m "feat: description"

# 2. Push para main
git push origin main

# 3. Hostinger deteta push
# 4. Build automático (~2-3 min)
# 5. Deploy automático
```

### Verificar Deploy
```bash
# Painel Hostinger
→ Settings & Redeploy
→ Aba "Last deployment"
→ Commit hash deve ser o teu
→ Status: Success
```

### Se Build Falhar
1. Ver "Build log"
2. Ver erro específico
3. Corrigir localmente
4. Git push novamente

---

## 🐛 DEBUGGING

### Check Supabase Connection
```typescript
// app/debug/page.tsx
// Acessa: http://localhost:3000/debug
// Mostra status Supabase, auth, database
```

### Check Logs
```bash
# Dev
npm run dev
# Console mostra erros React + API

# Prod (Hostinger)
# Painel → Logs → Ver output do build
```

### Test APIs com curl
```bash
# Registo
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot de passe":"Test12345",...}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","mot de passe":"Test12345"}'

# Forgot Mot de passe
curl -X POST http://localhost:3000/api/auth/forgot-mot de passe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 📋 TAREFAS PENDENTES

### P0 (Crítico - Produção)
- [ ] Configurar Resend API Key
- [ ] Testar mot de passe recovery em produção
- [ ] Integrar Stripe (APIs + webhooks + payment forms)
- [ ] Setup de domínio de email Resend (DNS)
- [ ] Monitorar logs de produção

### P1 (Alto - Semana 1)
- [ ] Email verification (optionnel)
- [ ] 2FA/MFA (optionnel)
- [ ] OAuth (Google/Facebook)
- [ ] Admin dashboard completo
- [ ] Moderation tools
- [ ] User banning/blocking system

### P2 (Médio - Semana 2)
- [ ] Notificações em tempo real (WebSocket)
- [ ] Upload de fotos (Cloudinary)
- [ ] Photo verification system
- [ ] Relatórios e analytics
- [ ] Performance optimization
- [ ] SEO setup

### P3 (Baixo - Futuro)
- [ ] Mobile app (React Native)
- [ ] Live chat features
- [ ] Event booking system
- [ ] Payment invoices
- [ ] Email templates personalizadas

---

## 🔑 CREDENCIAIS & SECRETS

### GitHub
- Repo: `oronlopescv-sudo/libertin` (private)
- Token novo: **GERAR EM https://github.com/settings/tokens**
  - Escopo: `repo, workflow`
  - Validade: 90 jours
  - Enregistrer em `.gitignore` (nunca commitar)

### Supabase
- Project: `mfchfnsekoluicxnguoh`
- Anon Key: (visto acima - já commitada, considerar rotar)
- Service Role: (visto acima - commitada também)
- ⚠️ **Action:** Rotar chaves se expustas

### Resend
- Gerar em: https://resend.com/api-keys
- Formato: `re_xxxxxx`
- Enregistrer em `.env.production` (Hostinger panel)

### Hostinger
- Panel: https://hpanel.hostinger.com
- SSH: `u128759105@109.123.248.221`
- FTP: `u128759105.olive-bee-890047.hostingersite.com`

---

## ✅ CHECKLIST PRÉ-DEPLOY

Antes de fazer push para produção:

```
[ ] npm run build → sem erros
[ ] Toutes as variáveis .env configuradas
[ ] RLS ativo em todas as tabelas Supabase
[ ] Resend API key válida
[ ] Testar em localhost:
    [ ] Registo novo user
    [ ] Login com novo user
    [ ] Aceder /profil
    [ ] Logout
    [ ] Mot de passe recovery workflow
    [ ] Rotas protegidas redirecionam /login
[ ] Testes automatizados passando (se houver)
[ ] Sem console errors/warnings
[ ] Git status limpo (sem uncommitted files)
[ ] .env.local e .env.production não commitadas
[ ] Commit message descritiva
[ ] Push para branch correta (main)
```

---

## 📞 CONTACTOS & SUPORTE

### Code
- GitHub Issues: https://github.com/oronlopescv-sudo/libertin/issues
- Pull Requests: Criar branch feature, PR para main

### Infrastructure
- Hostinger Support: https://hpanel.hostinger.com/support
- Supabase Docs: https://supabase.com/docs
- Resend Docs: https://resend.com/docs

### Emergencies
- Production Down: Check Hostinger build logs
- Database Down: Check Supabase status
- Email Not Sending: Check Resend API, DNS setup

---

## 📚 DOCUMENTAÇÃO

Ler nesta ordem:
1. **FIXES_COMPLETED.md** - O que foi implementado
2. **AUDIT_REPORT_2026-08-09.md** - Issues encontradas
3. **TEST_REPORT_2026-08-09.md** - Testes feitos
4. **RESEND_COMPLETE.md** - Mot de passe recovery em detalhe

---

## 🎯 PRÓXIMO ENGENHEIRO A PEGAR

**Stripe Integration** (deixado propositalmente para o fim)

Ficheiros a criar:
- `/app/api/payments/create-checkout/route.ts`
- `/app/api/payments/webhook/route.ts`
- `/components/payment-modal.tsx`
- `/lib/stripe.ts`

Usar docs: https://stripe.com/docs/billing/abonnements

---

**Documento criado:** 09/08/2026  
**Versão:** 1.0  
**Próxima revisão:** Após Stripe integration

Boa sorte! 🚀
