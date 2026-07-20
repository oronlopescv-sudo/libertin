# 🔥 RencontresPremium.fr - Site de Encontros Libertines

Site de encontros premium para adultos com modelo de negócio inspirado no Libertic.
**Mulheres e casais: acesso GRÁTIS total | Homens: Premium obrigatório.**

---

## 🚀 Stack Técnico

- **Frontend/Backend**: Next.js 14 + React 19 RC + TypeScript
- **Styling**: Tailwind CSS 3.4 + PostCSS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials + Google OAuth)
- **Payments**: Stripe
- **Deployment**: Docker via Easypanel

---

## 📋 Pré-requisitos

- VPS com Docker (Easypanel)
- PostgreSQL instalado
- Domínio apontado para VPS

---

## 🔧 Deployment (Easypanel)

### PASSO 1: Base de Dados

**SSH no VPS:**
```bash
ssh u128759105@109.123.248.221

# Instala PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Cria BD
sudo -u postgres psql

# Dentro do psql:
CREATE DATABASE rencontres_premium;
CREATE USER u128759105 WITH PASSWORD 'TUA_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE rencontres_premium TO u128759105;
\q

# Verifica
psql postgresql://u128759105:PASSWORD@localhost:5432/rencontres_premium -c "SELECT 1"
```

### PASSO 2: Easypanel - New Application

**URL**: http://109.123.248.221:3000

```
Name:             libertin
Port:             3000
Repository:       https://github.com/oronlopescv-sudo/libertin.git
Branch:           main
Build Command:    npm install --legacy-peer-deps && npm run build
Start Command:    node .next/standalone/server.js
Keep Running:     ✅ YES
```

### PASSO 3: Environment Variables

```
DATABASE_URL          = postgresql://u128759105:PASSWORD@localhost:5432/rencontres_premium
NEXTAUTH_URL          = https://rencontres-premium.fr
NEXTAUTH_SECRET       = (openssl rand -base64 32)
STRIPE_PUBLIC_KEY     = pk_test_...
STRIPE_SECRET_KEY     = sk_test_...
STRIPE_WEBHOOK_SECRET = whsec_test_...
NODE_ENV              = production
ADMIN_EMAIL           = admin@rencontres-premium.fr
```

### PASSO 4: Storage

```
Source: /app/public/uploads
Target: /home/u128759105/libertin-uploads
```

### PASSO 5: Domain

```
Domain: rencontres-premium.fr
Auto SSL: ✅
```

---

## ✅ Verificar

```
https://rencontres-premium.fr
```

**Contas teste:**
- alice@test.fr / Test1234! (Femme - acesso total)
- couple@test.fr / Test1234! (Couple - acesso total)
- free@test.fr / Test1234! (Homme - sem acesso)

---

## 🐛 Troubleshooting

### Build falhou?
- View Logs → procura por "ERROR"
- Verifica DATABASE_URL
- Verifica NEXTAUTH_SECRET

### Connection refused?
```bash
sudo systemctl start postgresql
psql postgresql://u128759105:PASSWORD@localhost:5432/rencontres_premium
```

### Falta variável env?
```bash
openssl rand -base64 32  # gera NEXTAUTH_SECRET
```

---

## 📊 Plans

| Plan | Users | Price | Duration |
|------|-------|-------|----------|
| FREE | Femmes + Couples | €0 | ∞ |
| PREMIUM | Hommes | €16-70 | 3-24 months |

---

**Pronto para production!** 🚀
