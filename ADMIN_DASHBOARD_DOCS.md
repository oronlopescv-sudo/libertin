# 🔐 ADMIN DASHBOARD - DOCUMENTAÇÃO COMPLETA

**Status:** ✅ IMPLEMENTADO  
**URL:** https://xlibertine.com/admin  
**Acesso:** Apenas VIP_24M (Agentes)  
**Data:** 09/08/2026

---

## 📊 VISÃO GERAL

```
Admin Dashboard
├─ 📈 Estatísticas Principais
├─ 👥 Gestão de Utilizadores
├─ 👥 Gestão de Grupos
├─ 📋 Logs de Atividade
└─ 📑 Relatórios
```

---

## 🎯 FUNCIONALIDADES

### **1️⃣ ESTATÍSTICAS PRINCIPAIS (Dashboard Home)**

#### **Cards de Métrica**
```
┌─────────────────────────────────────┐
│ Total de Utilizadores: 53           │
│ + 25 este mês                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Online Agora: 12                    │
│ (Últimos 5 minutos)                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Grupos Ativos: 8                    │
│ Comunidades                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Interações (Likes): 1,240           │
│ Total de curtidas                   │
└─────────────────────────────────────┘
```

**Endpoint API:**
```
GET /api/admin/dashboard
```

**Response:**
```json
{
  "totalUsers": 53,
  "onlineUsers": 12,
  "newUsersThisMonth": 25,
  "totalGroups": 8,
  "totalMessages": 523,
  "totalLikes": 1240,
  "tierBreakdown": {
    "FREE": 25,
    "PREMIUM_3M": 12,
    "PREMIUM_12M": 10,
    "VIP_24M": 3
  }
}
```

---

### **2️⃣ GESTÃO DE UTILIZADORES**

#### **Listar Utilizadores**
```
GET /api/admin/users
Query Params:
  - page: 1 (default)
  - limit: 20 (default)
  - search: "alice" (opcional - busca username/email)
  - tier: "PREMIUM_3M" (opcional - filtro por subscrição)

Response:
{
  "users": [
    {
      "id": "uuid",
      "username": "alice",
      "email": "alice@test.com",
      "subscriptionTier": "PREMIUM_3M",
      "subscriptionEnd": "2026-11-09",
      "isVerified": true,
      "createdAt": "2026-08-01",
      "isBanned": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 53,
    "pages": 3
  }
}
```

**Exemplo de Uso (Frontend):**
```javascript
// Página 1
fetch('/api/admin/users?page=1&limit=20')

// Procurar user
fetch('/api/admin/users?search=alice')

// Filtrar por tier
fetch('/api/admin/users?tier=PREMIUM_3M')

// Combinar filtros
fetch('/api/admin/users?search=alice&tier=PREMIUM_3M&page=1')
```

#### **Banir Utilizador**
```
POST /api/admin/users/ban

Body:
{
  "userId": "uuid-aqui",
  "reason": "Violação de termos de serviço"
}

Response:
{
  "success": true,
  "message": "User banido com sucesso"
}
```

**Validações:**
- ✅ Admin deve estar logado
- ✅ Admin não pode banir a si mesmo
- ✅ Razão é registada em admin_logs
- ✅ User banido não consegue fazer login

**Exemplo:**
```javascript
const res = await fetch('/api/admin/users/ban', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'abc123',
    reason: 'Spam excessivo em grupos'
  })
});
```

#### **Desbanir Utilizador**
```
DELETE /api/admin/users

Query Params:
  - userId: "uuid-aqui"

Response:
{
  "success": true,
  "message": "User desblanido com sucesso"
}
```

**Exemplo:**
```javascript
const res = await fetch('/api/admin/users?userId=abc123', {
  method: 'DELETE'
});
```

---

### **3️⃣ TABELA DE UTILIZADORES (UI)**

A tabela mostra:
- **Username** (clicável para ver perfil)
- **Email**
- **Subscrição** (badge colorido)
  - 🟦 FREE (cinzento)
  - 🟦 PREMIUM_3M (azul)
  - 🟦 PREMIUM_12M (roxo)
  - 🟦 VIP_24M (ouro)
- **Status** (ATIVO/BANIDO)
- **Ações** (Banir/Desbanir)

**Ordenação:**
- Padrão: Mais recentes primeiro

**Paginação:**
- 20 utilizadores por página
- Botões: Anterior/Próximo
- Counter: "Página X de Y"

**Busca em Tempo Real:**
- Procura em username e email
- Reseta página para 1 ao pesquisar

---

### **4️⃣ GESTÃO DE GRUPOS (Sub-página)**

**URL:** `/admin/groups`

**Funcionalidades:**
- ✅ Listar todos os grupos
- ✅ Ver detalhes (membros, mensagens, admin)
- ✅ Deletar grupo (com confirmação)
- ✅ Aprovar/Rejeitar grupos (pendentes)
- ✅ Desativar grupo (sem deletar)

**Endpoints (TODO):**
```
GET /api/admin/groups                 - Listar
POST /api/admin/groups/:id/delete     - Deletar
POST /api/admin/groups/:id/disable    - Desativar
POST /api/admin/groups/:id/approve    - Aprovar
```

---

### **5️⃣ LOGS DE ATIVIDADE (Sub-página)**

**URL:** `/admin/logs`

**O que é registado:**
```
✅ BAN_USER              (quando admin bane user)
✅ UNBAN_USER            (quando admin desbane)
✅ DELETE_GROUP          (quando admin deleta grupo)
✅ DELETE_MESSAGE        (quando mensagem é deletada)
✅ USER_REGISTRATION    (quando user se registar)
✅ USER_LOGIN           (quando user faz login)
✅ SUBSCRIPTION_CHANGE  (quando user muda tier)
```

**Tabela de Logs:**
- Timestamp
- Admin (quem fez)
- Ação
- Target (quem/o quê foi afetado)
- Razão (se aplicável)

**Filtros:**
- Por data (data início/fim)
- Por tipo de ação
- Por admin

**Exemplo de Log:**
```json
{
  "id": "log-123",
  "timestamp": "2026-08-09T14:32:00Z",
  "adminId": "admin-uuid",
  "adminUsername": "Marie_Agent",
  "action": "BAN_USER",
  "targetId": "user-uuid",
  "targetUsername": "alice",
  "reason": "Spam excessivo em grupos",
  "details": {}
}
```

---

### **6️⃣ RELATÓRIOS (Sub-página)**

**URL:** `/admin/reports`

**Tipos de Relatórios:**
1. **Utilizadores**
   - Total por tier
   - Novos este mês
   - Taxa de retenção
   - Utilizadores banidos

2. **Grupos**
   - Total criados
   - Membros por grupo
   - Atividade (mensagens)
   - Grupos inativos

3. **Interações**
   - Total de likes
   - Média por user
   - Padrões de horário

4. **Financeiro** (quando Stripe)
   - MRR (Monthly Recurring Revenue)
   - Churn rate
   - LTV (Lifetime Value)

**Formatos de Export:**
- 📊 CSV
- 📈 PDF
- 📋 JSON

---

## 🔐 CONTROLE DE ACESSO

### **Quem pode aceder?**
```
✅ Admins VIP_24M (agent.marie, agent.pierre, agent.sophie)
❌ FREE users
❌ PREMIUM users
❌ Users normais
```

### **Middleware Proteção:**
```typescript
// Verificação em cada endpoint
async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('subscriptionTier')
    .eq('id', userId)
    .single();

  return user && ['VIP_24M'].includes(user.subscriptionTier);
}
```

### **Se não for admin:**
```
❌ 403 Forbidden
{
  "error": "Sem permissão de admin"
}

Redirecionamento: /
Mensagem: "Acesso Negado - Apenas admins"
```

---

## 🧪 TESTE DO ADMIN DASHBOARD

### **Credenciais de Admin (3 Agentes)**
```
Agent 1: agent.marie@xlibertine.com / TestPass123
Agent 2: agent.pierre@xlibertine.com / TestPass123
Agent 3: agent.sophie@xlibertine.com / TestPass123
```

### **Test Checklist**
```
☐ Login como agent.marie
☐ Vai para /admin
☐ Carrega dashboard ✅
☐ Vê cards com estatísticas
☐ Tabela de users carrega (20 primeiros)
☐ Busca funciona
☐ Paginação funciona
☐ Clica "Banir" em um user
☐ Confirmação aparece
☐ User fica banido (status muda a vermelho)
☐ Clica "Desbanir"
☐ User volta a ativo
☐ Console F12 sem erros
☐ Responsive em mobile
```

---

## 📊 API ENDPOINTS SUMMARY

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/admin/dashboard` | Estatísticas | ✅ Admin |
| GET | `/api/admin/users` | Listar users | ✅ Admin |
| POST | `/api/admin/users/ban` | Banir user | ✅ Admin |
| DELETE | `/api/admin/users` | Desbanir user | ✅ Admin |
| GET | `/api/admin/groups` | Listar grupos | ⏳ TODO |
| POST | `/api/admin/groups/:id/delete` | Deletar grupo | ⏳ TODO |
| GET | `/api/admin/logs` | Ver logs | ⏳ TODO |
| GET | `/api/admin/reports` | Relatórios | ⏳ TODO |

---

## 🎨 UI/UX DESIGN

### **Cores (Tailwind)**
```
Fundo: #12091A (from-[#12091A])
Card: #1C102B (bg-[#1C102B])
Borda: #2C1B3D (border-[#2C1B3D])
Hover: #3C2B4D (hover bg-[#3C2B4D])
Accent: #D4145A (text-[#D4145A])
```

### **Layout**
```
┌─────────────────────────────────┐
│  Header: "Painel de Admin"       │
└─────────────────────────────────┘

┌──────────┬──────────┬──────────┬──────────┐
│ Stat 1   │ Stat 2   │ Stat 3   │ Stat 4   │
│ Card     │ Card     │ Card     │ Card     │
└──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────┐
│ Subscription Breakdown           │
│ [FREE] [PREMIUM_3M] [etc]       │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ User Management                  │
│ [Search Box]                    │
│ [Table com users]               │
│ [Pagination]                    │
└─────────────────────────────────┘

┌──────────┬──────────┬──────────┐
│ Action 1 │ Action 2 │ Action 3 │
│ Card     │ Card     │ Card     │
└──────────┴──────────┴──────────┘
```

---

## 📱 RESPONSIVIDADE

✅ **Desktop** (1920px+)
- 4 colunas de stats
- Tabela com scroll horizontal se necessário

✅ **Tablet** (768px-1920px)
- 2-3 colunas de stats
- Tabela com scroll

✅ **Mobile** (< 768px)
- 1 coluna de stats (empilhados)
- Tabela compacta ou card-based
- Menu colapsável

---

## 🚀 PRÓXIMOS PASSOS

### **Curto Prazo**
```
☐ Teste Admin Dashboard com 3 agentes
☐ Implementar /admin/groups
☐ Implementar /admin/logs
☐ Real-time stats (atualizar a cada 30s)
```

### **Médio Prazo**
```
☐ Implementar /admin/reports
☐ Export CSV/PDF
☐ Gráficos (Chart.js)
☐ 2FA para admin (segurança)
```

### **Longo Prazo**
```
☐ Moderators (além de admins)
☐ Role-based permissions
☐ Audit trail completo
☐ Alertas automáticos
```

---

## 🔍 EXEMPLO DE USO

### **Admin quer banir user "alice"**

1. **Login como admin**
   ```
   Email: agent.marie@xlibertine.com
   Password: TestPass123
   ```

2. **Vai para Admin Dashboard**
   ```
   https://xlibertine.com/admin
   ```

3. **Procura user**
   ```
   Search box: "alice"
   Clica Enter
   ```

4. **Encontra user na tabela**
   ```
   Username: alice
   Email: alice@test.com
   Subscrição: PREMIUM_3M
   Status: ATIVO
   ```

5. **Clica "Banir"**
   ```
   Confirmação popup aparece
   Clica "Sim"
   ```

6. **User é banido**
   ```
   API POST /api/admin/users/ban
   Motivo: "Violação de termos"
   Status muda a: BANIDO (vermelho)
   ```

7. **Log registado**
   ```
   admin_logs:
   - adminId: marie-uuid
   - action: "BAN_USER"
   - targetId: alice-uuid
   - reason: "Violação de termos"
   - timestamp: 2026-08-09T14:32:00Z
   ```

8. **Alice não consegue fazer login**
   ```
   Próximo login dela:
   ❌ "Sua conta foi banida"
   Redirecionamento para /
   ```

---

## 📞 SUPORTE

Qualquer dúvida sobre o Admin Dashboard:

```
Email: admin@xlibertine.com
GitHub Issues: https://github.com/oronlopescv-sudo/libertin/issues
Tags: [admin, dashboard]
```

---

**Última actualização:** 09/08/2026  
**Status:** ✅ PRONTO PARA TESTE COM AGENTES  
**Commit:** Será adicionado após PR merge
