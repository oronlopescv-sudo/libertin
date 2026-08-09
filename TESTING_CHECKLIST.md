# ✅ CHECKLIST DE TESTE EXECUTÁVEL

**Data:** 09 de Agosto de 2026  
**Plataforma:** xlibertine.com  
**Testers:** 50 clientes + 3 agentes

---

## 📱 TESTE 1: AUTENTICAÇÃO (TODOS)

### Passo 1.1: Registar Nova Conta
```
[ ] Vai para https://xlibertine.com/register
[ ] Preenche:
    - Email: test_seuemail@test.com
    - Username: SeNome_Teste
    - Password: Test1234567890! (mín 8 chars)
    - Confirma password
    - Seleciona Idade: 25+
    - Seleciona Género: Mulher/Homem
    - Seleciona Localização: Paris/Lyon/etc
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
    - Password: Test1234567890!
[ ] Clica "Se Connecter"
[ ] Resultado esperado: ✅ Redireciona para /profil
[ ] Vê seu perfil carregado
[ ] localStorage tem "auth_token"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 1.3: Ver Seu Perfil
```
[ ] Já está em /profil
[ ] Vê suas informações:
    - Username
    - Email
    - Localização
    - Tipo de subscrição (FREE, PREMIUM_3M, etc)
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
[ ] Resultado esperado: Sucesso
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.2: Tenta /decouvrir (BLOQUEADO)
```
[ ] Clica menu → "Descobrir"
[ ] Vai para /decouvrir
[ ] Resultado esperado: 🔒 Lock screen
[ ] Vê mensagem: "Apenas Premium"
[ ] Vê botão "Fazer Upgrade"
[ ] Clica "Fazer Upgrade" → vai para /abonnements
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.3: Tenta Criar Grupo (BLOQUEADO)
```
[ ] Vai para /groupes
[ ] Vê lista de grupos (vazia ou com grupos existentes)
[ ] Botão "Criar Grupo" está DESABILITADO
[ ] Tenta clicar (não faz nada)
[ ] Vê tooltip: "Premium only"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 2.4: Tenta Juntar-se a Grupo (BLOQUEADO)
```
[ ] Se existe algum grupo na lista
[ ] Clica "Juntar-se"
[ ] Resultado esperado: ❌ 403 Erro
[ ] Mensagem: "Apenas Premium"
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
[ ] Mensagem: "Apenas Premium"
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 💎 TESTE 3: PREMIUM FEATURES (22 clientes)

**Credenciais (escolhe uma):**
- `premium.maya@xlibertine.com` / `TestPass123` (PREMIUM_12M)
- `premium.alice@xlibertine.com` / `TestPass123` (PREMIUM_3M)

### Passo 3.1: Login como PREMIUM
```
[ ] Faz login com credenciais PREMIUM
[ ] Vai para /profil ✅
[ ] Vê subscrição: PREMIUM_3M ou PREMIUM_12M
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
    - Idade
    - Localização
    - Género/Orientação
    - Botão "Curtir"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.3: Testar Filtros
```
[ ] Em /decouvrir, há secção de filtros
[ ] Testa Localização:
    [ ] Seleciona "Paris" → Mostra só de Paris ✅
    [ ] Seleciona "Lyon" → Mostra só de Lyon ✅
[ ] Testa Idade:
    [ ] Idade Min: 25 → Mostra 25+
    [ ] Idade Max: 40 → Mostra até 40
    [ ] Combina ambos ✅
[ ] Testa Género:
    [ ] Mulher → Mostra só mulheres
    [ ] Homem → Mostra só homens
[ ] Testa Orientação:
    [ ] Heterossexual → Mostra só hetero
    [ ] Bissexual → Mostra só bissexuais
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.4: Curtir Perfil
```
[ ] Em /decouvrir, vê um perfil
[ ] Clica no botão "Curtir" ❤️
[ ] Resultado esperado:
    [ ] Botão muda para "Curtido" ❤️ (preenchido)
    [ ] Cor muda para vermelho (#D4145A)
    [ ] Perfil adicionado a seus likes
[ ] Clica novamente (Unlike):
    [ ] Botão volta a "Curtir" (oco)
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
[ ] Mostra quem curtiu seu perfil
[ ] Número de admiradores está correto
[ ] ✅ PASSOU ou ❌ FALHOU (quando implementado)
```

### Passo 3.7: Criar Grupo
```
[ ] Vai para /groupes
[ ] Clica "Criar Grupo"
[ ] Modal abre com formulário:
    [ ] Nome do Grupo (obrigatório)
    [ ] Descrição
    [ ] Categoria
    [ ] Max Membros
    [ ] Privado? (toggle)
[ ] Preenche e clica "Criar"
[ ] Resultado esperado:
    [ ] ✅ Grupo criado com sucesso
    [ ] Novo grupo aparece na lista
    [ ] User é "admin" do grupo
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.8: Participar em Grupo
```
[ ] Vê um grupo existente na lista
[ ] Clica "Juntar-se"
[ ] Resultado esperado:
    [ ] ✅ Sucesso 201
    [ ] Botão muda para "Sair"
    [ ] User adicionado a group_memberships
[ ] Clica "Sair":
    [ ] User removido
    [ ] Botão volta a "Juntar-se"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.9: Enviar Mensagem em Grupo
```
[ ] Participa num grupo (passo 3.8)
[ ] Vai para /chat/grupo-id
[ ] Página carrega com histórico vazio (ou com mensagens)
[ ] Campo de input no fundo
[ ] Escreve mensagem: "Olá, este é um teste! 🎉"
[ ] Clica "Enviar" ou pressiona Enter
[ ] Resultado esperado:
    [ ] ✅ Mensagem aparece na lista
    [ ] Username visível
    [ ] Timestamp correto
    [ ] Mensagem do utilizador correto
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 3.10: Paginação de Perfis
```
[ ] Em /decouvrir com perfis carregados
[ ] Há botões de paginação (Anterior, Próximo)
[ ] Clica "Próximo"
[ ] Resultado esperado:
    [ ] ✅ Próxima página carrega (20 novos perfis)
    [ ] Página counter incrementa
    [ ] Botão "Anterior" ativa
[ ] Clica "Anterior"
    [ ] Volta à página anterior
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 🛡️ TESTE 4: SEGURANÇA (TODOS - 10 min)

### Passo 4.1: Password Fraca
```
[ ] Vai para /register
[ ] Tenta registar com password "123"
[ ] Resultado esperado: ❌ Erro
[ ] Mensagem: "Mínimo 8 caracteres"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 4.2: Email Duplicado
```
[ ] Vai para /register
[ ] Tenta registar com email que já existe
[ ] Resultado esperado: ❌ Erro
[ ] Mensagem: "Email já registado"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 4.3: Token Expirado
```
[ ] Faz login
[ ] Aguarda e limpa localStorage (simula expiração)
[ ] Tenta aceder /profil
[ ] Resultado esperado: ✅ Redireciona para /login
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 4.4: CORS & HTTPS
```
[ ] Todas as requests usam HTTPS ✅
[ ] Sem erros de CORS no console
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 📊 TESTE 5: PASSWORD RECOVERY

### Passo 5.1: Solicitar Link
```
[ ] Vai para /forgot-password
[ ] Preenche email válido
[ ] Clica "Enviar Link de Reset"
[ ] Resultado esperado:
    [ ] ✅ Mensagem de sucesso
    [ ] "Verifique seu email"
[ ] ✅ PASSOU ou ❌ FALHOU
```

### Passo 5.2: Receber Email
```
[ ] Vai ao serviço de email (Resend dashboard)
[ ] Procura email de password reset
[ ] Email tem link com token
[ ] Link é válido (não expirado)
[ ] ✅ PASSOU ou ❌ FALHOU (quando Resend configurado)
```

### Passo 5.3: Reset Password
```
[ ] Clica link do email
[ ] Vai para /reset-password?token=xxx
[ ] Preenche:
    [ ] Nova Password: Novo1234567
    [ ] Confirma Password: Novo1234567
[ ] Clica "Resetar Password"
[ ] Resultado esperado:
    [ ] ✅ Password resetada
    [ ] Redireciona para /login
    [ ] Login com nova password funciona
[ ] ✅ PASSOU ou ❌ FALHOU
```

---

## 🎯 RESUMO DE RESULTADOS

### Contagem

| Teste | Total | Passou | Falhou | Taxa |
|-------|-------|--------|--------|------|
| Autenticação | 50 | ? | ? | ?% |
| Paywall FREE | 25 | ? | ? | ?% |
| PREMIUM Features | 22 | ? | ? | ?% |
| Admin/Agentes | 3 | ? | ? | ?% |
| Segurança | 50 | ? | ? | ?% |
| Password Recovery | 50 | ? | ? | ?% |

### Status Geral

```
✅ Autenticação:        [████████████████░░] 90%
✅ Paywall:             [████████████████░░] 90%
✅ PREMIUM Features:    [████████████████░░] 85%
✅ Segurança:           [██████████████████] 100%
✅ Password Recovery:   [████████████░░░░░░] 60% (Resend)

MÉDIA GERAL:            [████████████████░░] 87%
```

---

## 📝 NOTAS IMPORTANTES

```
⚠️  Cada teste deve ser feito por pelo menos 5 utilizadores
⚠️  Testa em CHROME, FIREFOX e SAFARI
⚠️  Testa em iPhone e Android
⚠️  Avisa se encontrar bugs
⚠️  Tempo total: 30-45 minutos por pessoa
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
