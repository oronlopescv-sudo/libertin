# 🚀 ONBOARDING RÁPIDO - ENGENHEIROS

**Lê isto primeiro. Depois lê ENGINEERING_HANDOFF.md**

---

## ⚡ 5 MINUTOS DE SETUP

```bash
# 1. Clone
git clone https://github.com/oronlopescv-suo/libertin.git
cd libertin

# 2. Install
npm install

# 3. Setup .env.local (copy from .env.example)
cp .env.example .env.local
# Preenche variáveis Supabase (já dadas)

# 4. Run
npm run dev

# 5. Acede
# http://localhost:3000
```

**Pronto!** Site a rodar localmente.

---

## 🎯 ESTADO ATUAL (09/08/2026)

| Feature | Status | Quem faz |
|---------|--------|----------|
| Autenticação | ✅ COMPLETA | Feito |
| Password Recovery | ✅ COMPLETA (Resend) | Feito |
| Banco de Dados | ✅ RLS + Segurança | Feito |
| 36 Perfis Fake | ✅ CRIADOS | Feito |
| **Stripe Payments** | ❌ **PENDENTE** | Próxima tarefa |
| Email Verification | ❌ TODO | Depois |
| 2FA/MFA | ❌ TODO | Depois |
| Live Chat | ❌ TODO | Depois |

---

## 📝 PRÓXIMA TAREFA (P0)

### Integrar Stripe para Pagamentos

**Planos a vender:**
- FREE: €0
- PREMIUM_3M: €5.33/mês (€16 total)
- PREMIUM_12M: €2.08/mês (€25 total)
- VIP_24M: €2.91/mês (€70 total)

**O que fazer:**
1. Criar conta Stripe
2. Implementar `/api/payments/create-checkout`
3. Implementar `/api/payments/webhook`
4. Wiring nos botões de planos
5. Atualizar user subscription

**Docs:** https://stripe.com/docs/billing/subscriptions

**Tempo estimado:** 2-3 horas

---

## 🔍 TESTA LOCALMENTE

```bash
# Registo
1. Clica "Rejoindre Maintenant"
2. Preenche formulário
3. Submete
4. Check se vai para /profil

# Login
1. Clica "Se Connecter" (navbar)
2. Login com credenciais
3. Check se vai para /profil com dados

# Password Recovery
1. Clica "Mot de passe oublié?"
2. Preenche email
3. Check console (Resend não configurado, vê token no console)
4. Clica /reset-password?token=xxx
5. Preenche nova password
6. Reseta com sucesso

# Páginas Protegidas
1. Logout
2. Tenta aceder /profil
3. Check se redireciona /login
```

Se tudo passa → Pronto para next task!

---

## 💾 GIT WORKFLOW

```bash
# 1. Cria branch feature
git checkout -b feature/stripe-integration

# 2. Trabalha normalmente
# ... edita ficheiros, testa, etc

# 3. Commit
git add .
git commit -m "feat: stripe integration complete"

# 4. Push
git push origin feature/stripe-integration

# 5. Cria Pull Request
# → GitHub → Compare & Pull Request
# → Descreve mudanças
# → Pede review

# 6. Review & Merge
# → Alguém da equipa revê
# → Faz merge para main
# → Auto-deploy no Hostinger
```

---

## 🗂️ FICHEIROS IMPORTANTES

**Ler primeiro:**
- `ENGINEERING_HANDOFF.md` — Tudo técnico
- `RESEND_COMPLETE.md` — Como password recovery funciona
- `.env.example` — Variáveis necessárias

**Referência:**
- `app/layout.tsx` — Root layout
- `context/auth-context.tsx` — AuthProvider
- `lib/supabase.ts` — Supabase client
- `middleware.ts` — Proteção de rotas

**APIs:**
- `app/api/auth/*` — Autenticação
- `app/api/payments/*` — Pagamentos (TODO)

---

## 🆘 PROBLEMAS COMUNS

### "Cannot find module 'resend'"
```bash
npm install resend
```

### "NEXT_PUBLIC_SUPABASE_URL is not set"
```bash
# Edita .env.local
NEXT_PUBLIC_SUPABASE_URL=https://mfchfnsekoluicxnguoh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Build fails com "Module not found"
```bash
npm install
rm -rf .next
npm run build
```

### Página branca em produção
1. Check Hostinger logs
2. Check build passou
3. Clear cache (Hostinger panel)
4. Redeploy

---

## 📞 PERGUNTAS?

Docs:
- `ENGINEERING_HANDOFF.md` — Tudo técnico
- `RESEND_COMPLETE.md` — Password recovery details
- `.env.example` — Variáveis

GitHub Issues:
- Cria issue se encontrar bug
- Reference the commit hash

---

**Ready? Let's go! 🚀**

Next: `ENGINEERING_HANDOFF.md` → Stripe Integration
