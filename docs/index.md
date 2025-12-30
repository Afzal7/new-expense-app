# Next.js SaaS Starter - Project Documentation

> **Generated:** 2025-12-26 | **Scan Level:** Quick | **Type:** Web Application (Monolith)

## Quick Reference

| Property | Value |
|----------|-------|
| **Framework** | Next.js 16.1.0 (App Router) |
| **Language** | TypeScript 5.x |
| **Database** | MongoDB / Mongoose |
| **Auth** | Better Auth 1.4.7 |
| **Payments** | Stripe 20.x |
| **UI** | Tailwind CSS v4 + shadcn/ui |
| **State** | TanStack Query 5.x |
| **Email** | Resend 6.x |

---

## 📚 Generated Documentation

### Core Documentation
- [Project Overview](./project-overview.md) - Executive summary and tech stack
- [Architecture](./architecture.md) - System design and patterns
- [Source Tree Analysis](./source-tree-analysis.md) - Annotated directory structure

### Development
- [Development Guide](./development-guide.md) - Setup, build, and test instructions
- [Component Inventory](./component-inventory.md) - UI and shared components

### API & Data
- [API Contracts](./api-contracts.md) - API routes and endpoints _(To be generated)_
- [Data Models](./data-models.md) - Database schema documentation _(To be generated)_

---

## 📄 Existing Documentation

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview and getting started |
| [base-implementation.md](./base-implementation.md) | Base implementation details |
| [context.md](./context.md) | Project context |
| [expense-app.md](./expense-app.md) | Expense app feature documentation |
| [production-setup.md](./production-setup.md) | Production deployment guide |
| [test-fe.md](./test-fe.md) | Frontend testing documentation |
| [user-journeys.md](./user-journeys.md) | User journey mappings |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in required values (see README.md)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Project Status

This is a **brownfield project** with existing functionality:
- ✅ Authentication (email/password + Google OAuth)
- ✅ Organizations with member management
- ✅ Stripe subscriptions (free/pro plans)
- ✅ Dashboard with sidebar navigation
- ✅ Feature gating based on subscription

Use this documentation index when creating brownfield PRDs for new features.
