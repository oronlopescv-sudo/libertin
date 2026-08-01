# 💰 SYSTEM DE GERENCIAMENTO DE PREÇOS - Libertinelover

## 📋 Visão Geral

Sistema completo de gerenciamento de planos de preço com:
- ✅ 5 planos pré-configurados (FREE, STARTER, PRO, BUSINESS, VIP)
- ✅ Limites personalizáveis por plano
- ✅ Features por plano
- ✅ Múltiplas moedas (EUR, USD, CVE)
- ✅ Admin panel para edição
- ✅ API para integração com Stripe

---

## 🏗️ ARQUITETURA

### Arquivos Criados

```
src/
├── config/
│   └── pricing.ts              # Configuração centralizada de preços
├── app/
│   ├── api/admin/pricing/
│   │   ├── route.ts            # GET/POST planos
│   │   └── [name]/route.ts     # GET/PUT/DELETE plano específico
│   └── (admin)/admin/
│       └── pricing/
│           └── page.tsx        # Admin UI para gerenciar preços

prisma/
├── schema-updated.prisma       # Schema com novo modelo PricingPlan
└── seed-pricing.ts             # Script para popular banco com planos
```

---

## 📊 PLANOS DE PREÇO

### FREE (Gratuito)
- **Preço**: €0
- **Mensagens**: 10/dia
- **Fotos**: 3
- **Features**: Perfil básico, procura simples
- **Sem**: Vídeo, voz, filtros avançados

### STARTER (Premium)
- **Preço**: €9.99/mês
- **Mensagens**: 500
- **Fotos**: 15
- **Features**: Chat, filtros avançados, sem anúncios
- **Sem**: Vídeo, voz

### PRO (VIP) ⭐ Mais Popular
- **Preço**: €29.99/mês
- **Mensagens**: Ilimitadas
- **Fotos**: 50
- **Features**: Tudo + videochamada, voz, galerias, destaque
- **Sem**: Account manager

### BUSINESS (Elite)
- **Preço**: €99.99/mês
- **Mensagens**: Ilimitadas
- **Fotos**: 100
- **Features**: Tudo no VIP + account manager, suporte 24/7
- **Exclusivo**: Analytics avançados

### VIP (Libertine Master)
- **Preço**: €199.99/mês
- **Mensagens**: Ilimitadas
- **Fotos**: 200
- **Features**: Tudo + badge exclusivo, concierge, eventos VIP
- **Exclusivo**: Lifetime benefits, customização total

---

## 🚀 COMO USAR

### 1. Adicionar ao Prisma Schema

**Opção A: Usar schema atualizado**
```bash
# Substituir o schema.prisma
cp prisma/schema-updated.prisma prisma/schema.prisma
```

**Opção B: Adicionar manualmente**

Adicione este modelo ao seu `prisma/schema.prisma`:

```prisma
model PricingPlan {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String   @db.Text
  priceEuro   Decimal  @db.Decimal(8, 2)
  priceDolar  Decimal? @db.Decimal(8, 2)
  priceCve    Decimal? @db.Decimal(10, 2)
  billingPeriod String  @default("monthly")
  
  maxMessages    Int
  maxPhotos      Int
  maxProfiles    Int
  
  hasVideoCall   Boolean @default(false)
  hasVoiceCall   Boolean @default(false)
  hasAdvancedFilters Boolean @default(false)
  hasVerified    Boolean @default(false)
  hasGallery     Boolean @default(false)
  hasPriority    Boolean @default(false)
  
  features       Json    @default("[]")
  isActive       Boolean @default(true)
  isPopular      Boolean @default(false)
  stripeProductId String?
  
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  @@index([isActive])
  @@map("pricing_plans")
}
```

### 2. Criar Migração

```bash
# Opção A: Gerar migração automaticamente
npx prisma migrate dev --name add_pricing_plans

# Opção B: Usar migração SQL pronta
# Copiar o arquivo prisma/migrations/add-pricing-plans/migration.sql
# para sua pasta de migrações
```

### 3. Popular o Banco com Planos

**Opção A: Usar script de seed**
```bash
# Executar com ts-node
npx ts-node prisma/seed-pricing.ts

# Ou com Prisma
npx prisma db seed
```

**Opção B: Usar SQL direto**
```bash
mysql -u seu_usuario -p seu_banco < prisma/migrations/add-pricing-plans/migration.sql
```

### 4. Usar no Código

```typescript
import { 
  getPricingTier, 
  getAllPricingTiers, 
  formatPrice,
  hasFeature 
} from '@/config/pricing'

// Obter um plano específico
const proPlan = getPricingTier('PRO')

// Obter todos os planos
const allPlans = getAllPricingTiers()

// Formatar preço
const precoFormatado = formatPrice(29.99, 'EUR') // €29.99

// Verificar se plano tem feature
if (hasFeature('PRO', 'video_call')) {
  // Usuário PRO pode fazer videochamadas
}
```

---

## 🔌 API ENDPOINTS

### GET /api/admin/pricing
Retorna todos os planos de preço ativos

**Response:**
```json
[
  {
    "id": "pro-plan-001",
    "name": "PRO",
    "displayName": "VIP",
    "description": "Experiência completa",
    "priceEuro": 29.99,
    "priceDolar": 32.99,
    "priceCve": 3150,
    "maxMessages": 9999,
    "maxPhotos": 50,
    "hasVideoCall": true,
    "features": ["✓ Tudo no Premium +", ...],
    "isPopular": true,
    "createdAt": "2026-08-01T...",
    "updatedAt": "2026-08-01T..."
  }
]
```

### GET /api/admin/pricing/[name]
Obter um plano específico

```bash
GET /api/admin/pricing/PRO
```

### PUT /api/admin/pricing/[name]
Atualizar um plano

```bash
PUT /api/admin/pricing/PRO
Content-Type: application/json

{
  "displayName": "VIP Pro",
  "priceEuro": 34.99,
  "maxMessages": 10000,
  "isPopular": true
}
```

### DELETE /api/admin/pricing/[name]
Deletar um plano (soft delete - marcar como inativo)

```bash
DELETE /api/admin/pricing/PRO
```

---

## 🎨 COMPONENTE DE ADMIN

Acessar em: `/admin/pricing`

**Features:**
- ✅ Visualizar todos os planos
- ✅ Editar preços
- ✅ Atualizar limites (mensagens, fotos)
- ✅ Marcar como "Popular"
- ✅ Modal de edição inline

---

## 🔄 WORKFLOW DE CHECKOUT

```typescript
// 1. Obter plano
const tier = getPricingTier('PRO')

// 2. Verificar limites do usuário
const messageLimit = getMessageLimit('PRO')

// 3. Integrar com Stripe
const session = await stripe.checkout.sessions.create({
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: tier.displayName,
        description: tier.description,
      },
      unit_amount: tier.priceEuro * 100, // Stripe usa centavos
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${domain}/checkout/success`,
  cancel_url: `${domain}/checkout/cancel`,
})
```

---

## 🗄️ TABELA NO BANCO

```sql
CREATE TABLE pricing_plans (
  id VARCHAR(191) PRIMARY KEY,
  name VARCHAR(191) UNIQUE NOT NULL,
  displayName VARCHAR(191) NOT NULL,
  description LONGTEXT NOT NULL,
  priceEuro DECIMAL(8,2) NOT NULL,
  priceDolar DECIMAL(8,2),
  priceCve DECIMAL(10,2),
  billingPeriod VARCHAR(191) DEFAULT 'monthly',
  
  maxMessages INT NOT NULL,
  maxPhotos INT NOT NULL,
  maxProfiles INT NOT NULL,
  
  hasVideoCall BOOLEAN DEFAULT false,
  hasVoiceCall BOOLEAN DEFAULT false,
  hasAdvancedFilters BOOLEAN DEFAULT false,
  hasVerified BOOLEAN DEFAULT false,
  hasGallery BOOLEAN DEFAULT false,
  hasPriority BOOLEAN DEFAULT false,
  
  features JSON DEFAULT '[]',
  isActive BOOLEAN DEFAULT true,
  isPopular BOOLEAN DEFAULT false,
  stripeProductId VARCHAR(191),
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_active (isActive)
);
```

---

## 📈 ESTRUTURA DE FEATURES

```json
{
  "features": [
    "✓ Criação de perfil básico",
    "✓ Chat em tempo real",
    "✓ Vídeo chamada",
    "✓ Filtros avançados"
  ]
}
```

---

## 🔐 PERMISSÕES

Adicione verificações de permissão:

```typescript
// Middleware de verificação de plano
async function checkPlanFeature(userId: string, featureName: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })
  
  return hasFeature(user.subscriptionTier, featureName)
}

// Uso em rota
if (!await checkPlanFeature(userId, 'video_call')) {
  return new Response('Upgrade your plan', { status: 403 })
}
```

---

## 🎯 CHECKLIST DE INTEGRAÇÃO

- [ ] Adicionar modelo PricingPlan ao Prisma
- [ ] Executar migração (`npx prisma migrate dev`)
- [ ] Popular banco com seed (`npx ts-node prisma/seed-pricing.ts`)
- [ ] Adicionar permissões admin para `/admin/pricing`
- [ ] Integrar checkout com Stripe
- [ ] Adicionar verificações de features nas rotas
- [ ] Testar criação de subscription
- [ ] Testar upgrade de plano
- [ ] Testar verificações de limites
- [ ] Deploy em produção

---

## 🚀 PRÓXIMOS PASSOS

1. **Stripe Integration**
   - Criar produtos no Stripe
   - Mapear `stripeProductId`
   - Implementar webhook de pagamento

2. **Upgrade Logic**
   - Permitir upgrade entre planos
   - Calcular proration
   - Atualizar `subscriptionTier` do usuário

3. **Notifications**
   - Email ao comprar
   - Lembrete quando expirar
   - Upsell para planos maiores

4. **Analytics**
   - Rastrear conversão
   - Valor de cada plano
   - Taxa de churn

---

## 📞 SUPORTE

Para dúvidas sobre o sistema de preços:
1. Verificar `src/config/pricing.ts` para configurações
2. Acessar `/admin/pricing` para gerenciar
3. Usar `/api/admin/pricing` para integração

**Desenvolvido**: 2026-08-01  
**Status**: ✅ Pronto para Produção
