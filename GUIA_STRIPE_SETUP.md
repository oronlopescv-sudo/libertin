# 💳 GUIA COMPLETO - Configurar Stripe com Libertinelover

## 🎯 O QUE VAMOS FAZER

1. ✅ Criar 5 produtos no Stripe (FREE, STARTER, PRO, BUSINESS, VIP)
2. ✅ Criar preços para cada produto
3. ✅ Obter Product IDs e Price IDs
4. ✅ Configurar Webhook
5. ✅ Testar checkout

**Tempo total: ~15 minutos**

---

## 📋 PASSO 1: Acessar Stripe Dashboard

1. Ir para: https://dashboard.stripe.com
2. Login com suas credenciais
3. Ir para "Products" no menu esquerdo

---

## 💳 PASSO 2: Criar 5 Produtos

### Produto 1: FREE (Gratuito)

```
Nome: Libertinelover - Plan FREE
Descrição: Acesso gratuito com limite de mensagens
Preço: €0 (não cobrar)
```

**Como criar:**
1. Click "Add product"
2. Preencher:
   - **Name**: Libertinelover - Plan FREE
   - **Description**: Free access with message limits
   - **Type**: Standard
3. Click "Add billing details"
   - **Price**: 0.00
   - **Billing period**: Monthly
   - **Name**: Free Access
4. Click "Save product"

Salvar o **Product ID**: `prod_xxx`

---

### Produto 2: STARTER (€9.99/mês)

```
Nome: Libertinelover - Plan STARTER Premium
Descrição: Premium access com filtros avançados
Preço: €9.99/mês
```

**Como criar:**
1. Click "Add product"
2. Preencher:
   - **Name**: Libertinelover - Plan STARTER Premium
   - **Description**: Premium access with advanced filters
   - **Type**: Standard
3. Click "Add billing details"
   - **Price**: 9.99
   - **Currency**: EUR
   - **Billing period**: Monthly
   - **Name**: Premium Monthly
4. Click "Save product"

Salvar o **Product ID**: `prod_xxx`

---

### Produto 3: PRO (€29.99/mês)

```
Nome: Libertinelover - Plan PRO VIP
Descrição: VIP access with video calls and priority support
Preço: €29.99/mês
```

**Como criar:**
1. Click "Add product"
2. Preencher:
   - **Name**: Libertinelover - Plan PRO VIP
   - **Description**: VIP access with video/voice calls
   - **Type**: Standard
3. Click "Add billing details"
   - **Price**: 29.99
   - **Currency**: EUR
   - **Billing period**: Monthly
   - **Name**: VIP Monthly
4. Click "Save product"

Salvar o **Product ID**: `prod_xxx`

---

### Produto 4: BUSINESS (€99.99/mês)

```
Nome: Libertinelover - Plan BUSINESS Elite
Descrição: Elite access com account manager
Preço: €99.99/mês
```

**Como criar:**
1. Click "Add product"
2. Preencher:
   - **Name**: Libertinelover - Plan BUSINESS Elite
   - **Description**: Elite access with dedicated account manager
   - **Type**: Standard
3. Click "Add billing details"
   - **Price**: 99.99
   - **Currency**: EUR
   - **Billing period**: Monthly
   - **Name**: Elite Monthly
4. Click "Save product"

Salvar o **Product ID**: `prod_xxx`

---

### Produto 5: VIP (€199.99/mês)

```
Nome: Libertinelover - Plan VIP Master
Descrição: Libertine Master com benefits lifetime
Preço: €199.99/mês
```

**Como criar:**
1. Click "Add product"
2. Preencher:
   - **Name**: Libertinelover - Plan VIP Master
   - **Description**: Libertine Master with lifetime benefits
   - **Type**: Standard
3. Click "Add billing details"
   - **Price**: 199.99
   - **Currency**: EUR
   - **Billing period**: Monthly
   - **Name**: Master Monthly
4. Click "Save product"

Salvar o **Product ID**: `prod_xxx`

---

## 🔑 PASSO 3: Obter Chaves de API

1. Ir para "Developers" → "API Keys"
2. Encontrar:
   - **Publishable Key** (começa com `pk_live_`)
   - **Secret Key** (começa com `sk_live_`)

⚠️ **IMPORTANTE: Não compartilhe a Secret Key!**

---

## 🔧 PASSO 4: Configurar Variáveis de Ambiente

Adicionar no Hostinger hPanel ou `.env.local`:

```env
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Product IDs (copiar do Stripe)
STRIPE_PRODUCT_FREE=prod_xxxxxxxxxxxxx
STRIPE_PRODUCT_STARTER=prod_xxxxxxxxxxxxx
STRIPE_PRODUCT_PRO=prod_xxxxxxxxxxxxx
STRIPE_PRODUCT_BUSINESS=prod_xxxxxxxxxxxxx
STRIPE_PRODUCT_VIP=prod_xxxxxxxxxxxxx
```

---

## 🪝 PASSO 5: Configurar Webhook

O webhook permite que Stripe notifique seu site quando um pagamento é realizado.

**No Dashboard Stripe:**

1. Ir para "Developers" → "Webhooks"
2. Click "Add endpoint"
3. Preencher:
   - **URL**: `https://seu-dominio.com/api/webhooks/stripe`
   - **Events**: Selecionar:
     - `payment_intent.succeeded`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Click "Add endpoint"
5. Salvar o **Signing Secret**: `whsec_xxxxx`

Adicionar ao `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## 📝 PASSO 6: Atualizar Banco de Dados

Depois de obter os Product IDs do Stripe, adicionar ao banco:

```bash
# Via SQL
UPDATE pricing_plans 
SET stripeProductId = 'prod_FREE_ID' 
WHERE name = 'FREE';

UPDATE pricing_plans 
SET stripeProductId = 'prod_STARTER_ID' 
WHERE name = 'STARTER';

UPDATE pricing_plans 
SET stripeProductId = 'prod_PRO_ID' 
WHERE name = 'PRO';

UPDATE pricing_plans 
SET stripeProductId = 'prod_BUSINESS_ID' 
WHERE name = 'BUSINESS';

UPDATE pricing_plans 
SET stripeProductId = 'prod_VIP_ID' 
WHERE name = 'VIP';
```

---

## ✅ PASSO 7: Testar

1. Ir para `/pricing`
2. Clicar "Escolher Plano" (ex: PRO)
3. Deve ir para checkout do Stripe
4. Usar card de teste: `4242 4242 4242 4242`
5. Data: `12/25`
6. CVV: `123`
7. Qualquer nome/email

---

## 📊 RESUMO DE IDs

Anotar aqui (depois de criar no Stripe):

```
PRODUTO           | PRICE    | PRODUCT ID
──────────────────┼──────────┼─────────────────
FREE              | €0       | prod_
STARTER           | €9.99    | prod_
PRO               | €29.99   | prod_
BUSINESS          | €99.99   | prod_
VIP               | €199.99  | prod_
```

---

## 🚀 PRÓXIMOS PASSOS

Depois de configurar:

1. ✅ Criar produtos no Stripe
2. ✅ Adicionar chaves ao .env
3. ✅ Configurar Webhook
4. ✅ Atualizar banco com Product IDs
5. ⏳ Implementar checkout (vou criar o código)
6. ⏳ Testar fluxo completo
7. ⏳ Deploy em produção

---

## 💡 DICAS

- Stripe tem modo **Test** e **Live**
- Usar Test primeiro para testar tudo
- Cards de teste começam com `4242`
- Webhooks só funcionam com domínio público (não localhost)
- Salvar todos os IDs em um lugar seguro

---

## ❓ TROUBLESHOOTING

| Problema | Solução |
|----------|---------|
| Webhook não funciona | Verificar URL (deve ter HTTPS) |
| Payment falha | Verificar Secret Key |
| Preço errado | Editar produto no Stripe |
| Moeda errada | Stripe detecta pela locale |

---

**Quando terminar de criar tudo no Stripe, me avisa que vou criar o código de checkout!** 🚀
