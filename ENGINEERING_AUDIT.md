# xlibertine — Engineering Audit & Implementation Plan

**Status:** Production-ready template, Supabase + Gemini, but critical gaps for revenue & UX

---

## 🔴 CRITICAL (Must fix before revenue)

### 1. **Stripe Integration Broken**
**Problem:** Payments disabled with "Passerelle de paiement non configurée" banner
- `lib/stripe.ts` has no actual Stripe initialization
- No Stripe API keys configured
- `app/api/payments/` routes exist but not connected
- Payment modal confirms but doesn't charge (test mode only)

**Fix:**
- [ ] Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` & `STRIPE_SECRET_KEY` to `.env.local`
- [ ] Implement Stripe webhook handler (`app/api/webhooks/stripe`)
- [ ] Connect abonnement plan IDs to Stripe products
- [ ] Remove "Stripe not configured" warning when live
- [ ] Add real payment checkout flow (Stripe Checkout or Elements)

**Impact:** Zero revenue until fixed

---

### 2. **Email Notifications Missing**
**Problem:** No email system for:
- Welcome emails (account created)
- Abonnement confirmations
- Mot de passe réinitialisations
- Verification approvals
- Group invitations

**Fix:**
- [ ] Add Resend or SendGrid API keys
- [ ] Create email templates (`/app/api/emails/templates/`)
- [ ] Wire emails in auth flow & abonnement upgrades
- [ ] Test email delivery before launch

**Impact:** Poor user retention, lost recovery paths

---

### 3. **Real-time Chat Stubs**
**Problem:** Chat component exists but no WebSocket/Supabase real-time
- Messages don't sync across users live
- No presence indicators (who's online)
- No read receipts

**Fix:**
- [ ] Enable Supabase Realtime in project settings
- [ ] Add Supabase row-level security for messages
- [ ] Implement presence channel for online status
- [ ] Add message search & pagination

**Impact:** Chat feels broken, kills engagement

---

### 4. **Photo Verification Incomplete**
**Problem:** Verification UI exists but storage/moderation workflow is fake
- Photos upload to Supabase but no human review queue
- No admin dashboard for moderation
- Fake "pending" state with no followup

**Fix:**
- [ ] Supabase Storage bucket with signed URLs only
- [ ] Admin panel queue: `/admin/verifications`
- [ ] Email notifications to users on approval/rejection
- [ ] NSFW detection (Google Vision API or Cloudinary moderation)
- [ ] Age verification (match ID photo with face)

**Impact:** Legal risk, no community safety

---

### 5. **Admin Panel Incomplete**
**Problem:** `/admin` page exists but:
- No user banning system
- No group moderation
- No payment dispute handling
- No analytics dashboard

**Fix:**
- [ ] Add user management (ban, suspend, réinitialisation mot de passe)
- [ ] Group moderation (flag, archive, delete)
- [ ] Revenue analytics (MRR, churn, LTV)
- [ ] Payment disputes & refunds
- [ ] Activity logs (audit trail)

**Impact:** Can't manage platform abuse

---

## 🟡 HIGH PRIORITY (Week 1-2)

### 6. **SEO & Meta Tags**
**Problem:** No dynamic meta tags, no schema markup
- Same title/description everywhere
- No og:image for social shares
- No JSON-LD for search engines

**Fix:**
- [ ] Use `generateMetadata()` for each page
- [ ] Add og:image (share preview)
- [ ] Add BreadcrumbList schema
- [ ] Sitemap + robots.txt
- [ ] Google Search Console setup

**Impact:** No SEO traffic

---

### 7. **Profile Search Broken**
**Problem:** `/decouvrir` shows static profiles, no real filters
- No distance filtering (shows everyone)
- No gender/orientation filters
- No interests matching
- No sorting (new/online/verified)

**Fix:**
- [ ] Geolocation search (SQL radius query)
- [ ] Multi-select filters
- [ ] Sorting options
- [ ] Save search preferences
- [ ] Pagination (lazy load)

**Impact:** Users can't find matches

---

### 8. **Security Gaps**
**Problem:**
- No rate limiting on auth endpoints
- No CSRF protection
- No input validation (XSS risk)
- Supabase RLS policies not enforced everywhere
- No content filtering (spam/hate speech)

**Fix:**
- [ ] Add `next-rate-limit` middleware
- [ ] Enable CSRF via Next.js middleware
- [ ] Zod schemas for all inputs
- [ ] Supabase RLS on every table
- [ ] Bad word filter library

**Impact:** Account takeovers, spam, legal liability

---

### 9. **Mobile Optimization**
**Problem:** Desktop-first design, gaps on mobile
- Navbar not responsive
- Forms too wide on small screens
- Touch targets too small (buttons 20px)
- No mobile-first breakpoints

**Fix:**
- [ ] Mobile navbar (hamburger menu)
- [ ] Stack cards on mobile
- [ ] Touch-friendly buttons (48px minimum)
- [ ] Mobile-first Tailwind breakpoints
- [ ] Test on iPhone 12/15

**Impact:** 60%+ of users on mobile

---

### 10. **Analytics Missing**
**Problem:** No usage tracking
- Can't see which features users use
- No conversion funnel
- No churn analysis
- No A/B testing

**Fix:**
- [ ] Add Plausible or PostHog
- [ ] Track: signup, first message, first abonnement
- [ ] Funnel: Landing → Register → Verify → Subscribe
- [ ] Cohort analysis (retention by week)

**Impact:** Flying blind

---

## 🟢 MEDIUM PRIORITY (Week 3-4)

### 11. **Database Migrations**
**Fix:**
- [ ] Create Supabase SQL migrations for:
  - Users (UUID PK, indexed on email/username)
  - Groups (belongs_to user, has_many members)
  - Messages (group_id FK, full-text search on content)
  - Abonnements (track start/end dates)
  - Verification queue
  - Activity logs
- [ ] Add proper indexes on lat/lng for geo queries
- [ ] Set up automatic backups

---

### 12. **Error Handling**
**Problem:**
- No error boundaries (app crashes silently)
- 404/500 pages not customized
- API errors show raw stack traces

**Fix:**
- [ ] Add React error boundaries
- [ ] Custom 404/500 pages
- [ ] Sentry integration for error tracking
- [ ] User-friendly error messages

---

### 13. **Localization (i18n)**
**Problem:** Hard-coded French, can't scale to other regions

**Fix:**
- [ ] Add `next-intl` for i18n
- [ ] Translate UI to Portuguese (Cabo Verde market)
- [ ] Currency selector (€, USD, CVE)
- [ ] Language switcher in navbar

---

### 14. **Dark Mode Toggle**
**Problem:** Dark mode hard-coded, no user preference

**Fix:**
- [ ] Add theme switcher (Tailwind dark mode)
- [ ] Store preference in local storage
- [ ] Respect system preference

---

## 📋 CHECKLIST: What to Do This Week

- [ ] **Setup Stripe** — Get API keys, create products, add webhook
- [ ] **Fix chat** — Enable Supabase Realtime, test message sync
- [ ] **Email system** — Choose provider, create templates
- [ ] **Verification flow** — Build admin queue, add NSFW detection
- [ ] **Security** — Rate limit, CSRF, input validation, RLS
- [ ] **Mobile** — Test on mobile, fix responsive issues
- [ ] **Analytics** — Install PostHog or Plausible
- [ ] **Error handling** — Add error boundaries, custom 404/500

---

## 🚀 Revenue Blockers

1. **Stripe = $0 revenue** until fixed
2. **Email = users can't recover accounts**
3. **Chat = users leave (no engagement)**
4. **Verification = legal liability (NSFW content)**

**Estimated effort:** 40-60 dev hours to production-ready

---

## 📊 Post-Launch Monitoring

Once live, track:
- Daily active users (DAU)
- Abonnement conversion rate (target: 5-10%)
- Monthly recurring revenue (MRR)
- Churn rate (target: <5%/month)
- Message volume (health indicator)
- Verification queue length (support load)

