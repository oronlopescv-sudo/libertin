# 🔴 RencontresPremium.fr

Site de encontros libertinagem premium em Next.js 14 - Para casais e solteiros com subscrição.

## 📋 Características

✅ Autenticação com JWT + NextAuth.js  
✅ Subscrições (FREE / PREMIUM 3M / 12M / 24M)  
✅ Pagamento com Stripe  
✅ Chat real-time com Socket.io  
✅ Descoberta de perfis com geolocalização  
✅ Grupos privados  
✅ Verificação de foto (AWS Rekognition)  
✅ Responsivo (mobile-first)  
✅ Francês completo  

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Redis (para Socket.io)

### Instalação Local

```bash
# 1. Clonar e instalar dependências
git clone <repo>
cd rencontres-premium
npm install

# 2. Configurar .env.local
cp .env.example .env.local
# Editar com suas credenciais

# 3. Configurar Base de Dados
npx prisma migrate dev --name init

# 4. Rodar desenvolvimento
npm run dev

# Homepage: http://localhost:3000
# Login: http://localhost:3000/login
# Register: http://localhost:3000/register
```

## 📦 Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Next.js 14, React 19, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **BD** | PostgreSQL + Prisma ORM |
| **Auth** | NextAuth.js + JWT |
| **Chat** | Socket.io + Redis adapter |
| **Pagamento** | Stripe (subscrições) |
| **Storage** | Supabase Storage (fotos) |
| **Email** | SendGrid (notificações) |

## 🗂️ Estrutura de Pastas

```
rencontres-premium/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── page.tsx                # Homepage
│   │   ├── (auth)/                 # Grupo autenticação
│   │   │   ├── register/page.tsx   # Registro 2-step
│   │   │   ├── login/page.tsx      # Login
│   │   │   └── verify-email/page.tsx
│   │   ├── (dashboard)/            # Grupo protegido
│   │   │   ├── decouvrir/          # Descobrir perfis (PREMIUM)
│   │   │   ├── groupes/            # Listar grupos
│   │   │   ├── chat/               # Chat real-time
│   │   │   └── abonnements/        # Gerir subscrições
│   │   └── api/
│   │       ├── auth/               # NextAuth routes
│   │       ├── users/              # User endpoints
│   │       ├── groups/             # Group endpoints
│   │       ├── messages/           # Chat endpoints
│   │       └── payments/           # Stripe webhooks
│   ├── components/
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── subscription-plans.tsx
│   │   └── ... outros componentes
│   ├── lib/
│   │   ├── prisma.ts               # Cliente Prisma
│   │   ├── stripe.ts               # Cliente Stripe
│   │   └── auth.ts                 # Funções auth
│   └── styles/
│       └── globals.css             # Tailwind + custom
├── prisma/
│   ├── schema.prisma               # Schema BD
│   └── migrations/                 # Migrações
├── .env.example                    # Variáveis exemplo
└── package.json
```

## 🔧 Configuração Essencial

### NextAuth (.env.local)

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
```

### Stripe

```env
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_test_..."
```

### Database

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/rencontres_premium"
```

## 📱 Modelo de Subscrição

| Plano | Preço | Benefícios |
|-------|-------|-----------|
| **FREE** | Grátis | Criar perfil, ver seu perfil |
| **PREMIUM 3M** | 16€ | Ver todos perfis, grupos, chat |
| **PREMIUM 12M** | 25€ | ⭐ Melhor valor (~2.08€/mês) |
| **PREMIUM 24M** | 70€ | Máximo economicamente (~2.92€/mês) |

## 🔐 Segurança

- [x] HTTPS obrigatório
- [x] CSRF protection
- [x] Rate limiting (100 req/min)
- [x] Password hashing com bcrypt
- [x] Validação no backend (nunca confiar client)
- [x] XSS protection (DOMPurify)
- [x] Foto verificação com AWS Rekognition

## 🚢 Deployment (VPS Contabo)

### 1. Preparar VPS

```bash
ssh root@109.123.248.221

# Instalar dependencies
apt update && apt install -y nodejs npm postgresql redis-server nginx

# Clone repo
git clone <repo> /app/rencontres-premium
cd /app/rencontres-premium
npm install
```

### 2. Variáveis de Ambiente

```bash
cp .env.example .env.production
# Editar com credenciais reais
source .env.production
```

### 3. Build e Deploy

```bash
# Build
npm run build

# Migrations
npx prisma migrate deploy

# PM2 para gerenciar processo
npm install -g pm2
pm2 start "npm start" --name "rencontres-premium"
pm2 save
pm2 startup
```

### 4. Nginx (Reverse Proxy)

```nginx
server {
    listen 443 ssl;
    server_name rencontres-premium.fr;
    
    ssl_certificate /etc/letsencrypt/live/rencontres-premium.fr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rencontres-premium.fr/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### 5. SSL (Let's Encrypt)

```bash
certbot certonly --standalone -d rencontres-premium.fr
```

## 🧪 Testes

```bash
# Unit tests
npm run test

# E2E tests (Playwright)
npm run test:e2e

# Load tests (k6)
k6 run tests/load.js
```

## 📊 Monitoring

- Sentry para erros
- DataDog para infraestrutura
- LogRocket para sessions
- Stripe Dashboard para pagamentos

## 🐛 Troubleshooting

**Erro: "DATABASE_URL não definida"**
```bash
# Verificar .env.local
echo $DATABASE_URL
```

**Socket.io não conecta**
```bash
# Verificar Redis
redis-cli ping
# Saída esperada: PONG
```

**Stripe webhook falha**
```bash
# Testar webhook localmente
stripe listen --forward-to localhost:3000/api/payments/webhook
stripe trigger charge.succeeded
```

## 📞 Suporte

- Email: support@rencontres-premium.fr
- Issues: GitHub Issues
- Documentação: `/docs`

## 📄 Licença

Proprietário - RencontresPremium.fr

## 🎯 Próximos Passos

- [ ] Ciclo 1: Build - Completar auth + Homepage
- [ ] Ciclo 2: Verify - E2E tests
- [ ] Ciclo 3: Fix - Correções de bugs
- [ ] Ciclo 4: Stress - Load tests
- [ ] Deploy - VPS + SSL + DNS
- [ ] Marketing - SEO + Social

---

**Versão**: 1.0.0  
**Última atualização**: Julho 2026  
**Status**: 🟡 Em desenvolvimento (Ciclo 1)
