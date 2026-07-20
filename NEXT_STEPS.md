# 🚀 PRÓXIMOS PASSOS - Ciclo 1: BUILD

## ✅ O que foi feito (Fase 1)

### Estrutura Base
- [x] Package.json com todas as dependências
- [x] Prisma schema com 9 entidades (User, Photo, Group, Message, etc)
- [x] Configuração Tailwind com paleta sensual
- [x] Tailwind config com cores personalizadas (rosa, roxo, coral)
- [x] PostCSS e Next.js config
- [x] TypeScript config
- [x] Ficheiros de ambiente (.env.example)

### Frontend
- [x] Layout raiz (app/layout.tsx) com Metadata
- [x] Homepage (app/page.tsx) com Hero + Features + Plans + Testimonials
- [x] Navbar responsiva com menu mobile
- [x] Footer com links legais
- [x] HeroSection com CTAs
- [x] Features (6 benefícios)
- [x] SubscriptionPlans (4 planos em grid responsivo)
- [x] Testimonials com avatares
- [x] Página de Registro (2-step form)
- [x] Página de Login
- [x] Componente Providers (NextAuth)
- [x] CSS global com animações

### API Routes
- [x] Base para rota /api/auth/register

### Documentação
- [x] README.md completo
- [x] Loop Engineering completo

---

## 🎯 Próximas Ações (Ordem Prioritária)

### PRIORITÁRIO 1: NextAuth Setup (8h)
```
Objetivo: Autenticação completa funcional

1. Criar /src/lib/prisma.ts (cliente Prisma singleton)
2. Criar /src/lib/auth.ts (NextAuth config)
3. Implementar /api/auth/[...nextauth]/route.ts
   - Providers: Credentials (email/password) + Google OAuth
   - Callbacks: jwt, session
4. Hash de passwords com bcryptjs
5. Testar login/logout

Ficheiros:
- src/lib/prisma.ts
- src/lib/auth.ts
- src/app/api/auth/[...nextauth]/route.ts
- Atualizar src/app/api/auth/register/route.ts
```

### PRIORITÁRIO 2: Base de Dados (6h)
```
Objetivo: Conectar PostgreSQL com Prisma

1. Criar .env.local com DATABASE_URL
2. Instalar PostgreSQL localmente OU usar Supabase
3. npx prisma migrate dev --name init
4. Verificar tabelas criadas
5. Seed de dados de teste (admin user, grupos)

Commands:
npx prisma migrate dev
npx prisma studio # Verificar dados
```

### PRIORITÁRIO 3: Página de Verificação de Email (4h)
```
Objetivo: Verificação obrigatória pós-registro

1. Criar src/app/(auth)/verify-email/page.tsx
2. Integrar SendGrid para enviar emails
3. Implementar /api/auth/verify-email (POST)
4. Link com token de 24h
5. Redirecionar após verificação

Ficheiros:
- src/app/(auth)/verify-email/page.tsx
- src/lib/email.ts (funções SendGrid)
- src/app/api/auth/verify-email/route.ts
```

### PRIORITÁRIO 4: Dashboard Protegido (8h)
```
Objetivo: Criar layout autenticado

1. Criar layout (dashboard)/layout.tsx com:
   - Navbar protegida
   - Sidebar menu
   - Logout button
2. Criar middleware para proteção (redirect não-autenticados)
3. Páginas stub:
   - (dashboard)/decouvrir/page.tsx
   - (dashboard)/groupes/page.tsx
   - (dashboard)/profil/page.tsx
   - (dashboard)/abonnements/page.tsx

Ficheiros:
- src/app/(dashboard)/layout.tsx
- src/middleware.ts
- src/app/(dashboard)/decouvrir/page.tsx
- src/app/(dashboard)/groupes/page.tsx
- src/app/(dashboard)/profil/page.tsx
- src/app/(dashboard)/abonnements/page.tsx
```

### PRIORIDADE 5: Stripe Integration (10h)
```
Objetivo: Pagamento de subscrições funcional

1. Criar /src/lib/stripe.ts (cliente Stripe)
2. Implementar /api/payments/create-checkout
   - Criar Stripe session
   - Redirecionar a checkout.stripe.com
3. Implementar /api/payments/webhook
   - Escutar charge.succeeded
   - Atualizar BD com subscriptionEnd
4. Testes com Stripe test keys
5. Testar fluxo completo (homepage → plano → checkout → webhook)

Ficheiros:
- src/lib/stripe.ts
- src/app/api/payments/create-checkout/route.ts
- src/app/api/payments/webhook/route.ts
- Atualizar src/components/subscription-plans.tsx
```

---

## 📝 Prompts para Claude (em ordem)

### Prompt 1: NextAuth Setup
```
Configurar NextAuth.js completo para site RencontresPremium:

1. Criar /src/lib/prisma.ts (singleton cliente Prisma)
2. Criar /src/lib/auth.ts com NextAuth config:
   - Provider: Credentials (email + password)
   - Provider: Google OAuth (callbacks, secret)
   - JWT strategy (7 dias, refresh token)
3. Criar /src/app/api/auth/[...nextauth]/route.ts
4. Atualizar /api/auth/register para:
   - Hash password com bcryptjs
   - Criar user no Prisma
   - Enviar email verificação
5. Implementar src/middleware.ts para proteção de rotas

ENTREGA: Código completo pronto para usar, testes de login/logout funcionando
```

### Prompt 2: Email Verification
```
Página de verificação de email com SendGrid:

1. Criar src/app/(auth)/verify-email/page.tsx
   - Input para código de verificação
   - Link direto também funciona
   - Countdown de reenvio (60s)
2. Criar /src/lib/email.ts com SendGrid
   - Função sendVerificationEmail()
   - Template HTML francês
3. Criar /api/auth/verify-email (POST)
   - Validar token
   - Atualizar user.isVerified = true
   - Destruir token expirado
4. Criar /api/auth/resend-verification (POST)
   - Resend email se solicitado
   - Throttle (1 req / min)

ENTREGA: Fluxo completo register → email → verificação → redirect login
```

### Prompt 3: Dashboard & Middleware
```
Dashboard protegido com autenticação:

1. Criar src/middleware.ts
   - Proteger rotas /(dashboard)/*
   - Redirecionar não-autenticados para /login
   - Usar NextAuth session
2. Criar src/app/(dashboard)/layout.tsx
   - Header com username + avatar
   - Sidebar navegação (mobile collapse)
   - Footer com info subscrição
   - Logout button
3. Criar 4 páginas stub:
   - decouvrir/page.tsx (descobrir perfis)
   - groupes/page.tsx (listar grupos)
   - profil/page.tsx (editar perfil)
   - abonnements/page.tsx (gerir subscrição)
4. Criar componentes:
   - DashboardNav
   - DashboardSidebar

ENTREGA: Dashboard responsivo, navegação funcional, proteção de rotas
```

### Prompt 4: Stripe Payments
```
Integração Stripe para subscrições rencontre:

1. Criar /src/lib/stripe.ts
   - Inicializar cliente Stripe
   - Funções: createCheckout(), updateSubscription()
2. Criar /api/payments/create-checkout (POST)
   - Receber tier (PREMIUM_3M/12M/24M)
   - Criar Stripe session
   - Salvar sessionId na BD
   - Redirecionar a checkout_url
3. Criar /api/payments/webhook (POST)
   - Validar signature Stripe
   - Escutar: charge.succeeded, invoice.payment_succeeded
   - Atualizar User.subscriptionEnd
   - Enviar email confirmação
   - Retry logic com exponential backoff
4. Criar componentes:
   - CheckoutButton
   - SubscriptionStatus
5. Testes com Stripe test keys

ENTREGA: Fluxo completo homepage → plano → checkout → confirmação em BD
```

---

## 🛠️ Setup Local Checklist

```bash
# 1. Instalar Node modules
npm install

# 2. PostgreSQL localmente OU Supabase
# Opção A: Local
brew install postgresql
createdb rencontres_premium

# Opção B: Supabase (recomendado)
# Ir a supabase.com, criar projeto, copiar DATABASE_URL

# 3. Configurar .env.local
cp .env.example .env.local
# Editar:
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
SENDGRID_API_KEY="SG...."

# 4. Prisma setup
npx prisma migrate dev --name init

# 5. Rodar dev
npm run dev

# 6. Testar homepage
# Abrir http://localhost:3000
```

---

## 📊 Ciclo 1: BUILD Estimativa

| Tarefa | Horas | Status |
|--------|-------|--------|
| NextAuth Setup | 8h | 🔴 TODO |
| Email Verification | 4h | 🔴 TODO |
| Dashboard Layout | 8h | 🔴 TODO |
| Stripe Integration | 10h | 🔴 TODO |
| Testes unitários | 6h | 🔴 TODO |
| **TOTAL** | **36h** | 🟡 Em progresso |

---

## 🎯 Success Criteria (Ciclo 1)

- [x] Homepage responsiva + planos visíveis
- [ ] Registro com email verification funcional
- [ ] Login com JWT + NextAuth funcional
- [ ] Dashboard protegido (middleware)
- [ ] Checkout Stripe funcional
- [ ] Webhook atualiza BD com subscrição
- [ ] Testes E2E para fluxo completo
- [ ] TypeScript sem erros
- [ ] Lighthouse score > 85

---

**Próxima ação**: Executar Prompt 1 (NextAuth Setup) 🚀
