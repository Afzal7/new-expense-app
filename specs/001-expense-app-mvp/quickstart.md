# Quickstart Guide: Expense App MVP

**Feature**: 001-expense-app-mvp
**Date**: 2025-01-01
**Target**: Developers setting up the expense management system

## Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or cloud)
- Cloudflare R2 account with API tokens
- Better Auth configuration

## Environment Setup

1. **Clone and install dependencies**:

   ```bash
   git clone <repository-url>
   cd expense-app
   npm install
   ```

2. **Configure environment variables**:
   Create `.env.local` with:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/expense-app

   # Better Auth
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:3000

   # Cloudflare R2
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_ACCOUNT_ID=your-account-id
   R2_BUCKET_NAME=expense-uploads

   # Email (optional, for notifications)
   EMAIL_FROM=noreply@yourdomain.com
   EMAIL_SERVER=smtp://username:password@smtp.yourdomain.com:587
   ```

3. **Database setup**:
   - Ensure MongoDB is running
   - The app will create collections automatically on first run

## Development Workflow

### Starting the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests
npm run test:run

# With coverage
npm run test:coverage
```

### Code Quality Checks

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Build verification
npm run build
```

## User Roles and Permissions

### Employee (Member)

- Create personal expenses (drafts or submitted)
- Edit/delete draft expenses
- View expense history and status
- Upload receipts and documents

### Manager

- All employee permissions
- View expenses assigned for approval
- Approve/reject pre-approval requests
- Final approval of expenses

### Admin

- All manager permissions
- Mark approved expenses as reimbursed
- View organization-wide expense reports
- Manage organization settings

## Key User Flows

### 1. Employee Expense Creation

1. Navigate to `/dashboard/expenses/create`
2. Fill expense details:
   - Total amount (optional, auto-calculated from line items)
   - Select managers (optional for private expenses)
3. Add line items:
   - Amount, date, description, category
   - Upload receipts (JPG/PNG/PDF, max 5MB)
4. Save as draft or submit for approval

### 2. Manager Approval Workflow

1. Navigate to `/dashboard/manager/approvals`
2. View pending approval requests
3. Filter by employee or search descriptions
4. Click expense to view details
5. Approve or reject with optional comments

### 3. Finance Reimbursement Processing

1. Navigate to `/dashboard/finance/reimbursements`
2. View approved expenses ready for reimbursement
3. Filter by employee or search
4. Click expense to review details
5. Mark as reimbursed

## API Endpoints

### Authentication

- `GET/POST /api/auth/*` - Better Auth endpoints
- Automatic redirects for unauthenticated users

### Expenses

- `GET /api/expenses` - List expenses with filtering/pagination
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/{id}` - Get expense details
- `PUT /api/expenses/{id}` - Update draft expense
- `PATCH /api/expenses/{id}` - Perform actions (submit/approve/reject/reimburse)

### File Upload

- `POST /api/upload/signed-url` - Get signed URL for upload
- `DELETE /api/upload/delete-signed-url` - Get signed URL for deletion

## Database Schema

### Key Collections

- `expenses` - Main expense documents with embedded line items and audit logs
- `users` - Managed by Better Auth
- `organizations` - Managed by Better Auth

### Indexes

- `{ userId: 1, state: 1 }` - User expense filtering
- `{ organizationId: 1, state: 1 }` - Organization-wide queries
- `{ state: 1, updatedAt: -1 }` - Approval/reimbursement queues

## File Storage

### Cloudflare R2 Configuration

- Files stored with user-specific paths: `uploads/{userId}/{timestamp}-{filename}`
- Signed URLs expire after 15 minutes
- Supported formats: JPG, PNG, PDF, TXT, DOC, DOCX
- Size limit: 5MB per file

### Upload Flow

1. Client requests signed URL from `/api/upload/signed-url`
2. Client uploads directly to Cloudflare R2
3. File URL stored in expense document
4. Files deleted when expenses are deleted

## State Management

### Expense States

1. **Draft** - User editing, can be modified/deleted
2. **Pre-Approval Pending** - Submitted for initial approval
3. **Pre-Approved** - Manager approved, user can add receipts
4. **Approval Pending** - Submitted for final approval
5. **Approved** - Ready for reimbursement
6. **Rejected** - Approval denied
7. **Reimbursed** - Payment processed

### State Transitions

- Draft → Pre-Approval Pending (user submits)
- Pre-Approval Pending → Pre-Approved (manager approves)
- Pre-Approved → Approval Pending (user submits for final approval)
- Approval Pending → Approved (manager approves)
- Approved → Reimbursed (admin marks as reimbursed)
- Any state → Rejected (manager rejects)

## Error Handling

### Common Error Responses

- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `400 Validation Error` - Invalid input data

### Client Error Handling

- Toast notifications for success/error states
- Loading indicators during operations
- Form validation with field-specific error messages
- Automatic retry for network failures

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production Cloudflare R2 credentials
- Set up proper domain for Better Auth

### Performance Monitoring

- Response times should be <100ms for form operations
- File uploads should complete within reasonable time limits
- Monitor database query performance
- Track API error rates

## Troubleshooting

### Common Issues

1. **Authentication not working**
   - Check `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
   - Ensure cookies are enabled

2. **File uploads failing**
   - Verify Cloudflare R2 credentials
   - Check bucket permissions
   - Ensure file size/format limits

3. **Database connection issues**
   - Verify MongoDB URI
   - Check network connectivity
   - Ensure database user has proper permissions

4. **State transition errors**
   - Check user permissions for the action
   - Verify expense is in correct state for transition
   - Review audit logs for previous actions

### Logs and Debugging

- Server logs available in console/stdout
- Client errors visible in browser developer tools
- Database queries logged with execution times
- Audit logs track all expense changes

## Next Steps

1. **Complete User Story 1** - Employee expense creation (MVP)
2. **Implement User Story 2** - Manager approval workflow
3. **Implement User Story 3** - Finance reimbursement processing
4. **Add reporting features** - Expense analytics and export
5. **Enhance mobile experience** - Responsive design improvements

For additional features or modifications, refer to the specification documents in `/specs/001-expense-app-mvp/`.
