# 🚀 GUIA COMPLETO - Deploy RencontresPremium.fr no Hostinger

**Site atual**: https://darkcyan-hare-728045.hostingersite.com  
**Status**: ✅ Compilado, ⏳ Awaiting Configuration

---

## 📋 PASSO 1: Gerar NEXTAUTH_SECRET

Execute no seu terminal:

```bash
openssl rand -base64 32
```

**Exemplo de saída**:
```
X5k9JkL2m9Qp3R4sT5u6V7w8X9yZaBbCdDeEfFgGhH==
```

✅ **Guarde este valor** - vai precisar no próximo passo

---

## 🔧 PASSO 2: Configurar Variáveis de Ambiente no Hostinger

1. Aceda ao **painel Hostinger**
2. Navegue até **Application → Environment Variables**
3. **Adicione as seguintes variáveis** (copie e cole exatamente):

### Obrigatórias ⭐

| Variável | Valor |
|----------|-------|
| `NEXTAUTH_URL` | `https://darkcyan-hare-728045.hostingersite.com` |
| `NEXTAUTH_SECRET` | (Cole o valor gerado acima) |
| `DATABASE_URL` | `postgresql://user:pass@localhost:5432/db` |
| `NODE_ENV` | `production` |

### Recomendadas (copie/colar)

```
STRIPE_PUBLIC_KEY=pk_test_fake
STRIPE_SECRET_KEY=sk_test_fake
STRIPE_WEBHOOK_SECRET=whsec_test_fake
```

### Opcionais (pode deixar vazias)

```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

---

## 💾 PASSO 3: Configurar Base de Dados

### Opção A: PostgreSQL (Recomendado)

Se o seu plano Hostinger inclui PostgreSQL:

1. No painel Hostinger → **Databases**
2. **Create Database** ou use uma existente
3. Copie a `DATABASE_URL` completa
4. Cole em `Environment Variables` (PASSO 2)

**Formato esperado**:
```
postgresql://username:password@host:5432/database_name
```

### Opção B: MySQL (Se PostgreSQL não disponível)

Se só tem MySQL:

1. Edite `prisma/schema.prisma`:
   ```typescript
   datasource db {
     provider = "mysql"  // ← mude de postgresql
     url      = env("DATABASE_URL")
   }
   ```

2. Faça push desta mudança:
   ```bash
   git add prisma/schema.prisma
   git commit -m "Change: database provider to MySQL"
   git push
   ```

3. Hostinger fará redeploy automaticamente

---

## ✅ PASSO 4: Verificar Configuração

1. Aceda a: `https://darkcyan-hare-728045.hostingersite.com/api/health`

2. Deve ver uma página HTML com:
   ```
   ✅ NEXTAUTH_URL: definida
   ✅ NEXTAUTH_SECRET: definida
   ✅ DATABASE_URL: definida (ligação OK)
   ✅ NODE_ENV: production
   ```

Se vir ❌ em alguma variável:
- Volte ao PASSO 2
- Verifique a digitação exatamente
- Clique "Redeploy" após salvar variáveis

---

## 🗄️ PASSO 5: Executar Migrations (Criar Tabelas)

Quando tudo estiver configurado:

### Via Terminal (SSH)

```bash
ssh seu_username@seu_host

# Dentro do diretório do projeto:
npx prisma migrate deploy

# Popular com dados de teste (opcional):
npm run prisma:seed
```

### Se Não Tem Acesso SSH

Contacte suporte Hostinger para executar o comando acima.

---

## 🧪 PASSO 6: Testar o Site

### Homepage

Visite: https://darkcyan-hare-728045.hostingersite.com

Deve ver:
- ✅ Logo "RP" (RencontresPremium)
- ✅ Navbar com Login/Register
- ✅ Hero section com cores roxas/rosa
- ✅ Seção "Features" com 6 benefícios
- ✅ "Subscription Plans" com 4 planos
- ✅ Testimonials com avatares
- ✅ Footer com links legais

### Login

Teste com conta padrão:
```
Email: admin@test.fr
Password: Test1234!
```

Se não existir, registar uma nova conta.

### Registo

1. Clique "S'INSCRIRE"
2. Preencha:
   - Email: seu_email@test.com
   - Password: Test1234! (mín 8 chars)
   - Confirmar password
   - Aceitar termos
3. Clique "Suivant"
4. Preencha:
   - Data de nascimento (18+)
   - Tipo de perfil (Homme/Femme/Couple)
   - Orientação sexual
5. Clique "Créer le compte"

**Resultado esperado**:
- ✅ Conta criada
- ✅ Login automático
- ✅ Redirecionado para `/decouvrir`

---

## 🔴 TROUBLESHOOTING

### ❌ "Cannot GET /"

**Causa**: Variáveis não definidas

**Fix**:
1. Hostinger → Environment Variables
2. Verifique cada variável
3. Clique "Redeploy"
4. Aguarde 2-3 minutos

---

### ❌ "NEXTAUTH_SECRET is not defined"

**Fix**:
```bash
openssl rand -base64 32  # Gera novo
# Cole em Environment Variables
```

---

### ❌ "Database connection refused"

**Causa**: DATABASE_URL errada ou BD não ligada

**Fix**:
1. Hostinger → Databases
2. Verifique credenciais
3. Teste conexão (às vezes demora 5 min)
4. Atualize Environment Variables
5. Redeploy

---

### ❌ "Registo não envia email"

**Esperado** até configurar SMTP

Para ativar:
1. Gere credenciais Hostinger SMTP
2. Defina em Environment Variables:
   ```
   SMTP_HOST=smtp.hostinger.com
   SMTP_PORT=465
   SMTP_USER=seu_email@dominio
   SMTP_PASSWORD=password
   ```
3. Redeploy

---

## 📊 Checklist Final

- [ ] NEXTAUTH_SECRET gerado
- [ ] DATABASE_URL definida
- [ ] Variáveis salvas no Hostinger
- [ ] /api/health mostra ✅ em tudo
- [ ] Redeploy executado
- [ ] Migrations criadas
- [ ] Homepage carrega
- [ ] Login funciona
- [ ] Registo funciona
- [ ] Console sem erros (F12)

---

## 🎉 Parabéns!

Se tudo funcionar, o site está **PRONTO PARA PRODUÇÃO**! 🚀

---

## 📞 Contactos Úteis

- **Suporte Hostinger**: https://hostinger.com/support
- **Documentação Next.js**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs/

---

**Última atualização**: 2026-07-26  
**Projeto**: RencontresPremium.fr  
**Version**: 1.0.0
