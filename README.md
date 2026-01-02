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

## API Documentation

The expense management system provides a RESTful API for managing expenses, file uploads, and user authentication. All API endpoints require authentication via session tokens.

### Authentication

Authentication is handled through Better Auth, which supports email/password and Google OAuth. Include the session token in the `Authorization` header or use cookies for authenticated requests.

### Expense States

Expenses can be in the following states:

- **Draft**: Initial state, editable by owner
- **Pre-Approval Pending**: Submitted for pre-approval
- **Pre-Approved**: Approved for spending (pre-approval flow)
- **Approval Pending**: Submitted for final approval
- **Approved**: Approved and ready for reimbursement
- **Rejected**: Denied by manager
- **Reimbursed**: Payment processed

### Expense API

#### GET /api/expenses

List expenses with pagination and filtering.

**Query Parameters:**

- `type` (optional): Filter by expense type - `"all"`, `"private"`, or `"org"`
- `search` (optional): Search in line item descriptions and categories
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `includeDeleted` (optional): Include soft-deleted expenses (default: false)

**Response:**

```json
{
  "expenses": [
    {
      "id": "string",
      "userId": "string",
      "organizationId": "string|null",
      "managerIds": ["string"],
      "totalAmount": "number",
      "state": "string",
      "lineItems": [
        {
          "amount": "number",
          "date": "string (ISO)",
          "description": "string",
          "category": "string",
          "attachments": ["string"]
        }
      ],
      "auditLog": [
        {
          "action": "string",
          "date": "string (ISO)",
          "actorId": "string",
          "previousValues": "object",
          "updatedValues": "object"
        }
      ],
      "createdAt": "string (ISO)",
      "updatedAt": "string (ISO)",
      "deletedAt": "string (ISO)|null"
    }
  ],
  "total": "number",
  "page": "number",
  "limit": "number",
  "totalPages": "number"
}
```

#### POST /api/expenses

Create a new expense.

**Request Body:**

```json
{
  "totalAmount": "number (optional)",
  "managerIds": ["string"] (optional for drafts),
  "lineItems": [
    {
      "amount": "number",
      "date": "string (ISO)",
      "description": "string (optional)",
      "category": "string (optional)",
      "attachments": ["string"]
    }
  ] (optional),
  "status": "string (optional, defaults to Draft)"
}
```

**Response:** Same as individual expense object (201 status)

#### GET /api/expenses/[id]

Get a specific expense by ID. Users can access their own expenses; managers can access expenses they manage.

**Response:** Individual expense object

#### PUT /api/expenses/[id]

Update a draft expense. Only the owner can update their expenses, and only when in draft state.

**Request Body:** Same as create, but all fields optional for partial updates

**Response:** Updated expense object

#### PATCH /api/expenses/[id]

Perform actions on expenses (submit, approve, reject, reimburse, delete, restore).

**Request Body:**

```json
{
  "action": "submit|approve|reject|reimburse|delete|restore"
}
```

**Response:** Updated expense object

### File Upload API

#### GET /api/upload/signed-url

Generate a signed URL for secure file upload to Cloudflare R2.

**Query Parameters:**

- `fileName`: Original filename
- `fileType`: MIME type (image/\*, application/pdf, etc.)
- `fileSize`: File size in bytes (max 50MB)

**Supported File Types:** JPEG, PNG, GIF, WebP, PDF, plain text, Word documents

**Response:**

```json
{
  "signedUrl": "string",
  "publicUrl": "string",
  "fileKey": "string"
}
```

#### DELETE /api/upload/delete-signed-url

Generate a signed URL for secure file deletion from Cloudflare R2.

**Query Parameters:**

- `fileKey`: The file key to delete

**Response:**

```json
{
  "signedUrl": "string",
  "fileKey": "string"
}
```

### Health Check API

#### GET /api/health

Check system health and database connectivity.

**Response:**

```json
{
  "status": "healthy|unhealthy",
  "timestamp": "string (ISO)",
  "services": {
    "database": "connected|disconnected"
  },
  "error": "string (only if unhealthy)"
}
```

### Authentication API

All authentication endpoints are handled by Better Auth at `/api/auth/[...all]`. This includes:

- **POST /api/auth/sign-up**: User registration
- **POST /api/auth/sign-in**: User login
- **POST /api/auth/sign-out**: User logout
- **GET /api/auth/session**: Get current session
- **GET/POST /api/auth/google**: Google OAuth flow

Refer to [Better Auth documentation](https://www.better-auth.com/) for detailed authentication API usage.

### Error Handling

All API endpoints return standardized error responses:

```json
{
  "error": {
    "message": "string",
    "details": {
      "general": ["string"],
      "fields": {
        "fieldName": ["string"]
      }
    }
  }
}
```

Common HTTP status codes:

- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error

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
