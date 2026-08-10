# 🧪 TESTE DO SITE EM PRODUÇÃO - xlibertine.com

**Data:** 10 de Agosto de 2026  
**Domínio:** https://xlibertine.com  
**Status:** Precisa de verificação manual

---

## ⚠️ NOTA IMPORTANTE

Não consigo fazer requests diretos de produção do ambiente atual (rede bloqueada). Mas aqui está um **CHECKLIST COMPLETO** para testar manualmente o site em produção:

---

## 🧪 TESTE MANUAL - CHECKLIST COMPLETO

### **PASSO 1: ACEDER AO SITE**

**URL:** https://xlibertine.com

```
☐ Site carrega (sem erro 500)
☐ Página branca/cinzenta aparece
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
☐ Password input visível
☐ Botão "Se Connecter" visível
☐ Link "Mot de passe oublié?" visível

Preenche:
☐ Email: client.alice@xlibertine.com
☐ Password: TestPass123
☐ Clica "Se Connecter"

Resultado Esperado:
✅ Redireciona para /profil
✅ Navbar mostra "Alice" (username)
✅ localStorage tem "auth_token"
✅ Sem erros no console
```

#### **2.2 Ver Perfil**
```
Já está em: /profil

☐ Username: Alice_Free
☐ Email: client.alice@xlibertine.com
☐ Subscrição: FREE
☐ Localização: (visível)
☐ Botão "Logout" visível

Resultado:
✅ Perfil carrega em <2s
✅ Dados estão corretos
```

---

### **PASSO 3: TESTE PAYWALL (FREE USER)**

#### **3.1 Tenta /decouvrir (BLOQUEADO)**
```
URL: https://xlibertine.com/decouvrir

Resultado Esperado:
☐ Vê: Lock Screen 🔒
☐ Título: "Descobrir Perfis"
☐ Ícone: Lock vermelho
☐ Mensagem: "Apenas Premium"
☐ Descrição paywall visível
☐ Botão: "Fazer Upgrade para Premium" (clicável)
☐ Clica upgrade → vai para /abonnements (ou modal)

Status:
✅ PAYWALL FUNCIONANDO
```

#### **3.2 Tenta Criar Grupo (BLOQUEADO)**
```
URL: https://xlibertine.com/groupes

☐ Página carrega
☐ Lista de grupos vazia (ou com existentes)
☐ Botão "Criar Grupo" está DISABLED
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
☐ Password: TestPass123
☐ Clica "Se Connecter"

Resultado:
✅ Redireciona para /profil
✅ Navbar mostra "Maya"
✅ Subscrição: PREMIUM_12M (visível no perfil)
```

#### **4.2 Discovery - /decouvrir (DESBLOQUEADO)**
```
URL: https://xlibertine.com/decouvrir

Página Carrega:
☐ Grid de perfis visível (20 perfis)
☐ Cada perfil mostra:
   ├─ Avatar/Placeholder
   ├─ Username
   ├─ Idade
   ├─ Localização
   ├─ Género/Orientação
   └─ Botão "Curtir"

Secção de Filtros:
☐ Dropdown Localização
☐ Sliders Idade (Min/Max)
☐ Dropdown Género
☐ Dropdown Orientação

Resultado Esperado:
✅ Sem lock screen
✅ Perfis carregam em <1s
✅ Grid renderiza corretamente
✅ Filtros presentes e clicáveis
```

#### **4.3 Testar Filtro Localização**
```
Dropdown "Localização":
☐ Abre dropdown
☐ Opções visíveis:
   - Todas
   - Paris
   - Lyon
   - Bordeaux
   - Côte d'Azur
   - Bruxelas
   - Luxembourg

Seleciona "Paris":
☐ Grid recarrega em <1s
☐ Perfis mostram só de Paris
☐ Label atualiza: "Localização: Paris"
☐ Página reseta para 1

Seleciona "Lyon":
☐ Grid recarrega
☐ Só perfis de Lyon

Seleciona "Todas":
☐ Grid volta ao mix

Status:
✅ FILTRO FUNCIONANDO
```

#### **4.4 Testar Like/Curtir**
```
Em: /decouvrir

Seleciona um perfil:
☐ Vê botão "Curtir" (oco, branco)
☐ Clica "Curtir"

Esperado:
☐ Botão fica vermelho ❤️
☐ Texto muda: "Curtido"
☐ API POST /api/likes executada

Clica Novamente:
☐ Botão volta branco
☐ Texto muda: "Curtir"
☐ Like removido

Status:
✅ LIKE/UNLIKE FUNCIONANDO
```

#### **4.5 Testar Grupos**
```
URL: https://xlibertine.com/groupes

Página Carrega:
☐ Lista de grupos (vazia ou com existentes)
☐ Botão "Criar Grupo" está ENABLED
☐ Botão tem cor (não desabilitado)

Clica "Criar Grupo":
☐ Modal abre
☐ Formulário visible:
   ├─ Input "Nome do Grupo"
   ├─ Textarea "Descrição"
   ├─ Dropdown "Categoria"
   ├─ Input "Max Membros"
   ├─ Toggle "Privado?"
   └─ Botões: Cancelar, Criar

Preenche:
☐ Nome: "Teste 001"
☐ Descrição: "Grupo de teste"
☐ Categoria: "Diversão"
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
☐ Password: TestPass123
☐ Clica "Se Connecter"

Resultado:
✅ Redireciona para /profil
✅ Username: Marie_Agent
✅ Subscrição: VIP_24M
```

#### **5.2 Aceder /admin**
```
URL: https://xlibertine.com/admin

Página Carrega:
☐ Header: "Painel de Admin"
☐ 4 Cards de Estatísticas:
   ├─ Total de Utilizadores: 53+
   ├─ Online Agora: X (número)
   ├─ Grupos Ativos: 8+
   └─ Interações (Likes): 1000+
☐ Breakdown de Subscrições:
   ├─ FREE: 25
   ├─ PREMIUM_3M: 12
   ├─ PREMIUM_12M: 10
   └─ VIP_24M: 3

Status:
✅ DASHBOARD CARREGA
✅ ESTATÍSTICAS VISÍVEIS
```

#### **5.3 Gestão de Utilizadores**
```
Em: /admin

Input de Busca:
☐ "Procurar por username..." visível
☐ Digita: "alice"
☐ Pressiona Enter

Tabela de Utilizadores:
☐ Aparece: alice | alice@test.com | FREE | ATIVO
☐ Botão "Banir" visível (vermelho)

Clica "Banir":
☐ Popup: "Tem a certeza que quer banir alice?"
☐ Botões: Sim, Não

Clica "Sim":
☐ API executa
☐ Tabela atualiza
☐ Status muda: BANIDO (vermelho)

Clica "Desbanir":
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

Orientação:
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
☐ Todas 200 OK (ou 304 Cached)
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
║  ✅ Discovery + Filtros OK                     ║
║  ✅ Likes OK                                   ║
║  ✅ Grupos OK                                  ║
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
1. **Página:** Qual página estava
2. **Ação:** O que fez
3. **Esperado:** O que deveria aparecer
4. **Obtido:** O que apareceu
5. **Console:** Copia erros (F12)
6. **Screenshot:** Tira print

Envia para: testing@xlibertine.com

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
☐ Filtro localização funciona
☐ Like funciona
☐ Criar grupo funciona
☐ Login AGENT funciona
☐ /admin carrega
☐ Admin dashboard mostra stats
☐ Banir user funciona
☐ Mobile responsive
☐ Console sem erros

✅ SE TUDO PASSOU: SITE PRONTO
```

---

**TESTA MANUALMENTE E REPORTA RESULTADOS! 🚀**

Se tudo passar no domínio xlibertine.com, o site está **100% pronto para produção** com os 50 clientes testarem!
