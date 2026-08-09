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
SUPABASE_SERVICE_ROLE_KEY=sb_secret_cygq9idx0_yFtcXd7_T3FQ_56YbevHn

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
│   │   │   ├── forgot-password/route.ts    ← POST /api/auth/forgot-password
│   │   │   └── reset-password/route.ts     ← POST /api/auth/reset-password
│   │   ├── groups/
│   │   ├── messages/
│   │   ├── payments/
│   │   └── users/
│   ├── (pages)
│   │   ├── page.tsx                        ← Homepage
│   │   ├── register/page.tsx               ← Registo (2-step form)
│   │   ├── login/page.tsx                  ← Login
│   │   ├── profil/page.tsx                 ← Perfil (protegido)
│   │   ├── forgot-password/page.tsx        ← Reset password request
│   │   ├── reset-password/page.tsx         ← Reset password (com token)
│   │   ├── decouvrir/page.tsx              ← Ver perfis
│   │   ├── groupes/page.tsx                ← Grupos
│   │   ├── abonnements/page.tsx            ← Planos
│   │   ├── admin/page.tsx                  ← Admin panel
│   │   └── chat/[groupId]/page.tsx         ← Chat
│   └── layout.tsx                          ← Root layout
│
├── components/
│   ├── navbar.tsx
│   ├── footer.tsx
│   ├── register-form.tsx
│   ├── login-form.tsx
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   ├── subscription-plans.tsx
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
│   └── geo.ts                             ← Cidades e coordenadas
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
└── RESEND_COMPLETE.md                    ← Documentação Resend
```

---

## 🗄️ SCHEMA SUPABASE

### Tabelas Principais
```sql
-- users (com RLS)
id UUID PRIMARY KEY
email VARCHAR UNIQUE
username VARCHAR
hashedPassword VARCHAR
dateOfBirth DATE
gender VARCHAR (couple, femme, homme)
sexualOrientation VARCHAR
location VARCHAR
subscriptionTier VARCHAR (FREE, PREMIUM_3M, PREMIUM_12M, VIP_24M)
subscriptionEnd TIMESTAMP
isVerified BOOLEAN
createdAt TIMESTAMP
updatedAt TIMESTAMP

-- password_resets (com RLS - bloqueado para anon)
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

-- photos, verification_photos, subscriptions, likes, blocked_users, etc.
```

### RLS Policies Ativas
- `users`: Leitura pública, edição própria
- `password_resets`: Bloqueado anon, auth só own
- `pricing_plans`: Leitura pública
- Resto: Acesso restrito ao proprietário

---

## 🔐 FLUXOS DE AUTENTICAÇÃO

### 1. REGISTO
```typescript
// POST /api/auth/register
{
  email: "user@example.com",
  password: "SecurePass123",
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
  password: "SecurePass123"
}

// Retorna:
{
  success: true,
  user: { id: "...", email: "...", username: "..." },
  token: "eyJ..."
}

// Salva: localStorage + cookie auth_token (httpOnly, 7 dias)
// Redireciona: /profil
```

### 3. PASSWORD RECOVERY
```typescript
// Step 1: POST /api/auth/forgot-password
{ email: "user@example.com" }
// → Gera token, envia email com link

// Step 2: User clica link no email
// → Vai para /reset-password?token=xxx&email=yyy

// Step 3: POST /api/auth/reset-password
{
  token: "abc123...",
  email: "user@example.com",
  newPassword: "NewPass456"
}
// → Valida token, atualiza password, marca como usado
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

# Editar .env.local com:
NEXT_PUBLIC_SUPABASE_URL=https://mfchfnsekoluicxnguoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_cygq9idx0_yFtcXd7_T3FQ_56YbevHn

RESEND_API_KEY=re_test_key (opcional em dev)
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
git commit -m "feat: descrição"

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
  -d '{"email":"test@example.com","password":"Test12345",...}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345"}'

# Forgot Password
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 📋 TAREFAS PENDENTES

### P0 (Crítico - Produção)
- [ ] Configurar Resend API Key
- [ ] Testar password recovery em produção
- [ ] Integrar Stripe (APIs + webhooks + payment forms)
- [ ] Setup de domínio de email Resend (DNS)
- [ ] Monitorar logs de produção

### P1 (Alto - Semana 1)
- [ ] Email verification (opcional)
- [ ] 2FA/MFA (opcional)
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
  - Validade: 90 dias
  - Guardar em `.gitignore` (nunca commitar)

### Supabase
- Project: `mfchfnsekoluicxnguoh`
- Anon Key: (visto acima - já commitada, considerar rotar)
- Service Role: (visto acima - commitada também)
- ⚠️ **Ação:** Rotar chaves se expustas

### Resend
- Gerar em: https://resend.com/api-keys
- Formato: `re_xxxxxx`
- Guardar em `.env.production` (Hostinger panel)

### Hostinger
- Panel: https://hpanel.hostinger.com
- SSH: `u128759105@109.123.248.221`
- FTP: `u128759105.olive-bee-890047.hostingersite.com`

---

## ✅ CHECKLIST PRÉ-DEPLOY

Antes de fazer push para produção:

```
[ ] npm run build → sem erros
[ ] Todas as variáveis .env configuradas
[ ] RLS ativo em todas as tabelas Supabase
[ ] Resend API key válida
[ ] Testar em localhost:
    [ ] Registo novo user
    [ ] Login com novo user
    [ ] Aceder /profil
    [ ] Logout
    [ ] Password recovery workflow
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
4. **RESEND_COMPLETE.md** - Password recovery em detalhe

---

## 🎯 PRÓXIMO ENGENHEIRO A PEGAR

**Stripe Integration** (deixado propositalmente para o fim)

Ficheiros a criar:
- `/app/api/payments/create-checkout/route.ts`
- `/app/api/payments/webhook/route.ts`
- `/components/payment-modal.tsx`
- `/lib/stripe.ts`

Usar docs: https://stripe.com/docs/billing/subscriptions

---

**Documento criado:** 09/08/2026  
**Versão:** 1.0  
**Próxima revisão:** Após Stripe integration

Boa sorte! 🚀
