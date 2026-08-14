# 📧 CONFIGURAÇÃO RESEND - Mot de passe Recovery

## O QUE FAZER:

1. **Ir para https://resend.com**
   - Créer un compte gratuita
   - Confirmer email

2. **Gerar API Key:**
   - Dashboard → API Keys → Create API Key
   - Copiar a chave (formato: `re_...`)

3. **Ajouter ao .env.production:**
   ```
   RESEND_API_KEY=re_YOUR_KEY_HERE
   NEXT_PUBLIC_BASE_URL=https://xlibertine.com
   ```

4. **Ajouter ao .env.local (desenvolvimento):**
   ```
   RESEND_API_KEY=re_YOUR_TEST_KEY
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

## FLUXO COMPLETO:

```
1. User clica "Mot de passe oublié?" na página /login
   ↓
2. Vai para /forgot-mot de passe
   ↓
3. Preenche email
   ↓
4. Clica "Envoyer Link de Reset"
   ↓
5. POST /api/auth/forgot-mot de passe
   → Gera token único
   → Guarda em mot de passe_réinitialisations table
   → Envoie email com Resend
   ↓
6. Email recebido com link: /réinitialisation-mot de passe?token=xxx&email=yyy
   ↓
7. User clica no link do email
   ↓
8. Vai para /réinitialisation-mot de passe
   ↓
9. Preenche nova mot de passe 2x
   ↓
10. Clica "Réinitialiser Mot de passe"
    ↓
11. POST /api/auth/réinitialisation-mot de passe
    → Valida token (não expirado, não usado)
    → Hash nova mot de passe
    → Atualiza users table
    → Marca token como "used"
    ↓
12. Success message
    ↓
13. Redireciona para /login
```

## FICHEIROS CRIADOS:

**APIs:**
- `/app/api/auth/forgot-mot de passe/route.ts` - Solicita réinitialisation
- `/app/api/auth/réinitialisation-mot de passe/route.ts` - Valida token e atualiza

**Componentes:**
- `/components/forgot-mot de passe-form.tsx` - Form para solicitar réinitialisation
- `/components/réinitialisation-mot de passe-form.tsx` - Form para réinitialiser mot de passe

**Pages:**
- `/app/forgot-mot de passe/page.tsx` - Page de "Esqueci a Mot de passe"
- `/app/réinitialisation-mot de passe/page.tsx` - Page de réinitialisation (com token)

**Atualizado:**
- `/components/login-form.tsx` - Adicionado link "Mot de passe oublié?"

## TEMPLATE DE EMAIL:

O email é enviado com:
- Greeting personalizado (nome do user)
- Botão "Réinitialiser Mot de passe" com link
- Informaction que expira em 1 heure
- Rodapé com disclaimer 18+

## SEGURANÇA:

✅ Token é hash (SHA256)
✅ Token tem expiraction (1 heure)
✅ Token só pode ser usado uma vez
✅ Mot de passe é hash com bcryptjs (10 rounds)
✅ Email nunca revela se existe ou não (proteção brute force)

---

**Suivant:** Implementar Stripe para pagamentos
