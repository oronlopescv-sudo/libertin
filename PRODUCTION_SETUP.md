# xlibertine — Production Setup Guide

**Last Updated:** August 2026  
**Status:** Ready for staging deployment

---

## 🚀 Pre-Deployment Checklist

### 1. Supabase Configuration

#### Create Database
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- [ ] Copy `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`

#### Create Tables
Run these SQL queries in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  age INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(NOW(), date_of_birth))::INT) STORED,
  gender TEXT NOT NULL CHECK (gender IN ('couple', 'homme', 'femme')),
  sexual_orientation TEXT NOT NULL,
  location TEXT NOT NULL,
  lat FLOAT,
  lng FLOAT,
  bio TEXT,
  subscription_tier TEXT DEFAULT 'FREE',
  subscription_start TIMESTAMP,
  subscription_end TIMESTAMP,
  stripe_customer_id TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_admin BOOLEAN DEFAULT FALSE,
  blocked_user_ids UUID[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id),
  is_private BOOLEAN DEFAULT FALSE,
  max_members INT DEFAULT 50,
  member_count INT DEFAULT 0,
  category TEXT,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Verification photos
CREATE TABLE verification_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_photos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id OR is_verified);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Enable Real-time
- [ ] Go to Supabase Dashboard → Replication
- [ ] Enable real-time for `messages` table
- [ ] Enable real-time for `users` table (presence)

---

### 2. Stripe Configuration

#### Create Stripe Account
- [ ] Register at https://stripe.com
- [ ] Create products for each tier:
  - **Pass Épicurien 3M** → Product ID: `prod_3m_xxx`
  - **Pass Privilège 12M** → Product ID: `prod_12m_xxx`
  - **Pass VIP Elite 24M** → Product ID: `prod_24m_xxx`

#### Add Prices
For each product, create a price:
- 3M: €16 (one-time payment)
- 12M: €25 (one-time payment)
- 24M: €70 (one-time payment)

**Note:** These are one-time payments, not recurring subscriptions.

#### Get API Keys
- [ ] Copy **Publishable Key** (`pk_live_xxx`) to `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Copy **Secret Key** (`sk_live_xxx`) to `STRIPE_SECRET_KEY`
- [ ] Copy **Webhook Secret** to `STRIPE_WEBHOOK_SECRET`

#### Create Webhook Endpoint
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint: `https://xlibertine.com/api/webhooks/stripe`
- [ ] Subscribe to events:
  - `checkout.session.completed`
  - `charge.succeeded`
  - `customer.subscription.deleted`

---

### 3. Email Configuration (Resend)

#### Setup Resend
- [ ] Register at https://resend.com
- [ ] Copy API Key to `RESEND_API_KEY`
- [ ] Verify sender email: `noreply@xlibertine.com`
- [ ] Create email templates:
  - Welcome email
  - Subscription confirmation
  - Password reset
  - Verification approval/rejection

#### Install Email Library
```bash
npm install resend
```

---

### 4. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
DATABASE_URL=postgresql://postgres:...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRODUCT_PREMIUM_3M=prod_xxx
STRIPE_PRODUCT_PREMIUM_12M=prod_xxx
STRIPE_PRODUCT_PREMIUM_24M=prod_xxx

# Email
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@xlibertine.com

# App
NEXT_PUBLIC_APP_URL=https://xlibertine.com
NODE_ENV=production
```

---

## 🌐 Deployment (Hostinger Shared Hosting)

### 1. Build & Upload

```bash
# Build production bundle
npm run build

# Upload to Hostinger
# Use FTP or Git push
# Folder: public_html/
```

### 2. Configure Hostinger

- [ ] Set Node.js version to 20+
- [ ] Configure domain: `xlibertine.com` → `public_html/`
- [ ] Set environment variables in Hostinger panel
- [ ] Configure SSL certificate (Hostinger auto-renews)

### 3. Deploy

```bash
# Push to production
git add .
git commit -m "chore: production deployment"
git push origin main

# Hostinger will auto-deploy if webhook is configured
```

---

## ✅ Post-Deployment Testing

### 1. Core Functionality
- [ ] Homepage loads without errors
- [ ] Register new account
- [ ] Login with credentials
- [ ] Upload profile photo
- [ ] Search profiles by location
- [ ] Send message in group
- [ ] Subscribe to Premium plan
- [ ] Verify Stripe charge in dashboard

### 2. Email Testing
- [ ] Receive welcome email on signup
- [ ] Receive verification email
- [ ] Password reset email works
- [ ] Subscription confirmation email

### 3. Mobile Testing
- [ ] Navbar hamburger menu on mobile
- [ ] Forms responsive on small screens
- [ ] Profile cards stack correctly
- [ ] Chat readable on mobile

### 4. Security Testing
- [ ] Rate limiting works (test with rapid requests)
- [ ] XSS prevention (try `<script>alert('xss')</script>`)
- [ ] SQL injection prevention
- [ ] Supabase RLS enforced
- [ ] HTTPS/SSL working

---

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Zero errors in Hostinger error logs
- [ ] Stripe webhooks received successfully
- [ ] Email delivery rate > 99%
- [ ] No SQL errors in Supabase logs

### Weekly Checks
- [ ] Supabase database backups exist
- [ ] Monitor active users & message volume
- [ ] Review verification queue length
- [ ] Check payment success rate

### Monthly Maintenance
- [ ] Review Stripe disputes/chargebacks
- [ ] Update dependencies (`npm outdated`)
- [ ] Security patches
- [ ] Performance audit (Lighthouse)

---

## 🔐 Security Hardening

### Before Going Live
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS headers properly
- [ ] Rotate all secrets (API keys, database passwords)
- [ ] Set up error tracking (Sentry)
- [ ] Enable audit logs in Supabase
- [ ] Configure firewalls/DDoS protection
- [ ] Test password reset flow
- [ ] Enable 2FA for admin accounts

---

## 🆘 Troubleshooting

### Stripe Not Working
- [ ] Check `STRIPE_SECRET_KEY` is set
- [ ] Verify Stripe account is live (not test mode)
- [ ] Check webhook endpoint is accessible
- [ ] Review Stripe logs for errors

### Emails Not Sending
- [ ] Check `RESEND_API_KEY` is valid
- [ ] Verify `RESEND_FROM_EMAIL` is authenticated
- [ ] Check spam folder for test emails
- [ ] Review Resend logs

### Database Connection Issues
- [ ] Verify `DATABASE_URL` is correct
- [ ] Check Supabase project is running
- [ ] Ensure firewall allows connections
- [ ] Check connection pool limits

---

## 📞 Support

For issues or questions:
- Email: `support@xlibertine.com`
- Documentation: `/docs`
- Error tracking: https://sentry.io

