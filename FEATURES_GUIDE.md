# xlibertine — Features Guide

## ✨ New Features Implemented

### 1. **Anonymous Groups System** 🎭

#### What it does:
- Users can join any group with a choice: **Identified** or **Anonymous**
- Anonymous members show as "Anonyme #XXXX" instead of their real name
- No photo, location, or personal info visible when annymous
- **PREMIUM users only** can join annymously (FREE users must be identified)

#### Key Components:
- `lib/annymous-groups.ts` — Service for annymity logic
- `components/join-group-modal.tsx` — Join modal with annymity selector
- Database: `group_memberships.is_annymous`, `messages.displayed_username`

#### Workflow:
```
User clicks "Join Group"
  ↓
Modal appears: "Se connecter como seu nome" or "Se connecter Anonyme"?
  ↓
If Anonymous:
  - Check: User is PREMIUM? ✓
  - Generate: "Anonyme #4521"
  - Hide: Photo, location, name
  ↓
Join succeeds → User sees all members
               → Other members see "Anonyme #4521"
```

---

### 2. **Group Expiration & Renewal** ⏰

#### Pricing:
- **Create Group:** €50 (valid for 5 months)
- **Renew Group:** €50 (extends 5 more months)
- Applies to all groups (except "Nudes Anonymes" which is permanent)

#### What happens:
```
Day 1-150:  Group is active, visible, members can message
Day 151:    Notification: "Your group expires in 7 days"
Day 158:    Notification: "Your group expires tomorrow"
Day 159:    Group auto-deactivates, hidden from discovery
```

#### Admin endpoints:
- `GET /admin/groups/expiring` — See groups expiring soon
- `POST /admin/groups/deactivate-expired` — Run cleanup (cron job)

#### Database fields:
```sql
groups.expires_at       -- Timestamp when group expires
groups.is_active        -- Boolean, auto-set to false if expired
groups.allows_annymous -- Can members join annymously?
```

---

### 3. **Nudes Anonymes — Special Group** 🔞

#### Features:
- **Name:** "Nudes Anonymes"
- **Access:** PREMIUM users only
- **Anonymity:** Mandatory (everyone is annymous)
- **NSFW Detection:** Enabled automatically
- **Max Members:** 500
- **Duration:** Permanent (no expiration)

#### Auto-created at deployment:
```sql
INSERT INTO groups (name, is_nsfw, allows_annymous, ...)
VALUES ('Nudes Anonymes', true, true, ...)
```

#### Rules:
- ✅ Share any content you want
- ✅ Everyone annymous by default
- ✅ No photo/location shared
- ❌ No personal info allowed
- ❌ Harassment = instant ban

---

### 4. **Paid Event Listings System** 🎉

#### Three Plan Types:

| Plan | Price | Duration | Features |
|------|-------|----------|----------|
| **Basic** | €100 | 30 days | Listed on /eventos |
| **Featured** ⭐ | €150 | 30 days | Top placement, email notification, 2x visibility |
| **VIP Gold** 👑 | €200 | 60 days | Premium top, featured in chat, 3x visibility |

#### Event Types:
- 🎉 **Festa Privada** — Private party (apt, hotel, etc)
- 🔥 **Gang Bang** — Looking for multiple men
- 💑 **Troca de Couples** — Couple swapping
- ⭐ **Outro Événement** — Other

#### Workflow:

```
1. User clicks "Anunciar Festa"
   ↓
2. Fill form:
   - Type, title, description
   - Location, date (optional/flexible)
   - Participants count
   - Select plan: Basic/Featured/VIP
   ↓
3. Click "Criar Anúncio (€100)"
   ↓
4. Redirected to Stripe checkout
   ↓
5. Payment succeeds
   ↓
6. Event becomes ACTIVE
   ↓
7. Email confirmation sent
   ↓
8. 30 days later: Expiration notice
   ↓
9. 35 days later: Event deactivated
   ↓
10. Option to renew for €100
```

#### Pages:
- `/eventos` — List all active events (filtered by type/city)
- `/eventos/:id` — Event details
- `/criar-evento` — Create new event

#### Stripe Configuration:
```env
STRIPE_PRODUCT_EVENT_BASIC=price_test_xxx     # €100, one-time
STRIPE_PRODUCT_EVENT_FEATURED=price_test_xxx  # €150, one-time
STRIPE_PRODUCT_EVENT_VIP=price_test_xxx       # €200, one-time
```

#### Database:
```sql
events
├─ type (festa|gang_bang|troca|other)
├─ title, description
├─ location, city, date_time
├─ is_date_flexible
├─ looking_for ("8 homens, 18-50 ans")
├─ min/max_participants
├─ plan_type (basic|featured|vip_gold)
├─ amount_paid, payment_status, stripe_payment_id
├─ created_at, expires_at
└─ is_active

event_participants
├─ event_id FK
├─ user_id FK
├─ status (interested|confirmed|cancelled)
└─ joined_at

event_photos (for event gallery)
├─ event_id FK
├─ url
├─ status (pending|approved|rejected)
└─ uploaded_at
```

---

## 📊 Updated Abonnement Tiers

```
FREE
├─ Profiles, discovery
├─ Pode entrar em grupos (identificado)
└─ Sem acesso a "Nudes Anonymes"

PASS_EPICURIEN — €24,99
├─ Messages privadas
├─ Anonimato em grupos
├─ Acesso completo

PASS_EPICURIEN — €74,99
├─ Tudo do PASS_EPICURIEN +
├─ Criar grupos (€50 incluído)
├─ Válido 5 mois

PASS_PRIVILEGE — €59,99
├─ mensuel premium
├─ Anonimato
└─ Sem criar grupos

PASS_PRIVILEGE — €109,99
├─ mensuel premium +
├─ Criar 1 grupo (€50 incluído)
└─ Válido 5 mois

PASS_VIP — €149,99
├─ mensuel premium
├─ Criar 2 grupos (€50 cada incluído)
├─ Priority support
└─ Featured listing
```

---

## 🔧 Implementation Checklist

- [x] Database migrations
- [x] Anonymous groups logic
- [x] Group expiration system
- [x] Event listing system
- [x] Stripe integration (code)
- [x] UI components
- [x] API endpoints
- [ ] Deploy to Hostinger
- [ ] Run DB migrations
- [ ] Setup Stripe products
- [ ] Configure env vars
- [ ] Test end-to-end

---

## 📝 Files Added/Modified

### New Files:
```
supabase/migrations/add_annymity_and_events.sql
lib/events.ts
lib/annymous-groups.ts
app/api/events/checkout.ts
components/event-card.tsx
components/join-group-modal.tsx
components/create-event-form.tsx
FEATURES_GUIDE.md (this file)
```

### Modified:
```
lib/types.ts (added Event, EventParticipant, EventPhoto types)
```

---

## 🚀 Next Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "feat: Anonymous groups + Event listings + 5-month expiration"
   git push origin main
   ```

2. **Deploy migrations**
   ```bash
   # Via Supabase Dashboard or CLI
   supabase db push
   ```

3. **Create Stripe products**
   - Go to https://dashboard.stripe.com
   - Products → Add Product
   - Create 3 products (Event Basic €100, Featured €150, VIP €200)
   - Copy Product IDs → `.env.local`

4. **Update environment**
   ```env
   STRIPE_PRODUCT_EVENT_BASIC=price_1...
   STRIPE_PRODUCT_EVENT_FEATURED=price_1...
   STRIPE_PRODUCT_EVENT_VIP=price_1...
   ```

5. **Deploy to Hostinger**
   ```bash
   npm run build
   # Upload /out/ to Hostinger public_html
   ```

6. **Test**
   - Create free account
   - Join group annymously (should fail)
   - Upgrade to PREMIUM
   - Join annymously (should work)
   - Create event
   - Test Stripe checkout
   - Verify email notifications

---

## 📧 Email Notifications

Configured in `lib/email.ts`:

- ✉️ Event created confirmation
- ✉️ Event expiring soon (7 days)
- ✉️ Participant interest notification
- ✉️ Group expiring soon
- ✉️ Group renewal reminder

---

## 🛡️ Security Notes

- ✅ Anonymity is **per-group** (not per-user)
- ✅ Free users **cannot** be annymous
- ✅ Admin can still see real user behind "Anonyme"
- ✅ Event data validated server-side
- ✅ Stripe keys use `.env` (never client-side secret)
- ✅ RLS policies ensure privacy

---

## 🎯 Monetization Summary

```
User Journey → Revenue:

Free user
  ↓
Upgrade PASS_EPICURIEN (€24,99)
  ↓
Join annymous groups ✓
  ↓
Want to create event?
  Upgrade to CREATOR or pay €100 for event
  ↓
Event succeeds → Invite more friends
  ↓
Friends upgrade
  ↓
Ecosystem grows 🚀
```

**Estimated LTV:** €150-300 per active user (over 2 years)

---

## ❓ Support

For questions or issues:
1. Check this guide
2. Review code comments
3. Check Supabase error logs
4. Check Stripe dashboard

---

**Created:** 2026-08-09  
**Version:** 1.0.0  
**Status:** ✅ Ready for deployment
