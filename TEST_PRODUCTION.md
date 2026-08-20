# 🧪 TESTE DO SITE EM PRODUÇÃO - xlibertine.com

**Data:** 10 de Agosto de 2026  
**Domínio:** https://xlibertine.com  
**Status:** Precisa de verificaction manual

---

## ⚠️ NOTA IMPORTANTE

Non consigo fazer requests diretos de produção do ambiente atual (rede bloqueada). Mas aqui está um **CHECKLIST COMPLETO** para testar manualmente o site em produção:

---

## 🧪 TESTE MANUAL - CHECKLIST COMPLETO

### **PASSO 1: ACEDER AO SITE**

**URL:** https://xlibertine.com

```
☐ Site carrega (sem erro 500)
☐ Page branca/cinzenta aparece
☐ CSS carrega (cores visíveis)
☐ Logo/header visível
☐ Navbar mostra links
☐ Nenhum erro no console (F12)
```

**Esperado:**
```
✅ Homepage com:
   - Título: "xlibertine"
   - Link "Se Connecter" (login)
   - Link "Rejoindre" (registro)
   - Cores tema: roxo/rosa
   - Responsive (testa em mobile)
```

---

### **PASSO 2: TESTE DE AUTENTICAÇÃO**

#### **2.1 Login com Credencial FREE**
```
URL: https://xlibertine.com/login

☐ Email input visível
☐ Mot de passe input visível
☐ Botão "Se Connecter" visível
☐ Link "Mot de passe oublié?" visível

Preenche:
☐ Email: client.alice@xlibertine.com
☐ Mot de passe: TestPass123
☐ Clica "Se Connecter"

Resultado Esperado:
✅ Redireciona para /profil
✅ Navbar mostra "Alice" (username)
✅ localStorage tem "auth_token"
✅ Sem erros no console
```

#### **2.2 Ver Profil**
```
Já está em: /profil

☐ Username: Alice_Free
☐ Email: client.alice@xlibertine.com
☐ Abonnement: FREE
☐ Localisation: (visível)
☐ Botão "Logout" visível

Resultado:
✅ Profil carrega em <2s
✅ Dados estão corretos
```

---

### **PASSO 3: TESTE PAYWALL (FREE USER)**

#### **3.1 Tenta /decouvrir (BLOQUEADO)**
```
URL: https://xlibertine.com/decouvrir

Resultado Esperado:
☐ Vê: Lock Screen 🔒
☐ Título: "Découvrir les profils"
☐ Ícone: Lock vermelho
☐ Message: "Apenas Premium"
☐ Description paywall visível
☐ Botão: "Passer à Premium" (clicável)
☐ Clica upgrade → vai para /abonnements (ou modal)

Status:
✅ PAYWALL FUNCIONANDO
```

#### **3.2 Tenta Criar Groupe (BLOQUEADO)**
```
URL: https://xlibertine.com/groupes

☐ Page carrega
☐ Lista de grupos vazia (ou com existentes)
☐ Botão "Criar Groupe" está DISABLED
☐ Hover mostra "Premium only" (tooltip)
☐ Cor do botão diferente (cinzento/desabilitado)

Status:
✅ BLOQUEADO CORRETAMENTE
```

---

### **PASSO 4: LOGIN PREMIUM E TESTAR FEATURES**

#### **4.1 Logout e Login como PREMIUM**
```
Logout:
☐ Clica "Logout"
☐ Redireciona para /login ✅

Login:
☐ Email: premium.maya@xlibertine.com
☐ Mot de passe: TestPass123
☐ Clica "Se Connecter"

Resultado:
✅ Redireciona para /profil
✅ Navbar mostra "Maya"
✅ Abonnement: PASS_PRIVILEGE (visível no perfil)
```

#### **4.2 Discovery - /decouvrir (DESBLOQUEADO)**
```
URL: https://xlibertine.com/decouvrir

Page Carrega:
☐ Grid de perfis visível (20 perfis)
☐ Cada perfil mostra:
   ├─ Avatar/Placeholder
   ├─ Username
   ├─ Âge
   ├─ Localisation
   ├─ Genre/Orientaction
   └─ Botão "Liker"

Secção de Filtres:
☐ Dropdown Localisation
☐ Sliders Âge (Min/Max)
☐ Dropdown Genre
☐ Dropdown Orientaction

Resultado Esperado:
✅ Sem lock screen
✅ Profils carregam em <1s
✅ Grid renderiza corretamente
✅ Filtres presentes e clicáveis
```

#### **4.3 Testar Filtro Localisation**
```
Dropdown "Localisation":
☐ Abre dropdown
☐ Opções visíveis:
   - Toutes
   - Paris
   - Lyon
   - Bordeaux
   - Côte d'Azur
   - Bruxelas
   - Luxembourg

Seleciona "Paris":
☐ Grid recarrega em <1s
☐ Profils mostram só de Paris
☐ Label atualiza: "Localisation: Paris"
☐ Page réinitialisationa para 1

Seleciona "Lyon":
☐ Grid recarrega
☐ Só perfis de Lyon

Seleciona "Toutes":
☐ Grid volta ao mix

Status:
✅ FILTRO FUNCIONANDO
```

#### **4.4 Testar Like/Liker**
```
Em: /decouvrir

Seleciona um perfil:
☐ Vê botão "Liker" (oco, branco)
☐ Clica "Liker"

Esperado:
☐ Botão fica vermelho ❤️
☐ Texto muda: "Liké"
☐ API POST /api/likes executada

Clica Novamente:
☐ Botão volta branco
☐ Texto muda: "Liker"
☐ Like removido

Status:
✅ LIKE/UNLIKE FUNCIONANDO
```

#### **4.5 Testar Groupes**
```
URL: https://xlibertine.com/groupes

Page Carrega:
☐ Lista de grupos (vazia ou com existentes)
☐ Botão "Criar Groupe" está ENABLED
☐ Botão tem cor (não desabilitado)

Clica "Criar Groupe":
☐ Modal abre
☐ Formulário visible:
   ├─ Input "Nome do Groupe"
   ├─ Textarea "Description"
   ├─ Dropdown "Catégorie"
   ├─ Input "Max Membros"
   ├─ Toggle "Privé?"
   └─ Botões: Annuler, Criar

Preenche:
☐ Nome: "Teste 001"
☐ Description: "Groupe de teste"
☐ Catégorie: "Diversão"
☐ Max Membros: 20

Clica "Criar":
☐ Modal fecha
☐ Novo grupo aparece no topo da lista
☐ Seu username é admin

Status:
✅ GRUPO CRIADO COM SUCESSO
```

---

### **PASSO 5: ADMIN DASHBOARD**

#### **5.1 Logout e Login como AGENT**
```
Logout de Maya:
☐ Clica "Logout"

Login como Agent:
☐ Email: agent.marie@xlibertine.com
☐ Mot de passe: TestPass123
☐ Clica "Se Connecter"

Resultado:
✅ Redireciona para /profil
✅ Username: Marie_Agent
✅ Abonnement: PASS_VIP
```

#### **5.2 Aceder /admin**
```
URL: https://xlibertine.com/admin

Page Carrega:
☐ Header: "Painel de Admin"
☐ 4 Cards de Statistiques:
   ├─ Total de Utilisateurs: 53+
   ├─ Online Agora: X (número)
   ├─ Groupes Ativos: 8+
   └─ Interactions (Likes): 1000+
☐ Breakdown de Abonnements:
   ├─ FREE: 25
   ├─ PASS_EPICURIEN: 12
   ├─ PASS_PRIVILEGE: 10
   └─ PASS_VIP: 3

Status:
✅ DASHBOARD CARREGA
✅ ESTATÍSTICAS VISÍVEIS
```

#### **5.3 Gestion des utilisateurs**
```
Em: /admin

Input de Busca:
☐ "Rechercher por username..." visível
☐ Digita: "alice"
☐ Pressiona Enter

Tabela de Utilisateurs:
☐ Aparece: alice | alice@test.com | FREE | ATIVO
☐ Botão "Bannir" visível (vermelho)

Clica "Bannir":
☐ Popup: "Tem a certeza que quer bannir alice?"
☐ Botões: Oui, Non

Clica "Oui":
☐ API executa
☐ Tabela atualiza
☐ Status muda: BANIDO (vermelho)

Clica "Desbannir":
☐ Status volta: ATIVO (verde)

Status:
✅ ADMIN DASHBOARD FUNCIONANDO
```

---

### **PASSO 6: RESPONSIVIDADE MOBILE**

**Em iPhone ou Device Mobile:**

```
☐ /login responsive (inputs grandes, botão full width)
☐ /profil responsive (dados empilhados)
☐ /decouvrir responsive (grid 1 coluna, scrollável)
☐ /groupes responsive (lista compacta)
☐ /admin responsive (tabela horizontal scroll)

Orientaction:
☐ Portrait: Layout reajusta
☐ Landscape: Layout reajusta

Toque/Touch:
☐ Botões clicáveis (tamanho mínimo 44px)
☐ Sem horizontal scroll (exceto tabelas)
☐ Scroll smooth

Status:
✅ MOBILE OK
```

---

### **PASSO 7: PERFORMANCE**

**DevTools (F12) → Network Tab:**

```
Carregamentos:
☐ /login: < 2s
☐ /profil: < 2s
☐ /decouvrir: < 2s (com 20 perfis)
☐ /admin: < 2s

Imagens:
☐ Lazy loading ativo (placeholders primeiro)
☐ Sem imagens grandes

CSS/JS:
☐ Tamanho razoável
☐ Sem ficheiros duplicados

Status:
✅ PERFORMANCE OK
```

**DevTools (F12) → Console:**

```
Erros:
☐ 0 erros vermelhos
☐ 0 warnings críticos
☐ Só info/debug (aceitável)

Network Requests:
☐ Toutes 200 OK (ou 304 Cached)
☐ Nenhum 404 Not Found
☐ Nenhum 500 Error

Status:
✅ CONSOLE LIMPO
```

---

### **PASSO 8: SEGURANÇA**

```
Tenta SQL Injection:
☐ Input field: '; DROP TABLE users; --
☐ Renderizado como texto (não executado)

Tenta XSS:
☐ Input field: <script>alert('xss')</script>
☐ Renderizado como texto (não executado)

Copia auth_token:
☐ localStorage → auth_token
☐ Tenta usar em outro browser
☐ Sem acesso (httpOnly cookie seguro)

Status:
✅ SEGURANÇA OK
```

---

## 📊 RESULTADO ESPERADO

```
╔════════════════════════════════════════════════╗
║                                                ║
║     TESTE DE PRODUÇÃO - xlibertine.com        ║
║                                                ║
║  ✅ Site Online                                ║
║  ✅ Login/Logout OK                            ║
║  ✅ Paywall Funcionando                        ║
║  ✅ Discovery + Filtres OK                     ║
║  ✅ Likes OK                                   ║
║  ✅ Groupes OK                                  ║
║  ✅ Admin Dashboard OK                        ║
║  ✅ Mobile Responsive                          ║
║  ✅ Performance OK (<2s)                       ║
║  ✅ Segurança OK                               ║
║  ✅ 0 Erros no Console                         ║
║                                                ║
║  TAXA GERAL: 100% ✅                           ║
║                                                ║
║  🎉 SITE PRONTO PARA PRODUÇÃO                  ║
║                                                ║
╚════════════════════════════════════════════════╝
```

---

## 🐛 SE ENCONTRAR BUGS

Anota:
1. **Page:** Qual página estava
2. **Action:** O que fez
3. **Esperado:** O que deveria aparecer
4. **Obtido:** O que apareceu
5. **Console:** Copia erros (F12)
6. **Screenshot:** Tira print

Envoie para: testing@xlibertine.com

---

## 📝 CHECKLIST RESUMIDO (Quick Test)

```
☐ Site carrega
☐ Login FREE funciona
☐ /decouvrir bloqueado ✅
☐ /groupes botão disabled ✅
☐ Logout funciona
☐ Login PREMIUM funciona
☐ /decouvrir desbloqueado ✅
☐ Discovery mostra 20 perfis
☐ Filtro localizaction funciona
☐ Like funciona
☐ Criar grupo funciona
☐ Login AGENT funciona
☐ /admin carrega
☐ Admin dashboard mostra stats
☐ Bannir user funciona
☐ Mobile responsive
☐ Console sem erros

✅ SE TUDO PASSOU: SITE PRONTO
```

---

**TESTA MANUALMENTE E REPORTA RESULTADOS! 🚀**

Se tudo passar no domínio xlibertine.com, o site está **100% pronto para produção** com os 50 clientes testarem!
