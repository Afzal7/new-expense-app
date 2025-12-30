# Architecture Documentation

> Next.js SaaS Starter - System Architecture

## Architecture Pattern

**Type:** Component-Based Architecture with Feature Modules  
**Style:** Layered with clear separation of concerns

---

## Layer Breakdown

### 1. Presentation Layer

#### App Router (`/app`)
Next.js 16 App Router structure with route groups:

| Route Group | Purpose |
|-------------|---------|
| `(auth)/` | Authentication pages (login, signup, password reset) |
| `dashboard/` | Protected dashboard with organization features |
| `api/` | API routes for auth and health checks |

#### Components (`/components`)
| Directory | Count | Purpose |
|-----------|-------|---------|
| `ui/` | 27 | shadcn/ui base components |
| `shared/` | 8 | Shared business components |
| `animations/` | 1 | Animation utilities |
| `providers/` | 1 | React context providers |

### 2. Business Logic Layer

#### Hooks (`/hooks`)
| Hook | Purpose |
|------|---------|
| `use-organization.ts` | Organization data fetching |
| `use-organization-crud.ts` | Organization CRUD operations |
| `use-organization-members.ts` | Member management |
| `use-organization-invitations.ts` | Invitation handling |
| `use-organization-context.ts` | Organization context |
| `use-subscription.ts` | Subscription data |
| `use-subscription-mutations.ts` | Subscription operations |
| `use-feature-gate.ts` | Feature gating logic |
| `use-user-invitations.ts` | User invitation handling |
| `use-mobile.ts` | Mobile detection |

### 3. Infrastructure Layer

#### Lib (`/lib`)
| Module | Size | Purpose |
|--------|------|---------|
| `auth.ts` | 9.3KB | Better Auth configuration with Stripe integration |
| `auth-client.ts` | 0.8KB | Client-side auth utilities |
| `db.ts` | 3.7KB | MongoDB/Mongoose connection management |
| `stripe.ts` | 0.8KB | Stripe client initialization |
| `email.ts` | 6.2KB | Resend email utilities |
| `config.ts` | 3.5KB | Application configuration |
| `env.ts` | 3.0KB | Environment variable validation |
| `errors.ts` | 2.0KB | Error handling utilities |
| `types.ts` | 1.5KB | TypeScript type definitions |
| `utils.ts` | 0.2KB | General utilities |

---

## Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                     User Browser                          │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│              Next.js App Router (RSC + Client)           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │ Auth Pages  │  │  Dashboard  │  │   API Routes    │   │
│  └─────────────┘  └─────────────┘  └─────────────────┘   │
└──────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────┐
│                 Better Auth Middleware                    │
│     Session management, route protection, org context     │
└──────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ MongoDB  │  │  Stripe  │  │  Resend  │
        │ Database │  │ Payments │  │  Email   │
        └──────────┘  └──────────┘  └──────────┘
```

---

## Authentication Flow

1. **Sign Up**: User creates account → Email verification sent → User verifies → Session created
2. **Login**: User enters credentials → Better Auth validates → Session created → Redirect to dashboard
3. **OAuth**: User clicks Google → OAuth flow → Account linked → Session created
4. **Password Reset**: User requests reset → Email sent → User resets → Redirect to login

---

## Organization Model

```
Organization
├── id (ObjectId)
├── name (string)
├── slug (string)
├── createdAt (Date)
└── members[]
    ├── userId (ObjectId)
    ├── role (owner | admin | member)
    └── joinedAt (Date)

Invitations
├── organizationId
├── email
├── role
├── status (pending | accepted | rejected)
└── expiresAt
```

---

## Subscription Model

| Plan | Price | Features |
|------|-------|----------|
| Free | $0 | Basic features, 1 member limit |
| Pro (Monthly) | Configured in Stripe | All features, extended member limit |
| Pro (Annual) | Configured in Stripe | All features, extended member limit |

### Feature Gating

The `use-feature-gate.ts` hook checks subscription status and enables/disables features:
- Free tier: Limited to basic dashboard features
- Pro tier: Full access to all features

---

## Key Integration Points

### Better Auth + Stripe
- Located in: `lib/auth.ts`
- Handles subscription lifecycle events
- Syncs user subscription status

### Better Auth + MongoDB
- Located in: `lib/auth.ts` + `lib/db.ts`
- Uses MongoDB adapter
- Stores users, sessions, organizations

### Stripe Webhooks
- Endpoint: `/api/auth/stripe/webhook`
- Handles subscription events
- Updates user subscription status

---

## Security Considerations

1. **Session Management**: Better Auth handles secure sessions
2. **Route Protection**: Middleware protects `/dashboard/*` routes
3. **Environment Variables**: Validated via `lib/env.ts`
4. **Webhook Verification**: Stripe signatures verified
5. **Organization Access**: Role-based access control
