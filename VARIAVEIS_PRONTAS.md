# 📋 VARIÁVEIS PRONTAS PARA ADICIONAR - HOSTINGER PAINEL

**Copia e cola direto no painel do Hostinger**

---

## VARIÁVEL 1️⃣ - RESEND API KEY

| Campo | Valor |
|-------|-------|
| **Key** | `RESEND_API_KEY` |
| **Value** | `re_xxxxxxxxxxxxxxxxxxxxx` |

⚠️ **Substitui o `xxxxx` pela tua chave real**

Onde pegar:
1. https://resend.com/api-keys
2. "Create API Key"
3. Copia (formato: `re_1a2b3c...`)

---

## VARIÁVEL 2️⃣ - BASE URL

| Campo | Valor |
|-------|-------|
| **Key** | `NEXT_PUBLIC_BASE_URL` |
| **Value** | `https://xlibertine.com` |

✅ Este é exato, copia direto

---

## 📋 COMO ADICIONAR (Passo-a-Passo)

### Passo 1: Ouvrir Hostinger
```
https://hpanel.hostinger.com
→ Login
```

### Passo 2: Ir a Variáveis
```
Menu Esquerdo
→ Paramètres/Settings
→ Build and Output Settings
→ Scroll down: "Environment Variables"
```

### Passo 3: Ajouter Primeira Variável
```
Campo "Key": RESEND_API_KEY
Campo "Value": re_xxxxx...
Clica ✓ (ou deixa assim)
```

### Passo 4: Ajouter Segunda Variável
```
Clica "+ Add more"
Campo "Key": NEXT_PUBLIC_BASE_URL
Campo "Value": https://xlibertine.com
Clica ✓
```

### Passo 5: SALVAR
```
Scroll down até fim
Clica "Save and redeploy"
Aguarda 2-3 minutes
```

---

## ✅ CONFIRMAÇÃO

Depois de "Save and redeploy":

```
Hostinger vai:
1. Pegar nas variáveis
2. Fazer build automático
3. Deploy do site
4. 2-3 minutes depois...
5. Site funciona com Resend ✅
```

---

## 🧪 TESTAR (Depois de redeploy)

```
1. https://xlibertine.com/forgot-mot de passe
2. Email: teu@email.com
3. "Envoyer Link"
4. Vai a email
5. Recebe email de réinitialisation ✅
6. Clica link
7. Reseta mot de passe
8. Login com nova mot de passe ✅
```

---

## 🆘 SE DER ERRO

### "Email not received"
```
→ Vérifie se RESEND_API_KEY está correto
→ Chave começa com "re_"?
→ Copia novamente da https://resend.com/api-keys
```

### "Email recebido mas link não funciona"
```
→ NEXT_PUBLIC_BASE_URL deve ser https://xlibertine.com
→ Vérifie se é exatamente isto (sem /)
```

### "Build failed"
```
→ Espera 5 min e tenta novamente
→ Se persistir, contacta Hostinger
```

---

## 📞 SUPORTE

- **Resend:** https://resend.com/support
- **Hostinger:** https://hpanel.hostinger.com/support
- **Docs:** /home/claude/libertin/RESEND_COMPLETE.md

---

**Pronto! Copias estes valores e já está tudo!** 🚀
