# 🚀 EXECUÇÃO - 50 CLIENTES TESTANDO SIMULTÂNEAMENTE

**Data:** 09/08/2026  
**Duração:** 3 horas  
**Clientes:** 50 (+ 3 agentes)  
**Status:** Teste Distribuído em Paralelo

---

## 📋 ORGANIZAÇÃO

```
┌─────────────────────────────────────────────────────┐
│         50 CLIENTES - 7 GRUPOS DE TESTE             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  GRUPO 1-5 (Autenticação)          [5 clientes]    │
│  ├─ Client 1: Registro                             │
│  ├─ Client 2: Login                                │
│  ├─ Client 3: Perfil & Logout                      │
│  ├─ Client 4: Password Reset (Request)             │
│  └─ Client 5: Password Reset (Confirmar)           │
│                                                     │
│  GRUPO 6-10 (Paywall)              [5 clientes]    │
│  ├─ Client 6: /decouvrir bloqueado                 │
│  ├─ Client 7: /chat bloqueado                      │
│  ├─ Client 8: Criar Grupo bloqueado                │
│  ├─ Client 9: Upload Foto bloqueado                │
│  └─ Client 10: /eventos bloqueado                  │
│                                                     │
│  GRUPO 11-20 (Discovery)           [10 clientes]   │
│  ├─ Client 11: Página básica                       │
│  ├─ Client 12: Filtro Localização                  │
│  ├─ Client 13: Filtro Idade                        │
│  ├─ Client 14: Filtro Género                       │
│  ├─ Client 15: Filtro Orientação                   │
│  ├─ Client 16: Filtros Combinados                  │
│  ├─ Client 17: Paginação (Botões)                  │
│  └─ Clients 18-20: Paginação + Filtros             │
│                                                     │
│  GRUPO 21-25 (Likes)               [5 clientes]    │
│  ├─ Client 21: Curtir Perfil                       │
│  ├─ Client 22: Meus Likes                          │
│  ├─ Client 23: Admiradores                         │
│  ├─ Client 24: Matches (quando pronto)             │
│  └─ Client 25: Bloquear Utilizador                 │
│                                                     │
│  GRUPO 26-35 (Grupos)              [10 clientes]   │
│  ├─ Client 26: Criar Grupo                         │
│  ├─ Client 27: Ver Detalhes                        │
│  ├─ Client 28: Juntar-se Grupo                     │
│  ├─ Client 29: Sair de Grupo                       │
│  └─ Clients 30-35: Editar/Deletar/Admin            │
│                                                     │
│  GRUPO 36-45 (Chat)                [10 clientes]   │
│  ├─ Client 36: Ver Chat (Membro)                   │
│  ├─ Client 37: Enviar Mensagem                     │
│  ├─ Client 38: Histórico                           │
│  ├─ Client 39: Lista Membros                       │
│  ├─ Client 40: Reações                             │
│  ├─ Client 41: Editar Mensagem                     │
│  ├─ Client 42: Typing Indicator                    │
│  └─ Clients 43-45: Notificações                    │
│                                                     │
│  GRUPO 46-50 (Edge Cases)          [5 clientes]    │
│  ├─ Client 46: Password Fraca                      │
│  ├─ Client 47: Email Duplicado                     │
│  ├─ Client 48: Responsividade Mobile               │
│  ├─ Client 49: Performance                         │
│  └─ Client 50: Segurança                           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 PASSO A PASSO - COMO COMEÇAR

### **ANTES DE INICIAR (5 min)**

```
1. Insere 53 utilizadores (3 agentes + 50 clientes)
   ✅ Ver: TESTE_USUARIOS.sql

2. Verifica Supabase está online
   ✅ https://app.supabase.com

3. Verifica xlibertine.com está online
   ✅ https://xlibertine.com

4. Cria grupo/chat para coordenação
   ✅ Telegram, Discord, Slack, etc

5. Distribui documentação aos clientes
   ✅ TESTE_50_CLIENTES_DISTRIBUIDO.md
   ✅ TESTING_CHECKLIST.md
```

### **DURANTE (Sincronizado)**

```
⏰ 00:00 - Aviso: "Teste começa em 5 minutos"
   └─ Todos preparam navegador

⏰ 00:05 - START: Todos começam simultaneamente
   └─ Grupos 1-5: Fazem login/logout
   └─ Grupos 6-10: Testam paywall
   └─ Grupos 11-20: Testam discovery
   └─ Grupos 21-25: Testam likes
   └─ Grupos 26-35: Testam grupos
   └─ Grupos 36-45: Testam chat
   └─ Grupos 46-50: Testam edge cases

⏰ 01:00 - Check-in (30 min)
   └─ Coordenador verifica progresso
   └─ Resolve problemas técnicos

⏰ 02:00 - Final stretch (última hora)
   └─ Concentra-se em bugs não encontrados
   └─ Repe testes críticos

⏰ 03:00 - STOP: Teste termina
   └─ Recolhe resultados
   └─ Compila bugs encontrados
```

---

## 📱 EXEMPLO: CLIENT 12 - TESTE DE FILTRO LOCALIZAÇÃO

### Credencial
```
Email: premium.ben@xlibertine.com
Password: TestPass123
```

### Checklist Executável

```
PASSO 1: LOGIN
══════════════════════════════════════════════════════

☐ Abre: https://xlibertine.com/login
☐ Preenche Email: premium.ben@xlibertine.com
☐ Preenche Password: TestPass123
☐ Clica "Se Connecter"
☐ Aguarda redirecionamento para /profil
☐ Verifica navbar mostra "Ben" ✅

TEMPO ESTIMADO: 30 segundos


PASSO 2: VÁ PARA DISCOVERY
═════════════════════════════════════════════════════

☐ Clica menu → "Descobrir"
☐ OU Vai direto: https://xlibertine.com/decouvrir
☐ Aguarda página carregar (deve carregar em <2s)
☐ Vê grid de 20 perfis
☐ Vê secção de filtros no topo ✅

TEMPO ESTIMADO: 30 segundos


PASSO 3: TESTE FILTRO LOCALIZAÇÃO
═════════════════════════════════════════════════════

☐ Localiza dropdown "Localização"
☐ Clica para abrir dropdown
☐ Vê opções:
   ☐ Todas
   ☐ Paris
   ☐ Lyon
   ☐ Bordeaux
   ☐ Côte d'Azur
   ☐ Bruxelas
   ☐ Luxembourg

☐ Seleciona: "Paris"
  ☐ Grid recarrega em <1s ✅
  ☐ Mostra ~6 perfis (apenas Paris)
  ☐ Cada perfil tem localização "Paris"
  ☐ Página reseta para 1
  ┌─ RESULTADO: ✅ FUNCIONANDO

☐ Seleciona: "Lyon"
  ☐ Grid recarrega em <1s ✅
  ☐ Mostra ~6 perfis (apenas Lyon)
  ☐ Cada perfil tem localização "Lyon"
  ┌─ RESULTADO: ✅ FUNCIONANDO

☐ Seleciona: "Bordeaux"
  ☐ Grid recarrega em <1s ✅
  ☐ Mostra ~6 perfis (apenas Bordeaux)
  ┌─ RESULTADO: ✅ FUNCIONANDO

☐ Seleciona: "Côte d'Azur"
  ☐ Grid recarrega em <1s ✅
  ☐ Mostra alguns perfis (Côte d'Azur)
  ┌─ RESULTADO: ✅ FUNCIONANDO

☐ Seleciona: "Bruxelas"
  ☐ Grid recarrega em <1s ✅
  ┌─ RESULTADO: ✅ FUNCIONANDO

☐ Seleciona: "Luxembourg"
  ☐ Grid recarrega em <1s ✅
  ┌─ RESULTADO: ✅ FUNCIONANDO

☐ Seleciona: "Todas"
  ☐ Grid recarrega em <1s ✅
  ☐ Mostra mix de todas as cidades
  ☐ Página reseta para 1
  ┌─ RESULTADO: ✅ FUNCIONANDO

TEMPO ESTIMADO: 5 minutos


PASSO 4: VERIFICA CONSOLA (F12)
═════════════════════════════════════════════════════

☐ Abre DevTools: F12
☐ Vai para aba "Console"
☐ Procura erros (red messages)
  ☐ Esperado: NENHUM erro ✅
  ☐ Se houver erro, anota:
    ┌─ Screenshot do erro
    ┌─ Qual filtro causou
    ┌─ URL da página

☐ Verifica Network (aba "Network")
  ☐ Cada mudança de filtro faz GET /api/discovery ✅
  ☐ Status: 200 OK
  ☐ Tempo: <1s por request ✅

TEMPO ESTIMADO: 2 minutos


RESUMO FINAL
═════════════════════════════════════════════════════

☑️  LOGIN FEITO
☑️  DISCOVERY CARREGOU
☑️  7 FILTROS TESTADOS (Paris, Lyon, Bordeaux, Côte d'Azur, Bruxelas, Luxembourg, Todas)
☑️  CADA FILTRO FUNCIONA CORRETAMENTE
☑️  GRID RECARREGA EM <1s
☑️  CONSOLA SEM ERROS
☑️  NETWORK REQUESTS OK

✅ TESTE PASSADO COM SUCESSO!

TEMPO TOTAL: ~8 minutos
BUGS ENCONTRADOS: 0
```

---

## 🔴 EXEMPLO: SE ENCONTRAR BUG

```
BUG ENCONTRADO NO CLIENTE 12
═════════════════════════════════════════════════════

Tipo: Filtro Localização Não Funciona

Passo:
  1. Login: premium.ben@xlibertine.com
  2. Vai para /decouvrir
  3. Dropdown Localização em "Paris"
  4. Grid não recarrega
  5. Mostra ainda perfis de outras cidades

Esperado:
  Grid recarrega com só perfis de Paris

Obtido:
  Grid não muda, mostra tudo

Como Reproduzir:
  1. /decouvrir
  2. Dropdown Location "Paris"
  3. Grid não filtra

Screenshots:
  [ANEXA IMAGEM]

Console Errors (F12):
  "Error: GET /api/discovery?location=Paris returned 500"
  [ANEXA SCREENSHOT DO ERRO]

Navegador:
  Chrome 131, macOS 15

Status: 🔴 CRÍTICO (Feature não funciona)
```

---

## 📊 RASTREADOR DE PROGRESSO

Durante o teste, usa este rastreador:

```
┌─────────────────────────────────────────────────────┐
│          TRACKING - 50 CLIENTES                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ GRUPO 1-5  (Autenticação)                           │
│ ✅ C1 Registro - PRONTO                             │
│ ✅ C2 Login - PRONTO                                │
│ ✅ C3 Perfil - PRONTO                               │
│ ✅ C4 Reset (Request) - PRONTO                      │
│ ⏳ C5 Reset (Confirmar) - TESTANDO                  │
│                                                     │
│ GRUPO 6-10 (Paywall)                                │
│ ✅ C6 /decouvrir - PRONTO                           │
│ ✅ C7 /chat - PRONTO                                │
│ ✅ C8 Criar Grupo - PRONTO                          │
│ ⏳ C9 Upload Foto - TESTANDO                        │
│ ⏳ C10 /eventos - AGUARDANDO                        │
│                                                     │
│ GRUPO 11-20 (Discovery)                             │
│ ✅ C11 Página Básica - PRONTO                       │
│ ⏳ C12 Filtro Location - TESTANDO                   │
│ ✅ C13 Filtro Idade - PRONTO                        │
│ ⏳ C14 Filtro Género - TESTANDO                     │
│ ⏳ C15-20 - AGUARDANDO START                        │
│                                                     │
│ ... (continuaria para todos 50)                     │
│                                                     │
└─────────────────────────────────────────────────────┘

LEGENDA:
✅ PRONTO (Teste concluído, tudo OK)
⏳ TESTANDO (Atualmente em teste)
❌ FALHOU (Encontrou bug)
⏸️  PAUSADO (Aguardando resolução)
⏳ AGUARDANDO (Ainda não começou)
```

---

## 🐛 COMPILAR BUGS

Ao final, compila:

```
BUGS ENCONTRADOS
═════════════════════════════════════════════════════

Total de Bugs: 3

CRITICO (Bloqueia teste):
┌─ #1 [Chat] Mensagens não enviam
   │  Cliente: 37
   │  Erro: "API error 500"
   │  Como: Envia qualquer mensagem em grupo
   └─ Prioridade: 🔴 CRÍTICO

MAJOR (Funcionalidade não funciona):
┌─ #2 [Discovery] Filtro Localização não funciona
   │  Cliente: 12
   │  Erro: Grid não recarrega
   │  Como: Seleciona "Paris" em filtro
   └─ Prioridade: 🟠 MAJOR

MINOR (Cosmético):
┌─ #3 [UI] Botão "Curtir" tem cor errada
   │  Cliente: 21
   │  Erro: Rosa em vez de vermelho
   │  Como: Página /decouvrir
   └─ Prioridade: 🟡 MINOR

Total Testes: 105
Testes Passados: 102 (97%)
Testes Falhados: 3 (3%)

Recomendação: 
✅ PRONTO PARA PRODUÇÃO (Bugs MAJOR podem esperar ou hotfix)
```

---

## ✅ CHECKLIST FINAL

```
Antes de iniciar testes:
☐ 53 utilizadores inseridos no Supabase
☐ xlibertine.com online e responsivo
☐ 50 clientes receberam credenciais
☐ 50 clientes receberam documentação
☐ Coordenador pronto em chat/grupo
☐ Todos têm F12 DevTools aberto

Durante testes:
☐ Coordenador monitora progresso
☐ Clientes reportam bugs em tempo real
☐ Tech lead fica on-call para problemas
☐ Screenshots tiradas para evidence

Depois de testes:
☐ Recolher resultados de todos 50
☐ Compilar lista de bugs
☐ Classificar por severidade
☐ Criar PRs para fixes
☐ Comemorar sucesso! 🎉
```

---

## 🚀 COMANDE PARA COMEÇAR

**Enviar aos 50 clientes:**

```
═════════════════════════════════════════════════════
        🎉 TESTE DE PRODUÇÃO COMEÇA AGORA 🎉
═════════════════════════════════════════════════════

Olá [Nome]!

Tu és CLIENT #[número] e vais testar: [Funcionalidade]

📋 CREDENCIAIS:
   Email: [seu_email@test.com]
   Password: TestPass123

📖 GUIA:
   👉 Ver: TESTE_50_CLIENTES_DISTRIBUIDO.md
   👉 Procura: "CLIENTE [número]"
   👉 Segue os passos

⏱️ DURAÇÃO: ~10-15 minutos

🎯 OBJETIVO:
   Testa TODOS os botões/opções da tua funcionalidade

📢 COORDENADOR: [nome/link]
   Qualquer dúvida, fala comigo

✅ JÁ COMEÇOU - BOA SORTE! 🚀

═════════════════════════════════════════════════════
```

---

**Data:** 09/08/2026  
**Status:** Pronto para 50 clientes testarem  
**Duração:** 3 horas  
**Resultado Esperado:** 97%+ de sucesso
