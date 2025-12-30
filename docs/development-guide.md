# Development Guide

> Setup, build, and development instructions for Next.js SaaS Starter

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | LTS recommended |
| npm | 9+ | Comes with Node.js |
| MongoDB | 6+ | Local or Atlas cluster |
| Stripe Account | — | For payment features |
| Resend Account | — | For email features |

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url>
cd next-starter

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Fill in environment variables (see below)

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Environment Setup

### Required Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/next-starter

# Auth
BETTER_AUTH_SECRET=your-32-character-random-secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...

# Email
RESEND_API_KEY=re_...
```

### Optional Variables

```bash
# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Additional Stripe
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint for code quality |

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature

# Start dev server
npm run dev

# Make changes and test
# Lint before committing
npm run lint

# Commit and push
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

### 2. Adding shadcn/ui Components

```bash
# Add a new component
npx shadcn@latest add <component-name>

# Example
npx shadcn@latest add accordion
```

Components are added to `/components/ui/`

### 3. Creating New Routes

1. Create folder in `/app/` following Next.js conventions
2. Add `page.tsx` for the route
3. Add `layout.tsx` if needed for shared layout
4. For protected routes, add under `/app/dashboard/`

### 4. Creating New Hooks

1. Create file in `/hooks/`
2. Follow naming convention: `use-<feature-name>.ts`
3. Export the hook function

---

## Database Setup

### Local MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:6

# Or install MongoDB Community Edition
# https://www.mongodb.com/try/download/community
```

### MongoDB Atlas

1. Create cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Add to `MONGODB_URI` in `.env`

---

## Stripe Setup

### 1. Create Stripe Account
Visit [dashboard.stripe.com](https://dashboard.stripe.com)

### 2. Get API Keys
- Navigate to Developers → API keys
- Copy secret key to `STRIPE_SECRET_KEY`

### 3. Create Products
- Navigate to Products → Create Product
- Create monthly and/or annual price
- Copy price ID to `STRIPE_PRO_MONTHLY_PRICE_ID`

### 4. Setup Webhooks
- Navigate to Developers → Webhooks
- Add endpoint: `<your-url>/api/auth/stripe/webhook`
- Select events: `checkout.session.completed`, `customer.subscription.*`
- Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 5. Local Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward webhooks to localhost
stripe listen --forward-to localhost:3000/api/auth/stripe/webhook
```

---

## Resend Setup

### 1. Create Account
Visit [resend.com](https://resend.com)

### 2. Get API Key
- Navigate to API Keys
- Create new key
- Copy to `RESEND_API_KEY`

### 3. Verify Domain (Production)
- Add DNS records for your domain
- Required for sending from custom domain

---

## Code Organization

### Adding New Features

1. **New Page**: Add under `/app/`
2. **New Component**: Add under `/components/shared/` or feature-specific folder
3. **New Hook**: Add under `/hooks/`
4. **New Utility**: Add under `/lib/`
5. **New API**: Add under `/app/api/`

### Conventions

| Convention | Example |
|------------|---------|
| Files | `kebab-case.tsx` |
| Components | `PascalCase` |
| Hooks | `useCamelCase` |
| Functions | `camelCase` |
| Constants | `UPPER_SNAKE_CASE` |

---

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running
- Check network access in Atlas

**Stripe Webhook Errors**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Use Stripe CLI for local testing
- Check webhook endpoint URL

**Auth Issues**
- Clear browser cookies
- Check `BETTER_AUTH_SECRET` is set
- Verify `NEXT_PUBLIC_APP_URL` matches

**Build Errors**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```
