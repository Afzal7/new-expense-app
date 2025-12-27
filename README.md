# Next.js SaaS Starter

An opinionated Next.js 16 starter template with authentication, subscriptions, organizations, and everything you need to ship a SaaS product.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Database**: MongoDB
- **Payments**: Stripe (subscriptions with free trial)
- **Email**: Resend
- **UI**: Tailwind CSS v4 + shadcn/ui
- **State**: TanStack Query

## Features

- Email/password authentication with password reset
- Google OAuth (optional)
- Organizations with member invitations and role management
- Stripe subscriptions (free/pro plans with 14-day trial)
- Feature gating based on subscription status
- Dashboard with sidebar navigation
- Dark mode support
- Error boundaries and toast notifications

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `BETTER_AUTH_SECRET` | Random 32+ character secret |
| `NEXT_PUBLIC_APP_URL` | Your app URL (e.g., `http://localhost:3000`) |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe price ID for monthly pro plan |
| `RESEND_API_KEY` | Resend API key for emails |

Optional variables:

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe price ID for annual pro plan |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth pages (login, signup, reset)
│   ├── api/                # API routes
│   └── dashboard/          # Protected dashboard pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── shared/             # Shared components
│   └── animations/         # Animation components
├── hooks/                  # Custom React hooks
├── lib/                    # Core utilities
│   ├── auth.ts             # Better Auth configuration
│   ├── auth-client.ts      # Client-side auth utilities
│   ├── db.ts               # MongoDB connection
│   ├── stripe.ts           # Stripe client
│   ├── email.ts            # Email utilities
│   └── env.ts              # Environment validation
└── middleware/             # Route middleware
```

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Stripe Setup

1. Create a Stripe account and get your API keys
2. Create a product with monthly and annual price IDs
3. Set up a webhook endpoint pointing to `/api/auth/stripe/webhook`
4. Add the webhook signing secret to your environment

## Customization

- Update `lib/config.ts` for app name, logo, and branding
- Modify subscription plans in `lib/auth.ts`
- Adjust organization member limits in `lib/auth.ts` (default: 3 members)

## License

MIT
