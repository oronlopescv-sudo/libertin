# 🔐 ADMIN DASHBOARD - DOCUMENTAÇÃO COMPLETA

**Status:** ✅ IMPLEMENTADO  
**URL:** https://xlibertine.com/admin  
**Acesso:** Apenas PASS_VIP (Agentes)  
**Data:** 09/08/2026

---

## 📊 VISÃO GERAL

```
Admin Dashboard
├─ 📈 Statistiques Principais
├─ 👥 Gestion des utilisateurs
├─ 👥 Gestion des groupes
├─ 📋 Logs de Atividade
└─ 📑 Relatórios
```

---

## 🎯 FUNCIONALIDADES

### **1️⃣ ESTATÍSTICAS PRINCIPAIS (Dashboard Home)**

#### **Cards de Métrica**
```
┌─────────────────────────────────────┐
│ Total de Utilisateurs: 53           │
│ + 25 este mois                       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Online Agora: 12                    │
│ (Últimos 5 minutes)                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Groupes Ativos: 8                    │
│ Communautés                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Interactions (Likes): 1,240           │
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
    "PASS_EPICURIEN": 12,
    "PASS_PRIVILEGE": 10,
    "PASS_VIP": 3
  }
}
```

---

### **2️⃣ GESTÃO DE UTILIZADORES**

#### **Listar Utilisateurs**
```
GET /api/admin/users
Query Params:
  - page: 1 (default)
  - limit: 20 (default)
  - search: "alice" (optionnel - récupère username/email)
  - tier: "PASS_EPICURIEN" (optionnel - filtro por abonnement)

Response:
{
  "users": [
    {
      "id": "uuid",
      "username": "alice",
      "email": "alice@test.com",
      "abonnementTier": "PASS_EPICURIEN",
      "abonnementEnd": "2026-11-09",
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
// Page 1
fetch('/api/admin/users?page=1&limit=20')

// Rechercher user
fetch('/api/admin/users?search=alice')

// Filtrer par tier
fetch('/api/admin/users?tier=PASS_EPICURIEN')

// Combinar filtros
fetch('/api/admin/users?search=alice&tier=PASS_EPICURIEN&page=1')
```

#### **Bannir Utilisateur**
```
POST /api/admin/users/ban

Body:
{
  "userId": "uuid-aqui",
  "reason": "Violaction de termos de serviço"
}

Response:
{
  "success": true,
  "message": "User banni avec succès"
}
```

**Validações:**
- ✅ Admin deve estar logado
- ✅ Admin não pode bannir a si mesmo
- ✅ Raison é registada em admin_logs
- ✅ User banni não consegue fazer login

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

#### **Desbannir Utilisateur**
```
DELETE /api/admin/users

Query Params:
  - userId: "uuid-aqui"

Response:
{
  "success": true,
  "message": "User desblanido avec succès"
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
- **Abonnement** (badge colorido)
  - 🟦 FREE (cinzento)
  - 🟦 PASS_EPICURIEN (azul)
  - 🟦 PASS_PRIVILEGE (roxo)
  - 🟦 PASS_VIP (ouro)
- **Status** (ATIVO/BANIDO)
- **Actions** (Bannir/Desbannir)

**Ordenaction:**
- Padrão: Mais recentes primeiro

**Paginaction:**
- 20 utilisateurs por página
- Botões: Précédent/Suivant
- Counter: "Page X de Y"

**Récupère em Tempo Real:**
- Procura em username e email
- Reseta página para 1 ao pesquisar

---

### **4️⃣ GESTÃO DE GRUPOS (Sub-página)**

**URL:** `/admin/groups`

**Funcionalidades:**
- ✅ Listar todos os grupos
- ✅ Ver detalhes (membros, mensagens, admin)
- ✅ Deletar grupo (com confirmaction)
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
- Action
- Target (quem/o quê foi afetado)
- Raison (se aplicável)

**Filtres:**
- Por data (data início/fim)
- Por tipo de action
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
1. **Utilisateurs**
   - Total por tier
   - Novos este mois
   - Taxa de retenção
   - Utilisateurs bannis

2. **Groupes**
   - Total criados
   - Membros por grupo
   - Atividade (mensagens)
   - Groupes inativos

3. **Interações**
   - Total de likes
   - Méjour por user
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
✅ Admins PASS_VIP (agent.marie, agent.pierre, agent.sophie)
❌ FREE users
❌ PREMIUM users
❌ Users normais
```

### **Middleware Proteção:**
```typescript
// Verificaction em cada endpoint
async function isAdmin(userId: string): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('abonnementTier')
    .eq('id', userId)
    .single();

  return user && ['PASS_VIP'].includes(user.abonnementTier);
}
```

### **Se não for admin:**
```
❌ 403 Forbidden
{
  "error": "Sans autorisation de admin"
}

Redirecionamento: /
Message: "Acesso Negado - Apenas admins"
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
☐ Récupère funciona
☐ Paginaction funciona
☐ Clica "Bannir" em um user
☐ Confirmaction aparece
☐ User fica banni (status muda a vermelho)
☐ Clica "Desbannir"
☐ User volta a ativo
☐ Console F12 sem erros
☐ Responsive em mobile
```

---

## 📊 API ENDPOINTS SUMMARY

| Método | Endpoint | Description | Auth |
|--------|----------|-----------|------|
| GET | `/api/admin/dashboard` | Statistiques | ✅ Admin |
| GET | `/api/admin/users` | Listar users | ✅ Admin |
| POST | `/api/admin/users/ban` | Bannir user | ✅ Admin |
| DELETE | `/api/admin/users` | Desbannir user | ✅ Admin |
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
│ Abonnement Breakdown           │
│ [FREE] [PASS_EPICURIEN] [etc]       │
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

### **Admin quer bannir user "alice"**

1. **Login como admin**
   ```
   Email: agent.marie@xlibertine.com
   Mot de passe: TestPass123
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
   Abonnement: PASS_EPICURIEN
   Status: ATIVO
   ```

5. **Clica "Bannir"**
   ```
   Confirmaction popup aparece
   Clica "Oui"
   ```

6. **User é banni**
   ```
   API POST /api/admin/users/ban
   Motivo: "Violaction de termos"
   Status muda a: BANIDO (vermelho)
   ```

7. **Log registado**
   ```
   admin_logs:
   - adminId: marie-uuid
   - action: "BAN_USER"
   - targetId: alice-uuid
   - reason: "Violaction de termos"
   - timestamp: 2026-08-09T14:32:00Z
   ```

8. **Alice não consegue fazer login**
   ```
   Suivant login dela:
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

**Última actualizaction:** 09/08/2026  
**Status:** ✅ PRONTO PARA TESTE COM AGENTES  
**Commit:** Será adicionado após PR merge
