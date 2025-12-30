# Project Overview

> Next.js SaaS Starter - An opinionated template for building SaaS applications

## Executive Summary

This is a **Next.js 16 SaaS starter template** providing a complete foundation for building subscription-based web applications. It includes authentication, organization management, Stripe payments, and a modern dashboard UI.

## Purpose & Goals

- Provide a production-ready starting point for SaaS applications
- Include common SaaS patterns: auth, payments, organizations, feature gating
- Use modern technologies and best practices
- Enable rapid feature development on a solid foundation

---

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.1.0 | React framework with App Router |
| **Language** | TypeScript | 5.x | Type-safe JavaScript |
| **UI Framework** | Tailwind CSS | v4 | Utility-first CSS |
| **UI Components** | shadcn/ui | 3.6.2 | Accessible component library |
| **State Management** | TanStack Query | 5.x | Server state management |
| **Animation** | Motion (Framer) | 12.x | Animation library |
| **Auth** | Better Auth | 1.4.7 | Authentication library |
| **Database** | MongoDB | 6.x | Document database |
| **ORM** | Mongoose | 9.x | MongoDB ODM |
| **Payments** | Stripe | 20.x | Payment processing |
| **Email** | Resend | 6.x | Transactional emails |
| **Icons** | Lucide React | 0.562.0 | Icon library |

---

## Architecture Overview

### Pattern: Component-Based with Feature Modules

```
┌─────────────────────────────────────────────────────────┐
│                      Next.js App Router                 │
├─────────────────────────────────────────────────────────┤
│  (auth)/        │  dashboard/        │  api/            │
│  ├── login      │  ├── _components/  │  ├── auth/       │
│  ├── signup     │  ├── organizations/│  └── health/     │
│  ├── forgot-pw  │  ├── settings/     │                  │
│  └── verify     │  └── upgrade/      │                  │
├─────────────────────────────────────────────────────────┤
│                    Components Layer                      │
│  ├── ui/        (27 shadcn components)                  │
│  ├── shared/    (8 shared components)                   │
│  └── animations/ (animation utilities)                  │
├─────────────────────────────────────────────────────────┤
│                    Core Libraries (/lib)                │
│  ├── auth.ts       (Better Auth config)                 │
│  ├── db.ts         (MongoDB connection)                 │
│  ├── stripe.ts     (Stripe client)                      │
│  ├── email.ts      (Resend utilities)                   │
│  └── config.ts     (App configuration)                  │
├─────────────────────────────────────────────────────────┤
│                    Custom Hooks (/hooks)                │
│  ├── use-organization-*.ts  (5 organization hooks)      │
│  ├── use-subscription-*.ts  (2 subscription hooks)      │
│  └── use-feature-gate.ts    (feature gating)            │
└─────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Authentication
- Email/password authentication with password reset
- Google OAuth (optional)
- Email verification flow
- Session management via Better Auth

### 2. Organizations
- Create and manage organizations
- Member invitations with email
- Role management (owner, admin, member)
- Member limits based on subscription

### 3. Subscriptions
- Free and Pro plans
- 14-day free trial
- Stripe integration for payments
- Feature gating based on subscription status

### 4. Dashboard
- Responsive sidebar navigation
- Organization context switching
- Welcome cards and metrics displays
- Upgrade prompts and subscription management

---

## Environment Requirements

### Required Variables
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Random 32+ character secret |
| `NEXT_PUBLIC_APP_URL` | Application URL |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe monthly price ID |
| `RESEND_API_KEY` | Resend API key |

### Optional Variables
| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe annual price ID |

---

## Development Quick Start

```bash
npm install           # Install dependencies
cp .env.example .env  # Configure environment
npm run dev           # Start dev server (http://localhost:3000)
```
