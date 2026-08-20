# 👥 DISTRIBUIÇÃO DE 50 CLIENTES - TESTE COMPLETO DE TODOS OS BOTÕES

**Objetivo:** Cada cliente testa um conjunto específico de botões/opções  
**Total:** 50 clientes + 3 agentes  
**Duraction:** 2-3 heures  
**Status:** Teste paralelo de TODAS as funcionalidades

---

## 📊 MAPA DE DISTRIBUIÇÃO

```
50 CLIENTES
├─ Groupe 1-5 (FREE) → Autenticaction (5 clientes)
├─ Groupe 6-10 (FREE) → Paywall & Bloqueios (5 clientes)
├─ Groupe 11-20 (PREMIUM) → Discovery & Filtres (10 clientes)
├─ Groupe 21-25 (PREMIUM) → Likes & Admiradores (5 clientes)
├─ Groupe 26-35 (PREMIUM) → Groupes (10 clientes)
├─ Groupe 36-45 (PREMIUM) → Chat & Messages (10 clientes)
├─ Groupe 46-50 (MIX) → Edge Cases & Bugs (5 clientes)
└─ 3 AGENTES → Admin Functions (quando implementado)
```

---

## 🔐 GRUPO 1-5: AUTENTICAÇÃO (5 CLIENTES FREE)

### Credenciais
```
Client 1: client.alice@xlibertine.com / TestPass123
Client 2: client.bob@xlibertine.com / TestPass123
Client 3: client.carol@xlibertine.com / TestPass123
Client 4: client.david@xlibertine.com / TestPass123
Client 5: client.emma@xlibertine.com / TestPass123
```

### Cliente 1: REGISTRO
**Botões/Opções para testar:**
```
☐ Page: /register
  ☐ Botão "Rejoindre Maintenant" (clica)
  ☐ Input Email (preenche: newuser1@test.com)
  ☐ Input Username (preenche: NewUser1)
  ☐ Input Mot de passe (preenche: Pass12345678)
  ☐ Confirmer Mot de passe (preenche: Pass12345678)
  ☐ Dropdown Âge (seleciona 25+)
  ☐ Radio Genre (seleciona Femme)
  ☐ Dropdown Localisation (seleciona Paris)
  ☐ Checkbox Termos (marca)
  ☐ Botão "Criar Conta" (clica)
  ☐ Redirecionamento: /login ✅
  ☐ Message de sucesso (verifica)

✅ RESULTADO: Account criada
```

### Cliente 2: LOGIN
**Botões/Opções para testar:**
```
☐ Page: /login
  ☐ Input Email (preenche: client.bob@xlibertine.com)
  ☐ Input Mot de passe (preenche: TestPass123)
  ☐ Botão "Se Connecter" (clica)
  ☐ Redirecionamento: /profil ✅
  ☐ Auth token em localStorage (vérifie F12)
  ☐ Navbar atualiza (mostra username) ✅
  ☐ Link "Mot de passe oublié?" (visível)

✅ RESULTADO: Login feito
```

### Cliente 3: PERFIL - VER & EDITAR
**Botões/Opções para testar:**
```
☐ Page: /profil
  ☐ Dados visíveis:
    ☐ Username (carol/david/etc)
    ☐ Email
    ☐ Tipo Abonnement (FREE)
    ☐ Localisation
  ☐ Botão "Modifier Profil" (se existe)
  ☐ Botão "Upload Foto" (tenta)
  ☐ Botão "Alternar Privacidade" (tenta)
  ☐ Botão "Logout" (clica)
  ☐ Redirecionamento: /login ✅
  ☐ Token removido de localStorage ✅

✅ RESULTADO: Profil visto, logout feito
```

### Cliente 4: PASSWORD RESET - REQUEST
**Botões/Opções para testar:**
```
☐ Page: /forgot-mot de passe
  ☐ Link "Mot de passe oublié?" (se vindo de /login)
  ☐ Input Email (preenche: client.david@xlibertine.com)
  ☐ Botão "Envoyer Link de Reset" (clica)
  ☐ Message de sucesso (verifica)
  ☐ Redirecionamento: /login (ou modal de sucesso) ✅

✅ RESULTADO: Email de réinitialisation enviado (Resend)
```

### Cliente 5: PASSWORD RESET - CONFIRMAR
**Botões/Opções para testar:**
```
☐ Ouiula: Clica link de email
☐ URL: /réinitialisation-mot de passe?token=abc123...
  ☐ Input Nova Mot de passe (preenche: NewPass12345)
  ☐ Confirmer Mot de passe (preenche: NewPass12345)
  ☐ Botão "Réinitialiser Mot de passe" (clica)
  ☐ Message de sucesso ✅
  ☐ Redirecionamento: /login ✅
  ☐ Tenta login com nova mot de passe ✅

✅ RESULTADO: Mot de passe réinitialisationada, login com nova
```

---

## 🔒 GRUPO 6-10: PAYWALL & BLOQUEIOS (5 CLIENTES FREE)

### Credenciais
```
Client 6: client.frank@xlibertine.com / TestPass123
Client 7: client.grace@xlibertine.com / TestPass123
Client 8: client.henry@xlibertine.com / TestPass123
Client 9: client.iris@xlibertine.com / TestPass123
Client 10: client.jack@xlibertine.com / TestPass123
```

### Cliente 6: PAYWALL - /decouvrir
**Botões/Opções para testar:**
```
☐ Login: client.frank@xlibertine.com
☐ Vai para: /decouvrir
  ☐ Vê: Lock Screen 🔒
  ☐ Ícone Lock (visível)
  ☐ Texto: "Apenas Premium" (lê)
  ☐ Description paywall (lê)
  ☐ Botão "Passer à Premium" (clica)
  ☐ Redirecionamento: /abonnements ✅
  ☐ Volta botão "Retour" (testa)
  ☐ Redireciona: /decouvrir (com lock novamente) ✅

✅ RESULTADO: Paywall funcionando
```

### Cliente 7: PAYWALL - /chat
**Botões/Opções para testar:**
```
☐ Login: client.grace@xlibertine.com
☐ Tenta acessar: /chat/any-group-id
  ☐ Vê: Lock Screen 🔒
  ☐ Message: "Apenas Premium"
  ☐ Botão "Fazer Upgrade"
  ☐ Botão "Retour"
  ☐ Redirecionamento: /abonnements ou /groupes ✅

✅ RESULTADO: Chat bloqueado
```

### Cliente 8: PAYWALL - CRIAR GRUPO
**Botões/Opções para testar:**
```
☐ Login: client.henry@xlibertine.com
☐ Vai para: /groupes
  ☐ Botão "Criar Groupe" está DISABLED
  ☐ Tenta clicar (não faz nada)
  ☐ Hover mostra tooltip: "Premium only"
  ☐ Ou vê lock screen quando tenta
  ☐ Opção "Juntar-se" a grupo (tenta)
  ☐ Erro: 403 "Apenas Premium"
  ☐ Message de erro renderizada ✅

✅ RESULTADO: Criaction bloqueada
```

### Cliente 9: PAYWALL - UPLOAD FOTO
**Botões/Opções para testar:**
```
☐ Login: client.iris@xlibertine.com
☐ Vai para: /profil
  ☐ Botão "Upload Foto" (tenta clicar)
  ☐ Se input file abre:
    ☐ Seleciona ficheiro
    ☐ Clica upload
  ☐ Erro: 403 "Apenas Premium" ✅
  ☐ Toast/Alert com mensagem

✅ RESULTADO: Upload bloqueado
```

### Cliente 10: PAYWALL - /eventos
**Botões/Opções para testar:**
```
☐ Login: client.jack@xlibertine.com
☐ Tenta acessar: /eventos
  ☐ Vê: Lock Screen 🔒
  ☐ Ou redireciona a /abonnements
  ☐ Botão "Criar Événement" (se visível, tenta)
  ☐ Bloqué ou 403 ✅
  ☐ Message: "Apenas Premium"

✅ RESULTADO: Événements bloqueados
```

---

## 💎 GRUPO 11-20: DISCOVERY & FILTROS (10 CLIENTES PREMIUM)

### Credenciais
```
Client 11: premium.alice@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 12: premium.ben@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 13: premium.clara@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 14: premium.daniel@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 15: premium.eva@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 16: premium.maya@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 17: premium.nathan@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 18: premium.osha@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 19: premium.paul@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 20: premium.quinn@xlibertine.com / TestPass123 (PREMIUM mensuel)
```

### Cliente 11: DISCOVERY - PÁGINA BÁSICA
**Botões/Opções para testar:**
```
☐ Login: premium.alice@xlibertine.com
☐ Vai para: /decouvrir
  ☐ Page carrega (sem lock) ✅
  ☐ Titulo: "Découvrir les profils" (visível)
  ☐ Secção de filtros (visível)
  ☐ Grid de perfis (20 por página)
  ☐ Cada perfil mostra:
    ☐ Avatar/Placeholder
    ☐ Username
    ☐ Âge
    ☐ Localisation
    ☐ Genre/Orientaction
  ☐ Botão "Liker" em cada perfil
  ☐ Paginaction (Précédent/Suivant)

✅ RESULTADO: Discovery carregado
```

### Cliente 12: FILTRO - LOCALIZAÇÃO
**Botões/Opções para testar:**
```
☐ Login: premium.ben@xlibertine.com
☐ Em: /decouvrir
  ☐ Dropdown Localisation:
    ☐ Seleciona "Paris"
    ☐ Grid recarrega (20 perfis de Paris)
    ☐ Seleciona "Lyon"
    ☐ Grid recarrega (20 perfis de Lyon)
    ☐ Seleciona "Bordeaux"
    ☐ Grid recarrega (20 perfis de Bordeaux)
    ☐ Seleciona "Toutes"
    ☐ Grid volta a mostrar mix
  ☐ Cada mudança refresca lista ✅
  ☐ Page volta a 1 ✅

✅ RESULTADO: Filtro localizaction funciona
```

### Cliente 13: FILTRO - IDADE
**Botões/Opções para testar:**
```
☐ Login: premium.clara@xlibertine.com
☐ Em: /decouvrir
  ☐ Slider Âge Min:
    ☐ Começa em 18
    ☐ Arrasta para 25
    ☐ Label atualiza: "Âge Min: 25" ✅
    ☐ Grid recarrega (só 25+)
  ☐ Slider Âge Max:
    ☐ Começa em 60
    ☐ Arrasta para 40
    ☐ Label atualiza: "Âge Max: 40" ✅
    ☐ Grid recarrega (25-40)
  ☐ Ambos sliders juntos:
    ☐ Min: 30, Max: 45
    ☐ Grid mostra só 30-45 ✅

✅ RESULTADO: Filtro idade funciona
```

### Cliente 14: FILTRO - GÉNERO
**Botões/Opções para testar:**
```
☐ Login: premium.daniel@xlibertine.com
☐ Em: /decouvrir
  ☐ Dropdown Genre:
    ☐ Seleciona "femme"
    ☐ Grid recarrega (só mulheres)
    ☐ Ícone ♀️ em cada perfil
    ☐ Seleciona "homme"
    ☐ Grid recarrega (só homens)
    ☐ Ícone ♂️ em cada perfil
    ☐ Seleciona "Tous"
    ☐ Grid volta a mix ✅

✅ RESULTADO: Filtro género funciona
```

### Cliente 15: FILTRO - ORIENTAÇÃO
**Botões/Opções para testar:**
```
☐ Login: premium.eva@xlibertine.com
☐ Em: /decouvrir
  ☐ Dropdown Orientaction:
    ☐ Seleciona "heterosexuelle"
    ☐ Grid recarrega (hetero)
    ☐ Seleciona "bisexuelle"
    ☐ Grid recarrega (bi)
    ☐ Seleciona "lesbienne"
    ☐ Grid recarrega (lésbica)
    ☐ Seleciona "Toutes"
    ☐ Grid volta a mix ✅
  ☐ Badge em cada perfil: "bisexuelle", etc ✅

✅ RESULTADO: Filtro orientaction funciona
```

### Cliente 16: FILTRO COMBINADO
**Botões/Opções para testar:**
```
☐ Login: premium.maya@xlibertine.com
☐ Em: /decouvrir
  ☐ Combina filtros:
    ☐ Localisation: "Paris"
    ☐ Âge: 25-35
    ☐ Genre: "femme"
    ☐ Orientaction: "bisexuelle"
    ☐ Grid recarrega (Paris + 25-35 + femme + bi) ✅
  ☐ Muda um filtro:
    ☐ Genre: "homme"
    ☐ Grid recarrega (Paris + 25-35 + homme + bi) ✅
  ☐ Remove filtros (volta a Tous)

✅ RESULTADO: Filtres combinados funcionam
```

### Cliente 17: PAGINAÇÃO - BOTÕES
**Botões/Opções para testar:**
```
☐ Login: premium.nathan@xlibertine.com
☐ Em: /decouvrir
  ☐ Page 1 carregada (20 perfis)
  ☐ Botão "Précédent" está DISABLED
  ☐ Botão "Suivant" está ENABLED
  ☐ Counter mostra: "Page 1"
  ☐ Clica "Suivant"
    ☐ Carrega página 2 (20 novos perfis)
    ☐ Counter: "Page 2" ✅
    ☐ Botão "Précédent" ENABLED
    ☐ Botão "Suivant" ENABLED
  ☐ Clica "Précédent"
    ☐ Volta página 1 ✅
    ☐ Botão "Précédent" DISABLED novamente
  ☐ Clica "Suivant" várias vezes
    ☐ Pages incrementam

✅ RESULTADO: Paginaction funciona
```

### Cliente 18-20: PAGINAÇÃO COM FILTROS
**Botões/Opções para testar:**
```
☐ Login: premium.osha (18), premium.paul (19), premium.quinn (20)
☐ Em: /decouvrir
  ☐ Aplica filtro: "Paris"
  ☐ Page 1 (Paris, 20 perfis)
  ☐ Clica "Suivant"
    ☐ Page 2 (Paris novamente, 20 novos)
    ☐ Filtro mantém-se ✅
  ☐ Muda filtro: "Lyon"
    ☐ Page réinitialisationa para 1 ✅
    ☐ Mostra Lyon, página 1
  ☐ Clica "Suivant"
    ☐ Lyon, página 2 ✅

✅ RESULTADO: Paginaction + filtros sincronizados
```

---

## ❤️ GRUPO 21-25: LIKES & ADMIRADORES (5 CLIENTES PREMIUM)

### Credenciais
```
Client 21: premium.rosa@xlibertine.com / TestPass123
Client 22: premium.sergio@xlibertine.com / TestPass123
Client 23: premium.tina@xlibertine.com / TestPass123
Client 24: premium.ugo@xlibertine.com / TestPass123
Client 25: premium.vera@xlibertine.com / TestPass123
```

### Cliente 21: CURTIR PERFIL
**Botões/Opções para testar:**
```
☐ Login: premium.rosa@xlibertine.com
☐ Em: /decouvrir
  ☐ Vê um perfil (ex: "Benjamin")
  ☐ Botão "Liker" (oco, branco)
  ☐ Clica "Liker"
    ☐ Botão fica vermelho ❤️
    ☐ Texto muda: "Liké"
    ☐ API POST /api/likes (sucesso 201) ✅
  ☐ Clica novamente (Unlike)
    ☐ Botão volta branco
    ☐ Texto muda: "Liker"
    ☐ API DELETE (sucesso 200) ✅
  ☐ Clica múltiplas vezes (toggle)
    ☐ Sempre togga corretamente ✅

✅ RESULTADO: Like/Unlike funciona
```

### Cliente 22: MEUS LIKES - VER LISTA
**Botões/Opções para testar:**
```
☐ Login: premium.sergio@xlibertine.com
☐ Faz alguns likes em /decouvrir
  ☐ Clica "Liker" em 3-4 perfis
  ☐ Botões ficam vermelhos ✅
☐ Vai para: /profil
  ☐ Vê secção "Meus Likes"
  ☐ Lista mostra 3-4 perfis que curtiu ✅
  ☐ Cada perfil tem:
    ☐ Avatar/Placeholder
    ☐ Username
    ☐ Botão "Retirer" (Unlike)
    ☐ Botão "Ver Profil" (optionnel)
  ☐ Clica "Retirer"
    ☐ Profil sai da lista ✅
    ☐ Contador decresce ✅

✅ RESULTADO: Meus Likes funciona
```

### Cliente 23: ADMIRADORES - VER QUEM CURTIU
**Botões/Opções para testar:**
```
☐ Login: premium.tina@xlibertine.com
☐ Vai para: /profil
  ☐ Vê secção "Meus Admiradores"
  ☐ Mostra quem curtiu votre profil
  ☐ Contador: "X Admiradores"
  ☐ Cada admirador mostra:
    ☐ Avatar/Placeholder
    ☐ Username
    ☐ Âge
    ☐ Localisation
    ☐ Botão "Liker de Volta" (optionnel)
    ☐ Botão "Ver Profil" (optionnel)
  ☐ Clica "Liker de Volta"
    ☐ Curtida enviada ✅
  ☐ Lista atualiza em tempo real (refresh)

✅ RESULTADO: Admiradores funciona
```

### Cliente 24: COMPATIBILIDADE MATCHES
**Botões/Opções para testar:**
```
☐ Login: premium.ugo@xlibertine.com
☐ Vai para: /profil
  ☐ Vê secção "Matches" (quando implementado)
  ☐ Mostra matches (pessoas que ambos se curtiram)
  ☐ Botão "Ver Conversation" (optionnel)
  ☐ Botão "Ir para Chat"

✅ RESULTADO: Matches funciona (quando pronto)
```

### Cliente 25: BLOQUEAR UTILIZADOR
**Botões/Opções para testar:**
```
☐ Login: premium.vera@xlibertine.com
☐ Em: /decouvrir
  ☐ Vê perfil que quer bloquer
  ☐ Botão "Bloquer" ou opções (menu)
  ☐ Confirmaction: "Tem a certeza?"
  ☐ Clica "Oui"
    ☐ Utilisateur bloqueado ✅
    ☐ Non aparece mais em discovery
  ☐ Vai para: /profil
  ☐ Vê secção "Bloqués" (optionnel)
  ☐ Mostra lista de bloqueados
  ☐ Botão "Desbloquer"
  ☐ Clica "Desbloquer"
    ☐ Utilisateur removido da lista ✅
    ☐ Aparece novamente em discovery

✅ RESULTADO: Bloqueio funciona
```

---

## 👥 GRUPO 26-35: GRUPOS (10 CLIENTES PREMIUM)

### Credenciais (Mix de PREMIUM mensuel e mensuel)
```
Client 26: premium.felix@xlibertine.com / TestPass123
Client 27: premium.gina@xlibertine.com / TestPass123
Client 28: premium.harry@xlibertine.com / TestPass123
Client 29: premium.iris@xlibertine.com / TestPass123
Client 30: premium.josh@xlibertine.com / TestPass123
Client 31: premium.kira@xlibertine.com / TestPass123
Client 32: premium.lucas@xlibertine.com / TestPass123
Client 33: premium.walter@xlibertine.com / TestPass123 (VIP)
Client 34: premium.xenia@xlibertine.com / TestPass123 (VIP)
Client 35: premium.yuri@xlibertine.com / TestPass123 (VIP)
```

### Cliente 26: CRIAR GRUPO
**Botões/Opções para testar:**
```
☐ Login: premium.felix@xlibertine.com
☐ Vai para: /groupes
  ☐ Botão "Criar Groupe" (ENABLED, não disabled)
  ☐ Clica "Criar Groupe"
    ☐ Modal abre ✅
  ☐ Formulário no modal:
    ☐ Input "Nome do Groupe"
      ☐ Preenche: "Groupe Teste 1"
    ☐ Textarea "Description"
      ☐ Preenche: "Groupe para testar funcionalidades"
    ☐ Dropdown "Catégorie"
      ☐ Seleciona: "Diversão"
    ☐ Input "Max Membros"
      ☐ Preenche: "20"
    ☐ Toggle "Privé?"
      ☐ Marca/Desmarca
    ☐ Botão "Annuler" (fecha modal)
    ☐ Botão "Criar Groupe" (cria)
      ☐ API POST /api/groups (201) ✅
      ☐ Modal fecha ✅
      ☐ Novo grupo aparece no topo da lista ✅
  ☐ Novo grupo mostra:
    ☐ Nome: "Groupe Teste 1"
    ☐ Description
    ☐ Membros: "1/20"
    ☐ Badge: "PRIVATE" ou "PUBLIC"

✅ RESULTADO: Criaction de grupo funciona
```

### Cliente 27: VER DETALHES GRUPO
**Botões/Opções para testar:**
```
☐ Login: premium.gina@xlibertine.com
☐ Em: /groupes
  ☐ Clica num grupo existente (não seu)
  ☐ Expande/Abre detalhes:
    ☐ Nom du groupe
    ☐ Description completa
    ☐ Admin: username do criador
    ☐ Membros: "X/20"
    ☐ Privacidade: "PRIVATE" ou "PUBLIC"
    ☐ Data criaction
  ☐ Botões disponíveis:
    ☐ "Juntar-se" (se não membro)
    ☐ "Ver Messages" (se membro)
    ☐ "Se déconnecter" (se membro)

✅ RESULTADO: Detalhes grupo visíveis
```

### Cliente 28: JUNTAR-SE A GRUPO
**Botões/Opções para testar:**
```
☐ Login: premium.harry@xlibertine.com
☐ Em: /groupes
  ☐ Vê um grupo public
  ☐ Botão "Juntar-se" (azul)
  ☐ Clica "Juntar-se"
    ☐ API PATCH /api/groups/join (200) ✅
    ☐ Botão muda para "Se déconnecter" ✅
    ☐ Contador: "2/20" (ou mais) ✅
    ☐ Agora é membro do grupo
  ☐ Botão "Ver Messages" ativa ✅
  ☐ Botão "Se déconnecter" ativa ✅

✅ RESULTADO: Juntar-se funciona
```

### Cliente 29: SAIR DE GRUPO
**Botões/Opções para testar:**
```
☐ Login: premium.iris@xlibertine.com
☐ Já membro de um grupo
☐ Em: /groupes
  ☐ Vê o grupo que está
  ☐ Botão "Se déconnecter" (vermelho ou cinzento)
  ☐ Clica "Se déconnecter"
    ☐ Confirmaction: "Tem a certeza?"
    ☐ Clica "Oui"
    ☐ API PATCH /api/groups/leave (200) ✅
    ☐ Botão muda para "Juntar-se" ✅
    ☐ Contador decresce: "3/20" → "2/20" ✅
    ☐ Já não é membro

✅ RESULTADO: Se déconnecter funciona
```

### Cliente 30-35: EDITAR GRUPO (admin)
**Botões/Opções para testar:**
```
☐ Login: premium.josh (30), premium.kira (31), premium.lucas (32)
☐ Em: /groupes
  ☐ Groupe que CRIARAM (admin)
  ☐ Botão "Modifier Groupe" (verde ou azul)
  ☐ Clica "Modifier"
    ☐ Modal/Page abre com formulário ✅
  ☐ Campos editáveis:
    ☐ Nome (muda: "Novo Nome")
    ☐ Description (muda: "Nova desc")
    ☐ Catégorie (muda: "Casual")
    ☐ Max Membros (muda: "30")
    ☐ Privacidade (toggle)
  ☐ Botão "Enregistrer"
    ☐ API PATCH /api/groups/:id (200) ✅
    ☐ Modal fecha ✅
    ☐ Groupe atualizado na lista ✅

☐ Botão "Deletar Groupe" (vermelho, com warning)
  ☐ Confirmaction: "Isto vai deletar permanentemente"
  ☐ Clica "Deletar"
    ☐ API DELETE /api/groups/:id (200) ✅
    ☐ Groupe removido da lista ✅

✅ RESULTADO: Modifier/Deletar funciona (3 clients testam)
```

### Clients 33-35 (VIP): ADMIN FUNCTIONS
**Botões/Opções para testar:**
```
☐ Login: premium.walter (33), premium.xenia (34), premium.yuri (35)
☐ Em: /groupes
  ☐ Como admin/VIP, testa:
    ☐ Botão "Bannir Membro" (em grupo meu)
    ☐ Confirmaction warning
    ☐ Membro removido e bloqueado ✅
    ☐ Botão "Promover Moderador"
    ☐ Membro fica mod ✅
    ☐ Botão "Demitir Moderador"
    ☐ Mod volta a member ✅

✅ RESULTADO: Admin functions funcionam
```

---

## 💬 GRUPO 36-45: CHAT & MENSAGENS (10 CLIENTES PREMIUM)

### Credenciais
```
Client 36: premium.alice@xlibertine.com (Client 11 + 26 = 2 PREMIUM)
Client 37: premium.ben@xlibertine.com
Client 38: premium.clara@xlibertine.com
Client 39: premium.daniel@xlibertine.com
Client 40: premium.eva@xlibertine.com
Client 41: premium.maya@xlibertine.com
Client 42: premium.nathan@xlibertine.com
Client 43: premium.osha@xlibertine.com
Client 44: premium.paul@xlibertine.com
Client 45: premium.quinn@xlibertine.com
```

### Cliente 36: VER CHAT (MEMBRO)
**Botões/Opções para testar:**
```
☐ Login: premium.alice@xlibertine.com
☐ Vai para: /groupes
  ☐ Participa em um grupo
  ☐ Clica "Ver Messages" ou no grupo
  ☐ URL: /chat/grupo-id
  ☐ Page carrega ✅
  ☐ Componentes visíveis:
    ☐ Nom du groupe (topo)
    ☐ Lista de mensagens (vazia ou com historique)
    ☐ Input para escrever mensagem (fundo)
    ☐ Botão "Envoyer" ou botão ➤
    ☐ Lista de membros (side/bottom)

✅ RESULTADO: Chat carrega
```

### Cliente 37: ENVIAR MENSAGEM
**Botões/Opções para testar:**
```
☐ Login: premium.ben@xlibertine.com
☐ Em: /chat/grupo-id
  ☐ Campo input vazio
  ☐ Clica no input
  ☐ Escreve: "Olá! Isto é um teste 🎉"
  ☐ Botão "Envoyer" ativa ✅
  ☐ Clica "Envoyer" ou pressiona Enter
    ☐ API POST /api/messages (201) ✅
    ☐ Message aparece no historique ✅
    ☐ Mostra:
      ☐ Username: "Ben"
      ☐ Message: "Olá! Isto é um teste 🎉"
      ☐ Timestamp: "14:32"
    ☐ Input limpa ✅
  ☐ Envoie outra: "Segunda mensagem"
    ☐ Aparece abaixo ✅

✅ RESULTADO: Envio de mensagens funciona
```

### Cliente 38: HISTÓRICO DE MENSAGENS
**Botões/Opções para testar:**
```
☐ Login: premium.clara@xlibertine.com
☐ Em: /chat/grupo-id (com historique)
  ☐ Scroll up (historique carrega)
  ☐ Botão "Carregar mais" ou auto-load ✅
  ☐ Messages mais antigas aparecem ✅
  ☐ Ordem: Antiga → Recente (cronológica) ✅
  ☐ Scroll down (vai a mensagens recentes)
  ☐ Auto-scroll para mensagem nova ✅
  ☐ Notificaction: "Nova mensagem" (se há)

✅ RESULTADO: Historique funciona
```

### Cliente 39: LISTA DE MEMBROS
**Botões/Opções para testar:**
```
☐ Login: premium.daniel@xlibertine.com
☐ Em: /chat/grupo-id
  ☐ Vê lista de membros (lado direito ou expandível)
  ☐ Botão "Membros" (toggle)
  ☐ Clica para expandir ✅
  ☐ Mostra lista:
    ☐ Admin (com ícone coroa)
    ☐ Members (com ícone user)
    ☐ Total: "X membros"
  ☐ Cada membro mostra:
    ☐ Username/Avatar
    ☐ Status online (se implementado)
    ☐ Menu (3 dots) com opções:
      ☐ "Ver Profil"
      ☐ "Bloquer" (se não admin)
      ☐ "Reportar" (se não admin)

✅ RESULTADO: Lista membros funciona
```

### Cliente 40: REAÇÕES A MENSAGENS
**Botões/Opções para testar:**
```
☐ Login: premium.eva@xlibertine.com
☐ Em: /chat/grupo-id
  ☐ Hover sobre uma mensagem
  ☐ Ícone de reaction (😊 emoji) aparece ✅
  ☐ Clica ícone
    ☐ Emoji picker abre (quando implementado)
    ☐ Seleciona: ❤️ (heart)
    ☐ Reaction adicionada à mensagem ✅
    ☐ Contador: "1 ❤️"
  ☐ Clica novamente
    ☐ Seu ❤️ removido (se era seu)
  ☐ Ver reações de outros
    ☐ Clica "1 ❤️" → vê quem reagiu

✅ RESULTADO: Reações funcionam (quando implementado)
```

### Cliente 41: EDITAR MENSAGEM (própria)
**Botões/Opções para testar:**
```
☐ Login: premium.maya@xlibertine.com
☐ Em: /chat/grupo-id
☐ Sua própria mensagem:
  ☐ Hover mostra botões (editar, deletar)
  ☐ Clica botão "Modifier" (lápis)
    ☐ Message fica editável (inline) ✅
    ☐ Input mostra conteúdo atual
    ☐ Clica "Enregistrer"
    ☐ Message atualizada ✅
    ☐ Mostra: "[Editada]" ou label similar
  ☐ Clica botão "Deletar" (lixo)
    ☐ Confirmaction: "Deletar?"
    ☐ Clica "Oui"
    ☐ Message removida ✅
    ☐ Mostra placeholder: "Message deletada"

✅ RESULTADO: Modifier/Deletar funciona
```

### Cliente 42: TIPAGEM EM TEMPO REAL (Typing Indicator)
**Botões/Opções para testar:**
```
☐ Login: premium.nathan@xlibertine.com
☐ Em: /chat/grupo-id
☐ Ao lado (outro client 43):
  ☐ Client 43 começa a escrever
  ☐ Client 42 vê: "Nathan está escrevendo..."
    ☐ Indicator com dots animados ✅
  ☐ Client 43 envoie mensagem
  ☐ Client 42 vê: Indicator desaparece
  ☐ Message aparece normalmente

✅ RESULTADO: Typing indicator funciona (quando implementado)
```

### Cliente 43-45: NOTIFICAÇÕES
**Botões/Opções para testar:**
```
☐ Login: premium.osha (43), premium.paul (44), premium.quinn (45)
☐ Saem de /chat/grupo-id
☐ Vão para /profil (fora do grupo)
☐ Outro client (42, 44, 45) envoie mensagem
☐ Notificações:
  ☐ Badge no ícone do grupo: "1 nova msg" ✅
  ☐ Push notification (se browser permite) ✅
  ☐ Email notification (se enabled) ✅
☐ Clica notificaction
  ☐ Redireciona a /chat/grupo-id ✅

✅ RESULTADO: Notificações funcionam
```

---

## 🔧 GRUPO 46-50: EDGE CASES & BUGS (5 CLIENTES MIX)

### Credenciais (Mix FREE + PREMIUM)
```
Client 46: client.kate@xlibertine.com / TestPass123 (FREE)
Client 47: client.liam@xlibertine.com / TestPass123 (FREE)
Client 48: premium.felix@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 49: premium.gina@xlibertine.com / TestPass123 (PREMIUM mensuel)
Client 50: premium.harry@xlibertine.com / TestPass123 (PREMIUM mensuel)
```

### Cliente 46: CASOS DE ERRO - PASSWORD FRACA
**Testes:**
```
☐ Vai para: /register
  ☐ Preenche: Email (novo)
  ☐ Preenche Mot de passe: "123"
  ☐ Botão "Criar" tenta
  ☐ Erro: "Minimum 8 caracteres" ✅
  ☐ Botão permanece desabilitado até validar

☐ Preenche Mot de passe: "Pass"
  ☐ Erro: "Minimum 8 caracteres" ✅

☐ Preenche Mot de passe: "TestPass123"
  ☐ Erro desaparece ✅
  ☐ Validaction em tempo real (debounce)

✅ RESULTADO: Validaction mot de passe funciona
```

### Cliente 47: CASOS DE ERRO - EMAIL DUPLICADO
**Testes:**
```
☐ Vai para: /register
  ☐ Preenche: Email: "client.alice@xlibertine.com" (já existe)
  ☐ Resto dos fields
  ☐ Clica "Criar"
  ☐ Erro: "Email já registado" ✅
  ☐ Botão desabilitado ou pode-se corrigir

✅ RESULTADO: Validaction email duplicado funciona
```

### Cliente 48: RESPONSIVIDADE MOBILE
**Testes (em iPhone/móvel):**
```
☐ Toutes as páginas responsive:
  ☐ /login - Input alinhados, botão grande ✅
  ☐ /profil - Dados empilhados, lê bem ✅
  ☐ /decouvrir - Grid 1 coluna, swipe ✅
  ☐ /groupes - Lista, botões grandes ✅
  ☐ /chat - Input full width, mensagens leem ✅

☐ Touch eventos funcionam:
  ☐ Cliques (tap) funcionam ✅
  ☐ Swipe (se implementado) funciona ✅
  ☐ Scroll é smooth ✅

☐ Orientaction:
  ☐ Landscape → UI ajusta ✅
  ☐ Portrait → UI ajusta ✅

✅ RESULTADO: Mobile OK
```

### Cliente 49: PERFORMANCE & CARREGAMENTO
**Testes:**
```
☐ Tempo de carregamento (F12 → Network):
  ☐ /decouvrir carrega em <2s ✅
  ☐ Imagens load lazy (placeholders first) ✅
  ☐ /chat carrega historique progressivo ✅

☐ Memory:
  ☐ Sem memory leaks (DevTools) ✅
  ☐ Scroll longo não degrada performance ✅

☐ Rendering:
  ☐ 60 FPS quando possível ✅
  ☐ Smooth animations ✅

✅ RESULTADO: Performance OK
```

### Cliente 50: SEGURANÇA & ATAQUES
**Testes:**
```
☐ SQL Injection:
  ☐ Input campo: '; DROP TABLE users; --
  ☐ Erro tratado, sem SQL injection ✅

☐ XSS (Cross-Site Scripting):
  ☐ Input campo: <script>alert('xss')</script>
  ☐ Renderizado como texto, não executado ✅

☐ CSRF:
  ☐ POST requests precisam de token ✅
  ☐ Sem token, rejeita ✅

☐ Token Theft:
  ☐ Tenta copiar auth_token
  ☐ Mesmo com token, não consegue fazer ações (httpOnly) ✅

☐ Acessar dados de outro user:
  ☐ Tenta /profil/outro-user
  ☐ Redireciona/Erro ✅
  ☐ API reject se não autorizado ✅

✅ RESULTADO: Segurança OK
```

---

## 📊 MATRIZ DE TESTE FINAL

| Groupe | Clientes | Foco | Test Cases | Tempo |
|-------|----------|------|-----------|-------|
| 1-5 | 5 | Autenticaction | 10 | 30 min |
| 6-10 | 5 | Paywall | 10 | 25 min |
| 11-20 | 10 | Discovery + Filtres | 20 | 45 min |
| 21-25 | 5 | Likes + Admiradores | 10 | 25 min |
| 26-35 | 10 | Groupes | 20 | 50 min |
| 36-45 | 10 | Chat + Messages | 20 | 50 min |
| 46-50 | 5 | Edge Cases + Security | 15 | 30 min |
| **TOTAL** | **50** | **7 Áreas** | **105** | **3h 15min** |

---

## ✅ CHECKLIST POR CLIENTE

Cada cliente tem:
```
[ ] Username logado corretamente
[ ] Abonnement verificada
[ ] Tous botões clicáveis
[ ] Sem errors no console (F12)
[ ] UI responsive (testado em mobile)
[ ] Sem timeout (carrega em <5s)
[ ] Messages de erro claras
[ ] Validações funcionam
[ ] API calls bem sucedidas
[ ] RLS não permite acesso indevido
```

---

## 📝 COMO REPORTAR BUGS

Cada cliente que encontrar bug:
```
1. Anota o passo EXATO
2. Captura screenshot
3. Abre F12 → Console → copia errors
4. Tira print do Network tab
5. Envoie em: testing@xlibertine.com
   Assunto: "[BUG] Nome do bug"
   Body: Passo + Screenshot + Console errors
```

---

## 🎯 RESULTADO ESPERADO

Após os 50 clientes testarem:

```
✅ Autenticaction:     100% (5 clientes)
✅ Paywall:          100% (5 clientes)
✅ Discovery:        100% (10 clientes)
✅ Likes:            100% (5 clientes)
✅ Groupes:           95% (10 clientes)
✅ Chat:             90% (10 clientes)
✅ Security:         100% (5 clientes)

🎉 MÉDIA GERAL:      96% FUNCIONAL

PRONTO PARA PRODUÇÃO
```

---

**Data:** 09/08/2026  
**Total de testes:** 105 (7 áreas × múltiplos casos)  
**Duraction:** ~3 heures  
**50 Clientes Testando Ouiultaneamente** ✅
