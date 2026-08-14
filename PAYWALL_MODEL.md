# 💰 PAYWALL MODEL - FREE vs PREMIUM

**Data:** 09 de Agosto de 2026  
**Status:** ✅ IMPLEMENTADO  
**Build:** PASSA (sem erros)

---

## 🟢 FREE USERS

Podem fazer:
```
✅ S'inscrire (criar conta)
✅ Login
✅ Ver homepage
✅ Logout
✅ Réinitialiser le mot de passe via email
✅ Modifier perfil básico
```

Bloqué:
```
❌ VER PERFIS (/decouvrir)
❌ ENVIAR MENSAGENS (/chat/[groupId])
❌ CRIAR GRUPOS (/api/groups POST)
❌ PARTICIPAR EM GRUPOS (/api/groups/join)
❌ UPLOAD DE FOTOS (/api/photos/upload)
❌ CRIAR/PARTICIPAR EVENTOS (/eventos)
```

**Message padrão para FREE:**
```
🔒 Apenas utilisateurs Premium podem [action]
→ Effectuez upgrade para Premium
→ À partir de 2,08 €/mois
```

---

## 🔴 PREMIUM USERS

**Tiers:**
- `PREMIUM_3M` — €5.33/mois (€16 total)
- `PREMIUM_12M` — €2.08/mois (€25 total)
- `VIP_24M` — €2.91/mois (€70 total)

**Acesso:**
```
✅ Tudo desbloqueado
✅ Ver perfis completos
✅ Envoyer/receber mensagens
✅ Criar grupos
✅ Participar em grupos
✅ Upload de fotos
✅ Criar eventos
✅ Participar em eventos
✅ Tudo!
```

**Validaction:**
```typescript
const isPremium = 
  ['PREMIUM_3M', 'PREMIUM_12M', 'VIP_24M'].includes(user.abonnementTier) &&
  user.abonnementEnd &&
  new Date(user.abonnementEnd) > new Date();
```

---

## 📋 IMPLEMENTAÇÃO (CONCLUÍDA)

### ✅ Pages Bloqueadas

| Page | Rota | Método | Status |
|--------|------|--------|--------|
| Découvrir les profils | `/decouvrir` | GET | ✅ |
| Chat | `/chat/[groupId]` | GET | ✅ |
| Événements | `/eventos` | GET | ✅ |

### ✅ APIs Bloqueadas

| API | Rota | Método | Status |
|-----|------|--------|--------|
| Criar Groupe | `/api/groups` | POST | ✅ |
| Juntar Groupe | `/api/groups` | PATCH | ✅ |
| Upload Foto | `/api/photos/upload` | POST | ✅ |

### ✅ Componentes

| Componente | Ficheiro | Status |
|------------|----------|--------|
| Create Group Modal | `components/create-group-modal.tsx` | ✅ |
| Premium Lock Modal | UI padrão | ✅ |

---

## 🔐 FLUXO DE VALIDAÇÃO

### Exemplo: Tentar Ver Profils (FREE)

```
1. FREE user clica em /decouvrir
   ↓
2. Frontend carrega /decouvrir/page.tsx
   ↓
3. useEffect récupère localStorage token
   ↓
4. Parse token → extrai abonnementTier
   ↓
5. Validaction:
   if (!isPremium) → Mostra lock screen
   ↓
6. Lock Screen renderiza:
   - 🔒 Ícone
   - "Apenas Premium podem ver perfis"
   - Botão "Fazer Upgrade"
   - Link "Retour à l'accueil"
```

### Exemplo: Criar Groupe (FREE)

```
1. FREE user tenta criar grupo
   ↓
2. Clica botão "Criar Groupe"
   ↓
3. Modal abre (CreateGroupModal)
   ↓
4. Validaction isPremium = false
   ↓
5. Modal renderiza lock screen:
   - 🔒 Ícone
   - "Apenas Premium criam grupos"
   - Botão "Fazer Upgrade"
   - Link "Annuler"
```

### Exemplo: Envoyer Message (FREE)

```
1. FREE user tenta /chat/grupo-123
   ↓
2. Frontend carrega page.tsx
   ↓
3. Validaction isPremium = false
   ↓
4. Lock Screen renderiza
   ↓
5. User vê:
   - 🔒 Ícone
   - "Apenas Premium enviam mensagens"
   - Botão "Fazer Upgrade"
```

---

## 💾 CÓDIGO (Padrão)

### Validaction em Page

```typescript
const isPremium = user && ['PREMIUM_3M', 'PREMIUM_12M', 'VIP_24M'].includes(user.abonnementTier);

if (!user || !isPremium) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#12091A] to-[#1C102B]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-[#D4145A]/20 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-[#D4145A]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">[Título]</h1>
            <p className="text-zinc-400 mb-6">
              Apenas utilisateurs Premium podem [action].
            </p>
          </div>
          <div className="space-y-3">
            <Link href="/abonnements" className="block py-3 px-6 bg-gradient-to-r from-[#D4145A] to-[#E86B7A]...">
              Passer à Premium
            </Link>
            <Link href="/" className="block py-3 px-6 bg-[#2C1B3D]...">
              Retour
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Premium content aqui
```

### Validaction em API

```typescript
const isPremium = premiumTiers.includes(user.abonnementTier) && 
                  user.abonnementEnd &&
                  new Date(user.abonnementEnd) > new Date();

if (!isPremium) {
  return NextResponse.json(
    { error: 'Apenas utilisateurs Premium podem [action]. Effectuez upgrade!' },
    { status: 403 }
  );
}
```

---

## 📊 IMPACTO

### Antes (sem paywall)
```
Qualquer um pode:
- Ver tudo
- Envoyer mensagens
- Criar grupos
- Sem incentivo para upgrade
```

### Depois (com paywall)
```
✅ FREE: S'inscrire + Login (lead gerado)
❌ FREE: Bloqué em 6 features principais
✅ INCENTIVO: Upgrade button em cada feature
✅ CONVERSÃO: Free → Premium (€2.08+/mois)
```

---

## 🎯 FUTUROS BLOQUEIOS (se quiser)

```
Possível adicionar depois:
- [ ] Profil limitado (2 fotos vs ilimitadas)
- [ ] Messages limitadas (5/jour vs ilimitadas)
- [ ] Groupes limitados (1 grupo vs unlimited)
- [ ] Récupère básica vs avançada
- [ ] Ver quem visitou (PREMIUM only)
- [ ] Filtres de récupère avançados (PREMIUM only)
```

---

## 📝 CHECKLIST

```
[✅] /decouvrir bloqueado para FREE
[✅] /chat/[groupId] bloqueado para FREE
[✅] /eventos bloqueado para FREE
[✅] POST /api/groups bloqueado para FREE
[✅] PATCH /api/groups/join bloqueado para FREE
[✅] POST /api/photos/upload bloqueado para FREE
[✅] Botão "Criar Groupe" desabilitado para FREE
[✅] Modal lock screens iguais em todas páginas
[✅] Link "Fazer Upgrade" → /abonnements
[✅] Build passa sem erros
[✅] Documentaction completa
```

---

## 🚀 PRÓXIMOS PASSOS

1. **Stripe Integration** — Processar pagamentos
2. **Webhook Stripe** — Atualizar abonnement automaticamente
3. **Email notificaction** — Aviso de upgrade bem-sucedido
4. **Analytics** — Rastrear conversão Free → Premium

---

## 📞 DÚVIDAS

**P: Posso dar FREE trial?**  
R: Oui, criar campo `abonnementTrialEnds` e ajustar validaction

**P: Posso bloquer mais features?**  
R: Oui, adicionar validaction isPremium em qualquer página/API

**P: Como refund?**  
R: Deixar para Stripe webhook + payment API

---

*Documento criado: 09/08/2026*  
*Paywall: 100% FUNCIONAL*  
*Status: PRONTO PARA PRODUÇÃO*
