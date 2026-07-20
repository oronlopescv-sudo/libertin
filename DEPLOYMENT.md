# 🚀 DEPLOYMENT CHECKLIST - RencontresPremium.fr

## ✅ PRÉ-DEPLOYMENT (5 minutos)

- [ ] **SSH no VPS e criar BD**
  ```bash
  ssh u128759105@109.123.248.221
  sudo systemctl start postgresql
  sudo -u postgres psql
  
  CREATE DATABASE rencontres_premium;
  CREATE USER u128759105 WITH PASSWORD 'SUA_PASSWORD_AQUI';
  GRANT ALL PRIVILEGES ON DATABASE rencontres_premium TO u128759105;
  \q
  
  # Verifica conexão
  psql postgresql://u128759105:SUA_PASSWORD@localhost:5432/rencontres_premium -c "SELECT 1"
  ```

- [ ] **Gerar NEXTAUTH_SECRET**
  ```bash
  openssl rand -base64 32
  # Resultado: algo como "X5k9JkL2m9Qp3R4sT5u6V7w8X9yZaBbCdDeEfFgGhH=="
  # Guarda este valor!
  ```

---

## ✅ EASYPANEL CONFIGURATION (10 minutos)

### 1. Acede ao Easypanel
- URL: http://109.123.248.221:3000
- Username: u128759105
- Password: (a tua)

### 2. New Application → Docker

| Campo | Valor |
|-------|-------|
| Name | `libertin` |
| Port | `3000` |
| Repository | `https://github.com/oronlopescv-sudo/libertin.git` |
| Branch | `main` |
| Build Command | `npm install --legacy-peer-deps && npm run build` |
| Start Command | `node .next/standalone/server.js` |
| Keep Running | ✅ YES |

### 3. Environment Variables

**CLICA "Add Variable" para cada uma:**

```
DATABASE_URL = postgresql://u128759105:SUA_PASSWORD@localhost:5432/rencontres_premium

NEXTAUTH_URL = https://rencontres-premium.fr

NEXTAUTH_SECRET = (o valor gerado acima)

STRIPE_PUBLIC_KEY = pk_test_fake

STRIPE_SECRET_KEY = sk_test_fake

STRIPE_WEBHOOK_SECRET = whsec_test_fake

NODE_ENV = production

ADMIN_EMAIL = admin@rencontres-premium.fr
```

### 4. Storage/Volumes

```
Source Path:  /app/public/uploads
Host Path:    /home/u128759105/libertin-uploads
```

### 5. Domain

```
Domain:   rencontres-premium.fr
Auto SSL: ✅ Enabled
```

### 6. Deploy!

Clica o botão verde **"Create & Deploy"**

Espera ~5-10 minutos para build terminar.

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY (5 minutos)

### 1. Verifica Logs em Easypanel

App "libertin" → "View Logs" → procura por:

```
✅ "npm install --legacy-peer-deps" PASSOU
✅ "npm run build" PASSOU
✅ "Ready" ou "listening on port 3000"
❌ Se vires ERROR, copia a mensagem completa
```

### 2. Acede ao Site

```
https://rencontres-premium.fr
```

Deve aparecer:
- ✅ Hero section roxo/rosa
- ✅ "Bienvenue sur le 1er réseau social libertinge..."
- ✅ Proporções 78% mulheres/casais, 22% homens
- ✅ Botão "JE M'INSCRIS GRATUITEMENT"

### 3. Testa Login com Conta Teste

```
Email:    alice@test.fr
Password: Test1234!

Deve redirecionar para /decouvrir
```

### 4. Testa Registo

```
Email: novo@test.fr
Password: Test1234!
Gender: Femme
```

---

## 🔴 SE ALGO NÃO FUNCIONAR

### ❌ Erro: "Cannot GET /"

**Diagnóstico:**
- Easypanel → View Logs
- Procura por "ERROR" ou "failed"
- Copia a mensagem de erro completa

**Causa comum:**
- DATABASE_URL está errada
- NEXTAUTH_SECRET está vazio
- npm build falhou

---

### ❌ Erro: "Connection refused" (Database)

**Testa a conexão:**
```bash
ssh u128759105@109.123.248.221
psql postgresql://u128759105:SUA_PASSWORD@localhost:5432/rencontres_premium

# Se der erro, PostgreSQL não está rodando
sudo systemctl restart postgresql
```

---

### ❌ Erro: "NEXTAUTH_SECRET is not defined"

**Fix:**
```bash
openssl rand -base64 32  # Gera novo valor

# Adiciona em Easypanel:
# Environment Variables → Add Variable
# NEXTAUTH_SECRET = (o valor)
# Redeploy
```

---

### ❌ Build muito lento (>15 minutos)

**Soluções:**
1. Aumenta RAM em Easypanel (mínimo 2GB)
2. Verifica se Docker tem espaço: `docker system df`
3. Se continuar lento, clear cache: App → "..." → "Clear Cache" → Redeploy

---

## 📊 Status Esperado

| Componente | Status | Como Verificar |
|-----------|--------|----------------|
| Site | 🟢 Online | https://rencontres-premium.fr |
| HTTPS | 🟢 Ativo | Lock 🔒 no navegador |
| Database | 🟢 Conectado | Login funciona |
| Auth | 🟢 Working | alice@test.fr / Test1234! |
| Stripe | 🟡 Teste | Checkout mostra sk_test_... |

---

## 🎉 Se Tudo Funciona

```
✅ Site está online
✅ Login funciona
✅ Registo funciona
✅ Database conectada
✅ HTTPS ativo
✅ Pronto para produção!
```

---

## 📞 Próximas Steps

1. **Emails**: Setup SendGrid para emails reais (registo, reset password)
2. **Stripe**: Ativa produção com chaves reais
3. **Admin Dashboard**: Criar painel para aprovar fotos
4. **Analytics**: Google Analytics ou Plausible
5. **Backup**: Configurar backups automáticos da BD

---

**Checklist completo = Site funcional!** 🚀
