# Expense App

A UX-first expense management platform designed for SMBs (10-500 employees). Transform chaotic receipt management into a seamless, frictionless experience with dopamine-driven design that makes expense tracking feel effortless.

## Stack

- **Framework**: Next.js 14+ (App Router)
- **Auth**: Better Auth (email/password + Google OAuth)
- **Database**: MongoDB with Mongoose
- **Payments**: Stripe (subscriptions with free trial)
- **Email**: Resend
- **UI**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query
- **File Upload**: Secure receipt storage

## Features

### Core Expense Management

- **Unified Expense Entity**: Single form for 1 to N line items with attachment support
- **Dual-Flow System**:
  - **Flow A**: Snap receipt → Add items → Submit for reimbursement
  - **Flow B**: Request pre-approval → Incur expense → Attach receipt → Reimburse
- **Flexible State Machine**: Draft → Pre-Approval Pending → Pre-Approved → Approved → Rejected → Reimbursed

### User Experience

- **Dopamine-Driven Design**: Micro-interactions and smooth transitions for psychological rewards
- **Privacy-First Architecture**: Personal vault for private expenses, seamless org linking
- **Reactive Onboarding**: Capture expenses before org setup, link automatically when joining
- **Mobile-First**: Full functionality on mobile web

### Organization & Workflow

- **Role-Based Access**: Employee, Manager, Finance roles with appropriate permissions
- **Manager Review Queue**: High-density view for efficient expense approvals
- **Organization Management**: Member invitations, role management, team collaboration
- **Audit Trail**: Immutable change logs for compliance and transparency

### Business Features

- **Subscription Plans**: Free/pro tiers with Stripe integration (14-day trial)
- **Export Capabilities**: CSV/PDF exports for finance and reimbursement processing
- **Secure File Storage**: Receipt uploads with integrity verification
- **Dark Mode**: Complete theme support

### Security & Compliance

- **Fintech-Grade Security**: Logical multi-tenancy, verified reviewers only
- **Audit-Ready**: Complete change history for financial accountability
- **Data Portability**: Filtered exports for external processing

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- Stripe account for payments
- Resend account for emails

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

| Variable                      | Description                                  |
| ----------------------------- | -------------------------------------------- |
| `MONGODB_URI`                 | MongoDB connection string                    |
| `BETTER_AUTH_SECRET`          | Random 32+ character secret                  |
| `NEXT_PUBLIC_APP_URL`         | Your app URL (e.g., `http://localhost:3000`) |
| `STRIPE_SECRET_KEY`           | Stripe secret key                            |
| `STRIPE_WEBHOOK_SECRET`       | Stripe webhook signing secret                |
| `STRIPE_PRO_MONTHLY_PRICE_ID` | Stripe price ID for monthly pro plan         |
| `RESEND_API_KEY`              | Resend API key for emails                    |

Optional variables:

| Variable                     | Description                         |
| ---------------------------- | ----------------------------------- |
| `GOOGLE_CLIENT_ID`           | Google OAuth client ID              |
| `GOOGLE_CLIENT_SECRET`       | Google OAuth client secret          |
| `STRIPE_PRO_ANNUAL_PRICE_ID` | Stripe price ID for annual pro plan |

### 3. Set up Stripe

1. Create a Stripe account and get your API keys
2. Create a product with monthly and annual price IDs
3. Set up a webhook endpoint pointing to `/api/stripe/webhook`
4. Add the webhook signing secret to your environment

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start capturing expenses!

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/             # Authentication pages
│   ├── api/                # API routes (auth, expenses, uploads)
│   ├── dashboard/          # Main dashboard with expenses
│   │   ├── expenses/       # Expense management pages
│   │   ├── organizations/  # Organization management
│   │   └── settings/       # User settings
│   └── error.tsx           # Error boundaries
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── shared/             # Shared components (breadcrumb, etc.)
│   ├── animations/         # Dopamine-driven animations
│   ├── expense-form.tsx    # Unified expense form
│   ├── file-upload.tsx     # Receipt upload component
│   └── line-item-form.tsx  # Expense line item management
├── hooks/                  # Custom React hooks
│   ├── use-expenses.ts     # Expense data management
│   ├── use-organization.ts # Organization logic
│   └── use-subscription.ts # Subscription handling
├── lib/
│   ├── auth.ts             # Better Auth configuration
│   ├── db.ts               # MongoDB connection
│   ├── stripe.ts           # Stripe integration
│   ├── email.ts            # Email utilities
│   ├── types.ts            # TypeScript definitions
│   └── utils.ts            # Helper functions
├── models/                 # Mongoose schemas
│   └── expense.ts          # Expense model with state machine
├── specs/                  # Project specifications
├── tests/                  # Integration and unit tests
└── types/                  # Type definitions
```

## Usage Examples

### Quick Expense Capture (Flow A)

1. **Snap & Submit**: Take a photo of your receipt
2. **Add Details**: The app automatically extracts merchant, amount, and date
3. **Categorize**: Select expense category (Office Supplies, Travel, Meals, etc.)
4. **Submit**: Choose a manager for approval or submit for reimbursement

### Pre-Approval Requests (Flow B)

1. **Plan Ahead**: Create a pre-approval request for upcoming expenses
2. **Get Approval**: Manager reviews and approves before you spend
3. **Incur Expense**: Make the purchase with confidence
4. **Attach Receipt**: Upload proof and get reimbursed instantly

### Manager Review Queue

1. **View Pending**: See all expenses requiring your approval
2. **Quick Actions**: Approve, reject, or comment on submissions
3. **Bulk Processing**: Handle multiple expenses efficiently

### Personal Vault

1. **Private Expenses**: Track personal spending in the same app
2. **Seamless Transition**: Convert personal expenses to business when needed
3. **Privacy Protected**: Personal data stays private until explicitly shared

### Organization Onboarding

1. **Individual Use**: Start capturing expenses before joining an organization
2. **Join Team**: Accept organization invitation
3. **Link Drafts**: Automatically associate existing drafts with your team
4. **Full Access**: Gain access to team workflows and approvals

## Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint and type checking
npm run format:check # Check code formatting
```

## Testing

```bash
npm run test        # Run unit tests
npm run test:integration # Run integration tests
```

## Customization

### App Configuration

- Update `lib/config.ts` for app name, logo, and branding
- Modify expense categories in `lib/constants/expense-states.ts`
- Configure file upload limits in `lib/config.ts`

### Subscription & Limits

- Modify subscription plans in `lib/auth.ts`
- Adjust organization member limits (default: 3 members for free plan)
- Configure expense state transitions and workflows

### Expense Features

- Customize the state machine in `models/expense.ts`
- Add new expense categories as needed
- Modify approval workflows for different organization types

## License

MIT
