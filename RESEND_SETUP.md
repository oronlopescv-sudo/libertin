# 📧 CONFIGURAÇÃO RESEND - Password Recovery

## O QUE FAZER:

1. **Ir para https://resend.com**
   - Criar conta gratuita
   - Confirmar email

2. **Gerar API Key:**
   - Dashboard → API Keys → Create API Key
   - Copiar a chave (formato: `re_...`)

3. **Adicionar ao .env.production:**
   ```
   RESEND_API_KEY=re_YOUR_KEY_HERE
   NEXT_PUBLIC_BASE_URL=https://xlibertine.com
   ```

4. **Adicionar ao .env.local (desenvolvimento):**
   ```
   RESEND_API_KEY=re_YOUR_TEST_KEY
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

## FLUXO COMPLETO:

```
1. User clica "Mot de passe oublié?" na página /login
   ↓
2. Vai para /forgot-password
   ↓
3. Preenche email
   ↓
4. Clica "Enviar Link de Reset"
   ↓
5. POST /api/auth/forgot-password
   → Gera token único
   → Guarda em password_resets table
   → Envia email com Resend
   ↓
6. Email recebido com link: /reset-password?token=xxx&email=yyy
   ↓
7. User clica no link do email
   ↓
8. Vai para /reset-password
   ↓
9. Preenche nova password 2x
   ↓
10. Clica "Resetar Password"
    ↓
11. POST /api/auth/reset-password
    → Valida token (não expirado, não usado)
    → Hash nova password
    → Atualiza users table
    → Marca token como "used"
    ↓
12. Success message
    ↓
13. Redireciona para /login
```

## FICHEIROS CRIADOS:

**APIs:**
- `/app/api/auth/forgot-password/route.ts` - Solicita reset
- `/app/api/auth/reset-password/route.ts` - Valida token e atualiza

**Componentes:**
- `/components/forgot-password-form.tsx` - Form para solicitar reset
- `/components/reset-password-form.tsx` - Form para resetar password

**Páginas:**
- `/app/forgot-password/page.tsx` - Página de "Esqueci a Password"
- `/app/reset-password/page.tsx` - Página de reset (com token)

**Atualizado:**
- `/components/login-form.tsx` - Adicionado link "Mot de passe oublié?"

## TEMPLATE DE EMAIL:

O email é enviado com:
- Greeting personalizado (nome do user)
- Botão "Resetar Password" com link
- Informação que expira em 1 hora
- Rodapé com disclaimer 18+

## SEGURANÇA:

✅ Token é hash (SHA256)
✅ Token tem expiração (1 hora)
✅ Token só pode ser usado uma vez
✅ Password é hash com bcryptjs (10 rounds)
✅ Email nunca revela se existe ou não (proteção brute force)

---

**Próximo:** Implementar Stripe para pagamentos
