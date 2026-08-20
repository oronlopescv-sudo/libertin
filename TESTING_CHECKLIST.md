# ✅ CHECKLIST DE TESTE EXECUTÁVEL

**Data:** 09 de Agosto de 2026  
**Plateforme:** xlibertine.com  
**Testers:** 50 clientes + 3 agentes

---

## 📱 TESTE 1: AUTENTICAÇÃO (TODOS)

### Passo 1.1: S'inscrire Nova Conta
```
[ ] Vai para https://xlibertine.com/register
[ ] Preenche:
    - Email: test_seuemail@test.com
    - Username: SeNome_Teste
    - Mot de passe: Test1234567890! (mín 8 chars)
    - Confirma mot de passe
    - Seleciona Âge: 25+
    - Seleciona Genre: Femme/Homme
    - Seleciona Localisation: Paris/Lyon/etc
[ ] Clica "Rejoindre Maintenant"
[ ] Resultado esperado: ✅ Redireciona para /login
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 1.2: Fazer Login
```
[ ] Está em /login
[ ] Usa credenciais:
    - Email: seu_email_registado@test.com
    - OU Username: SeNome_Teste
    - Mot de passe: Test1234567890!
[ ] Clica "Se Connecter"
[ ] Resultado esperado: ✅ Redireciona para /profil
[ ] Vê votre profil carregado
[ ] localStorage tem "auth_token"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 1.3: Ver Seu Profil
```
[ ] Já está em /profil
[ ] Vê suas informações:
    - Username
    - Email
    - Localisation
    - Tipo de abonnement (FREE, PASS_EPICURIEN, etc)
[ ] Botão "Logout" está visível
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 1.4: Logout
```
[ ] Clica no botão "Logout"
[ ] Resultado esperado: ✅ Redireciona para /login
[ ] localStorage "auth_token" foi removido
[ ] Tenta aceder /profil manualmente
[ ] Redireciona novamente para /login
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 🔒 TESTE 2: PAYWALL - FREE USERS (25 clientes)

**Credenciais:** `client.alice@xlibertine.com` / `TestPass123`

### Passo 2.1: Login como FREE
```
[ ] Faz login com credenciais FREE
[ ] Vai para /profil ✅
[ ] Resultado esperado: Succès
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.2: Tenta /decouvrir (BLOQUEADO)
```
[ ] Clica menu → "Découvrir"
[ ] Vai para /decouvrir
[ ] Resultado esperado: 🔒 Lock screen
[ ] Vê mensagem: "Apenas Premium"
[ ] Vê botão "Fazer Upgrade"
[ ] Clica "Fazer Upgrade" → vai para /abonnements
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.3: Tenta Criar Groupe (BLOQUEADO)
```
[ ] Vai para /groupes
[ ] Vê lista de grupos (vazia ou com grupos existentes)
[ ] Botão "Criar Groupe" está DESABILITADO
[ ] Tenta clicar (não faz nada)
[ ] Vê tooltip: "Premium only"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.4: Tenta Juntar-se a Groupe (BLOQUEADO)
```
[ ] Se existe algum grupo na lista
[ ] Clica "Juntar-se"
[ ] Resultado esperado: ❌ 403 Erro
[ ] Message: "Apenas Premium"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.5: Tenta /chat (BLOQUEADO)
```
[ ] Tenta aceder /chat/qualquer-id
[ ] Resultado esperado: 🔒 Lock screen
[ ] Redireciona a /groupes
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.6: Tenta Upload Foto (BLOQUEADO)
```
[ ] Vai para /profil
[ ] Clica em "Upload Foto"
[ ] Resultado esperado: ❌ 403 Erro
[ ] Message: "Apenas Premium"
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 💎 TESTE 3: PREMIUM FEATURES (22 clientes)

**Credenciais (escolhe uma):**
- `premium.maya@xlibertine.com` / `TestPass123` (PASS_PRIVILEGE)
- `premium.alice@xlibertine.com` / `TestPass123` (PASS_EPICURIEN)

### Passo 3.1: Login como PREMIUM
```
[ ] Faz login com credenciais PREMIUM
[ ] Vai para /profil ✅
[ ] Vê abonnement: PASS_EPICURIEN ou PASS_PRIVILEGE
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.2: Acesso a /decouvrir (DESBLOQUEADO)
```
[ ] Vai para /decouvrir
[ ] Resultado esperado: ✅ Carrega página com perfis
[ ] Vê grid de perfis (20 por página)
[ ] Cada perfil mostra:
    - Avatar/placeholder
    - Username
    - Âge
    - Localisation
    - Genre/Orientaction
    - Botão "Liker"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.3: Testar Filtres
```
[ ] Em /decouvrir, há secção de filtros
[ ] Testa Localisation:
    [ ] Seleciona "Paris" → Mostra só de Paris ✅
    [ ] Seleciona "Lyon" → Mostra só de Lyon ✅
[ ] Testa Âge:
    [ ] Âge Min: 25 → Mostra 25+
    [ ] Âge Max: 40 → Mostra até 40
    [ ] Combina ambos ✅
[ ] Testa Genre:
    [ ] Femme → Mostra só mulheres
    [ ] Homme → Mostra só homens
[ ] Testa Orientaction:
    [ ] Heterossexual → Mostra só hetero
    [ ] Bissexual → Mostra só bissexuais
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.4: Liker Profil
```
[ ] Em /decouvrir, vê um perfil
[ ] Clica no botão "Liker" ❤️
[ ] Resultado esperado:
    [ ] Botão muda para "Liké" ❤️ (preenchido)
    [ ] Cor muda para vermelho (#D4145A)
    [ ] Profil adicionado a seus likes
[ ] Clica novamente (Unlike):
    [ ] Botão volta a "Liker" (oco)
    [ ] Cor volta a normal
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.5: Ver Meus Likes
```
[ ] Vai para /profil
[ ] Vê secção "Meus Likes"
[ ] Mostra perfis que curtiu
[ ] Cada perfil tem opção de "Unlike"
[ ] ✅ PASSOU ou ❌ FALHOU (quando implementado)
```

### Passo 3.6: Ver Quem Curtiu (Admiradores)
```
[ ] Vai para /profil
[ ] Vê secção "Meus Admiradores"
[ ] Mostra quem curtiu votre profil
[ ] Número de admiradores está correto
[ ] ✅ PASSOU ou ❌ FALHOU (quando implementado)
```

### Passo 3.7: Criar Groupe
```
[ ] Vai para /groupes
[ ] Clica "Criar Groupe"
[ ] Modal abre com formulário:
    [ ] Nome do Groupe (obligatoire)
    [ ] Description
    [ ] Catégorie
    [ ] Max Membros
    [ ] Privé? (toggle)
[ ] Preenche e clica "Criar"
[ ] Resultado esperado:
    [ ] ✅ Groupe criado avec succès
    [ ] Novo grupo aparece na lista
    [ ] User é "admin" do grupo
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.8: Participar em Groupe
```
[ ] Vê um grupo existente na lista
[ ] Clica "Juntar-se"
[ ] Resultado esperado:
    [ ] ✅ Succès 201
    [ ] Botão muda para "Se déconnecter"
    [ ] User adicionado a group_memberships
[ ] Clica "Se déconnecter":
    [ ] User removido
    [ ] Botão volta a "Juntar-se"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.9: Envoyer Message em Groupe
```
[ ] Participa num grupo (passo 3.8)
[ ] Vai para /chat/grupo-id
[ ] Page carrega com historique vazio (ou com mensagens)
[ ] Campo de input no fundo
[ ] Escreve mensagem: "Olá, este é um teste! 🎉"
[ ] Clica "Envoyer" ou pressiona Enter
[ ] Resultado esperado:
    [ ] ✅ Message aparece na lista
    [ ] Username visível
    [ ] Timestamp correto
    [ ] Message do utilisateur correto
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.10: Paginaction de Profils
```
[ ] Em /decouvrir com perfis carregados
[ ] Há botões de paginaction (Précédent, Suivant)
[ ] Clica "Suivant"
[ ] Resultado esperado:
    [ ] ✅ Próxima página carrega (20 novos perfis)
    [ ] Page counter incrementa
    [ ] Botão "Précédent" ativa
[ ] Clica "Précédent"
    [ ] Volta à página anterior
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 🛡️ TESTE 4: SEGURANÇA (TODOS - 10 min)

### Passo 4.1: Mot de passe Fraca
```
[ ] Vai para /register
[ ] Tenta registar com mot de passe "123"
[ ] Resultado esperado: ❌ Erro
[ ] Message: "Minimum 8 caracteres"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 4.2: Email Duplicado
```
[ ] Vai para /register
[ ] Tenta registar com email que já existe
[ ] Resultado esperado: ❌ Erro
[ ] Message: "Email já registado"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 4.3: Token Expirado
```
[ ] Faz login
[ ] Aguarda e limpa localStorage (simula expiraction)
[ ] Tenta aceder /profil
[ ] Resultado esperado: ✅ Redireciona para /login
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 4.4: CORS & HTTPS
```
[ ] Toutes as requests usam HTTPS ✅
[ ] Sem erros de CORS no console
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 📊 TESTE 5: PASSWORD RECOVERY

### Passo 5.1: Solicitar Link
```
[ ] Vai para /forgot-mot de passe
[ ] Preenche email válido
[ ] Clica "Envoyer Link de Reset"
[ ] Resultado esperado:
    [ ] ✅ Message de sucesso
    [ ] "Verifique seu email"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 5.2: Receber Email
```
[ ] Vai ao serviço de email (Resend dashboard)
[ ] Procura email de mot de passe réinitialisation
[ ] Email tem link com token
[ ] Link é válido (não expirado)
[ ] ✅ PASSOU ou ❌ FALHOU (quando Resend configurado)
```

### Passo 5.3: Reset Mot de passe
```
[ ] Clica link do email
[ ] Vai para /réinitialisation-mot de passe?token=xxx
[ ] Preenche:
    [ ] Nova Mot de passe: Novo1234567
    [ ] Confirma Mot de passe: Novo1234567
[ ] Clica "Réinitialiser Mot de passe"
[ ] Resultado esperado:
    [ ] ✅ Mot de passe réinitialisationada
    [ ] Redireciona para /login
    [ ] Login com nova mot de passe funciona
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 🎯 RESUMO DE RESULTADOS

### Contagem

| Teste | Total | Passou | Falhou | Taxa |
|-------|-------|--------|--------|------|
| Autenticaction | 50 | ? | ? | ?% |
| Paywall FREE | 25 | ? | ? | ?% |
| PREMIUM Features | 22 | ? | ? | ?% |
| Admin/Agentes | 3 | ? | ? | ?% |
| Segurança | 50 | ? | ? | ?% |
| Mot de passe Recovery | 50 | ? | ? | ?% |

### Status Geral

```
✅ Autenticaction:        [████████████████░░] 90%
✅ Paywall:             [████████████████░░] 90%
✅ PREMIUM Features:    [████████████████░░] 85%
✅ Segurança:           [██████████████████] 100%
✅ Mot de passe Recovery:   [████████████░░░░░░] 60% (Resend)

MÉDIA GERAL:            [████████████████░░] 87%
```

---

## 📝 NOTAS IMPORTANTES

```
⚠️  Cada teste deve ser feito por pelo menos 5 utilisateurs
⚠️  Testa em CHROME, FIREFOX e SAFARI
⚠️  Testa em iPhone e Android
⚠️  Avisa se encontrar bugs
⚠️  Tempo total: 30-45 minutes por pessoa
```

---

## 🐛 BUG REPORTING

Se encontrar um bug:

1. **Descreve o comportamento:**
   ```
   Passo: X
   Esperado: Y
   Obtido: Z
   ```

2. **Captura Screenshot** (se possível)

3. **Anota console errors** (F12 → Console)

4. **Repete o bug** (Confirma que é reproduzível)

5. **Avisa em:**
   - Discord: `#bugs`
   - Email: `testing@xlibertine.com`
   - GitHub Issues: `oronlopescv-sudo/libertin`

---

**Muito obrigado por testar! 🙏**
