# Source Tree Analysis

> Annotated directory structure for Next.js SaaS Starter

## Project Root Structure

```
next-starter/
├── app/                      # Next.js 16 App Router (main application)
│   ├── (auth)/               # Auth route group (public)
│   │   ├── forgot-password/  # Password reset request
│   │   ├── login/            # User login
│   │   ├── reset-password/   # Password reset form
│   │   ├── signup/           # User registration
│   │   └── verify-email/     # Email verification
│   ├── api/                  # API routes
│   │   ├── auth/             # Better Auth API handler
│   │   └── health/           # Health check endpoint
│   ├── dashboard/            # Protected dashboard (requires auth)
│   │   ├── _actions/         # Server actions
│   │   ├── _components/      # Dashboard-specific components (12)
│   │   ├── invitations/      # User invitation management
│   │   ├── organizations/    # Organization management
│   │   │   └── [id]/         # Dynamic org routes
│   │   ├── settings/         # User settings
│   │   └── upgrade/          # Subscription upgrade
│   ├── error.tsx             # Error boundary
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   ├── not-found.tsx         # 404 page
│   ├── page.tsx              # Homepage
│   └── template.tsx          # Template wrapper
│
├── components/               # Shared React components
│   ├── animations/           # Animation components (1)
│   ├── providers/            # React context providers (1)
│   ├── shadcn-studio/        # shadcn customizations (4)
│   ├── shared/               # Business components (8)
│   │   ├── dashboard-breadcrumb.tsx
│   │   ├── empty-state.tsx
│   │   ├── error-state.tsx
│   │   ├── loading-skeleton.tsx
│   │   ├── oauth-button.tsx
│   │   ├── pro-only.tsx
│   │   ├── subscription-banner.tsx
│   │   └── subscription-status.tsx
│   ├── ui/                   # shadcn/ui components (27)
│   │   ├── alert-dialog.tsx   ├── dropdown-menu.tsx
│   │   ├── alert.tsx          ├── input.tsx
│   │   ├── animated-group.tsx ├── label.tsx
│   │   ├── avatar.tsx         ├── radio-group.tsx
│   │   ├── badge.tsx          ├── select.tsx
│   │   ├── breadcrumb.tsx     ├── separator.tsx
│   │   ├── button.tsx         ├── sheet.tsx
│   │   ├── card.tsx           ├── sidebar.tsx (21KB)
│   │   ├── collapsible.tsx    ├── skeleton.tsx
│   │   ├── dialog.tsx         ├── sonner.tsx
│   │   └── ...more
│   ├── error-boundary.tsx    # Error boundary component
│   ├── footer-one.tsx        # Footer component
│   ├── header.tsx            # Header component
│   ├── hero-section.tsx      # Hero section (15KB)
│   ├── login.tsx             # Login form
│   ├── logo.tsx              # Logo component
│   ├── pricing.tsx           # Pricing display
│   ├── providers.tsx         # Provider wrapper
│   └── sign-up.tsx           # Signup form
│
├── hooks/                    # Custom React hooks (10)
│   ├── use-feature-gate.ts   # Feature gating (3.5KB)
│   ├── use-mobile.ts         # Mobile detection
│   ├── use-organization-context.ts
│   ├── use-organization-crud.ts    # CRUD operations (4.8KB)
│   ├── use-organization-invitations.ts  # Invitations (5.9KB)
│   ├── use-organization-members.ts # Member management (3.4KB)
│   ├── use-organization.ts   # Data fetching
│   ├── use-subscription-mutations.ts # Mutations (2.9KB)
│   ├── use-subscription.ts   # Subscription data (3.7KB)
│   └── use-user-invitations.ts # User invitations (5.1KB)
│
├── lib/                      # Core utilities (14 files)
│   ├── auth.ts               # Better Auth config (9.4KB) ⭐
│   ├── auth-client.ts        # Client auth utilities
│   ├── config.ts             # App configuration (3.5KB)
│   ├── constants.ts          # Application constants
│   ├── db.ts                 # MongoDB connection (3.7KB) ⭐
│   ├── email.ts              # Email utilities (6.2KB)
│   ├── env.ts                # Environment validation (3.0KB)
│   ├── errors.ts             # Error handling (2.0KB)
│   ├── models.ts             # Mongoose models
│   ├── shutdown.ts           # Graceful shutdown
│   ├── stripe.ts             # Stripe client
│   ├── toast.ts              # Toast notifications
│   ├── types.ts              # Type definitions
│   └── utils.ts              # General utilities
│
├── docs/                     # Documentation (this folder)
│   ├── index.md              # Documentation index
│   ├── project-overview.md   # Project overview
│   ├── architecture.md       # Architecture docs
│   └── ...existing docs
│
├── public/                   # Static assets
│
├── _bmad/                    # BMAD workflow tools
│
└── Configuration Files
    ├── .env.example          # Environment template
    ├── package.json          # Dependencies
    ├── tsconfig.json         # TypeScript config
    ├── next.config.ts        # Next.js config
    ├── tailwind.config.ts    # Tailwind config (via postcss)
    ├── postcss.config.mjs    # PostCSS config
    ├── eslint.config.mjs     # ESLint config
    └── components.json       # shadcn/ui config
```

---

## Critical Folders Summary

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `app/` | Main application routes | `layout.tsx`, `page.tsx` |
| `app/(auth)/` | Authentication flows | 5 route folders |
| `app/dashboard/` | Protected dashboard | `layout.tsx` (10KB) |
| `app/api/` | API endpoints | auth handler, health check |
| `components/ui/` | shadcn components | 27 components |
| `components/shared/` | Business components | 8 components |
| `hooks/` | React hooks | 10 hooks |
| `lib/` | Core utilities | 14 files, `auth.ts` key |

---

## Entry Points

| Entry Point | Path | Purpose |
|-------------|------|---------|
| **Main Layout** | `app/layout.tsx` | Root application layout |
| **Homepage** | `app/page.tsx` | Landing page |
| **Dashboard Layout** | `app/dashboard/layout.tsx` | Dashboard wrapper |
| **Auth Handler** | `app/api/auth/[...all]/route.ts` | Better Auth API |

---

## Key Files by Size

| File | Size | Purpose |
|------|------|---------|
| `components/ui/sidebar.tsx` | 21.7KB | Sidebar component with navigation |
| `components/hero-section.tsx` | 15.5KB | Homepage hero section |
| `app/dashboard/layout.tsx` | 10.6KB | Dashboard layout with sidebar |
| `lib/auth.ts` | 9.4KB | Better Auth configuration |
| `docs/user-journeys.md` | 29.4KB | Existing documentation |
