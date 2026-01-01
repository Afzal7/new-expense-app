# Quickstart: Expense App MVP (User Story 1)

## Prerequisites

- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)
- Cloudflare R2 account for file storage (optional for basic functionality)
- Accounts for optional services: Stripe (payments), Resend (emails), Google/Microsoft OAuth

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required values (at minimum: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`)
   - For file uploads, configure Cloudflare R2 credentials
4. Run the development server: `npm run dev`
   - The app will be available at `http://localhost:3000`

## Testing User Story 1

1. Sign up as employee
2. Navigate to expense creation page
3. Fill total amount and line items
4. Upload receipt image
5. Save as draft or submit for pre-approval
6. Verify toast feedback and state changes
