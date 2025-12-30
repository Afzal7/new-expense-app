---
project_name: 'expense-app'
user_name: 'Afzal'
date: '2025-12-28'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 18
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Framework**: Next.js 16.1.0 (App Router, Server Actions)
- **Runtime**: Node.js 20+ (Platform-agnostic, no Vercel-specific features)
- **Authentication**: Better Auth 1.4.7 (with Organization & Stripe plugins)
- **Database**: MongoDB (via Mongoose 9.0.2)
- **State Management**: TanStack Query v5 (React Query)
- **Animations**: Motion 12.23.26 (Framer Motion)
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Forms**: React Hook Form + Zod validation

## Critical Implementation Rules

### 1. Data Integrity & Integrity
- **Mandatory Transactions**: EVERY write operation (Create, Update, Delete) must be wrapped in a MongoDB session transaction to ensure atomic consistency.
- **Fail-Safe File Handling**: If a database transaction fails after a file upload (UploadThing), the agent MUST trigger an immediate manual cleanup of the uploaded asset.
- **Service Layer Isolation**: The `expenseService.ts` is the single source of truth for all expense mutations. Never perform raw database calls in Server Actions or Components.

### 2. Multi-Tenancy & Privacy
- **Logical Isolation**: Every query MUST include a filter for `organizationId` (for org expenses) or `userId` (for the Private Vault).
- **Visibility Service**: Use the `expenseVisibilityService` to wrap all queries and ensure privacy filters are never omitted.

### 3. Performance & UX (The "Golden Path")
- **<200ms Latency**: All interactive elements must feel "Dopamine-Driven." Use TanStack Query's **Optimistic Updates** to reflect state changes immediately in the UI.
- **DDD Micro-interactions**: Use Motion 12 for "Success Glows," "Soft Amber Pulses" (errors), and high-fidelity layout transitions.
- **RSC vs Client**: Use React Server Components for heavy fetching and Client Components for interactivity.

### 4. RBAC & Security
- **Employee Permissions**: Employees can create and read their own expenses, and update `Draft`, `Rejected`, AND `Pre-Approved` expenses (to add receipts to authorized budgets).
- **Action Guards**: Every Server Action must use the `verifyPermission` helper for role-based access control.
- **DTO Layer**: Never return raw Mongoose documents to the client; always use a DTO to strip sensitive fields.

---

## Coding Conventions

- **Naming**:
  - MongoDB Collections: `snake_case` (e.g., `audit_logs`).
  - Files: `camelCase.ts` (e.g., `expenseService.ts`).
  - Server Actions: `[verb][Entity]Action` (e.g., `updateExpenseAction`).
- **Structure**:
  - Business Logic: `lib/services/`
  - Zod Schemas: `lib/validations/`
  - DDD Components: `components/ddd/`

### **MANDATORY: Feature Component Pattern**

**ALL user actions and business operations MUST be implemented as standalone Feature Components.**

#### **Pattern Definition:**
A Feature Component is a self-contained React component that encapsulates a complete user interaction or business operation. It includes:
- ✅ **Trigger/Button** - The UI element that initiates the action
- ✅ **Modal/Dialog** - The interface for user input/configuration
- ✅ **Form Logic** - State management, validation, submission
- ✅ **Data Operations** - API calls, success/error handling
- ✅ **User Feedback** - Loading states, success messages, error handling
- ✅ **State Management** - All internal state for the operation

#### **Examples:**
```tsx
// ✅ CORRECT: Feature Components
<CreateExpense />           // Complete expense creation flow
<EditExpense expenseId={id} /> // Complete expense editing flow
<DeleteExpense expenseId={id} /> // Complete expense deletion flow
<InviteMember orgId={id} />     // Complete member invitation flow

// ❌ INCORRECT: Separated concerns
<CreateButton onClick={openDialog} />
<CreateDialog open={open} />  // Missing in separate file
useCreateForm()              // Logic separated from UI
```

#### **Benefits:**
- **Zero Configuration**: Just drop `<FeatureName props />` anywhere
- **Self-Contained**: No external state management required
- **Consistent UX**: Same experience across the entire application
- **Easy Testing**: Single component contains all logic
- **Maintainable**: Changes affect all instances automatically

#### **Implementation Rules:**
- **File Location**: `components/features/` (create this directory)
- **Naming**: `[Action][Entity].tsx` (e.g., `EditExpense.tsx`)
- **Props**: Only essential data (IDs, context) - no callbacks
- **State**: All internal state managed within the component
- **Composition**: Can be composed with other components but works standalone
- **Reusability**: Designed to work in any context (cards, pages, modals)

---

### **MANDATORY: Development Workflow Rules**

**ALL development MUST follow these strict protocols:**

#### **1. Task Planning (MANDATORY)**
- **Divide ALL tasks into logical blocks** before implementing
- **Document each block** with clear objectives and acceptance criteria
- **Get approval** for the breakdown before starting implementation
- **Track progress** through each logical block

#### **2. TypeScript Strict Mode (MANDATORY)**
- **NO `any` types allowed** - EVER
- **Proper type definitions** required for all data structures
- **Interface segregation** - Small, focused interfaces over large ones
- **Generic constraints** where appropriate
- **Type guards** for runtime type checking

#### **3. Quality Assurance (MANDATORY)**
- **Run lint AND build after EVERY implementation**
- **Zero tolerance** for lint errors or build failures
- **Block commits** until all checks pass
- **Document exceptions** with clear justification

#### **4. API Communication (MANDATORY)**
- **NEVER use native `fetch`** for API calls
- **Use TanStack Query** for data fetching and mutations
- **Implement proper error handling** with user-friendly messages
- **Type-safe API responses** with proper error types

#### **5. Component Architecture (MANDATORY)**
- **NO custom components** if a prebuilt library component exists
- **Prefer shadcn/ui components** over custom implementations
- **Use existing design system** components first
- **Only build custom components** for unique business logic

#### **Usage in Cards:**
```tsx
// ExpenseCard uses Feature Components
<ExpenseCard expense={expense}>
  <EditExpense expenseId={expense._id} />
  <DeleteExpense expenseId={expense._id} />
</ExpenseCard>
```

**MANDATORY**: AI agents MUST implement ALL new user actions using this Feature Component pattern. Never separate UI, logic, and state across multiple files.

## Deep-Dive: The "Golden Path" Patterns

### 1. Mandatory Audit Snapshot Structure
Every mutation must log an entry in the `auditLog` array with this exact structure:
```typescript
{
  timestamp: Date;
  action: 'CREATE' | 'UPDATE_STATUS' | 'LINK_ORG' | 'ATTACH_FILE';
  actorId: string; // userId of the person performing the action
  role: string;    // role at the time of action (Employee, Manager, etc.)
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>; // e.g., IP address, user agent
}
```

### 2. State Machine Transition Logic
Agents must strictly enforce these state boundaries:
- **Draft**: Initial state. Can move to `Pre-Approved` or `Submitted`.
- **Pre-Approved**: Managed by Managers. Employees can still *EDIT* (add items) while in this state.
- **Submitted**: Locked for Employee editing. Moves to `Approved` or `Rejected` by Managers.
- **Approved**: Moves to `Reimbursed` by Finance. Immutable except for the `status` field.
- **Rejected**: Can be moved back to `Draft` by the Employee for correction.

### 3. Dopamine-Driven Design (DDD) Standards
To maintain <200ms perceived latency, AI agents MUST:
- **Success Glow**: Apply a `box-shadow` of `0 0 15px var(--accent-emerald)` using Motion 12's `whileHover` or `animate` prop on successful form validation.
- **Smart Pulses**: Mandatory `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` on all newly entered line items.
- **Soft Amber Pulse**: For non-blocking mandatery fields, use a repeating scale animation (`scale: [1, 1.02, 1]`) in amber-500.

### 4. Transactional Reliability Pattern
NEVER perform a write without this wrapper:
```typescript
const session = await db.startSession();
session.startTransaction();
try {
  // 1. Perform Business Logic
  // 2. Log Audit Entry
  // 3. Commit
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  // 4. CLEANUP: If file was uploaded via UploadThing, call deleteFiles(fileKey)
  throw error;
} finally {
  session.endSession();
}
```

## Anti-Patterns (The "Stop" Rules)
- **NO Raw DB Calls**: Never use `db.collection('expenses').updateOne(...)` outside of `expenseService.ts`.
- **NO Platform Lock-in**: Do not use Vercel-specific API primitives (`revalidatePath`, `revalidateTag`) without a fallback, as Netlify/Cloudflare are target deployment hosts.
- **NO Unaudited Mutations**: Every change to an `Expense` document MUST have a corresponding entry in the `auditLog`.
- **NO Placeholder UI**: Every loading state must use a "Skeleton Glow" or a branded "Motion Pulse."

---

## Usage Guidelines

**For AI Agents:**
- **Read this file first**: Before starting any task, read this file to ensure alignment with project standards.
- **Strict Compliance**: Follow all "Mandatory" and "NEVER" rules exactly.
- **Atomic Operations**: Always prioritize transactional integrity for database and file operations.
- **DDD Consistency**: Use the documented Motion 12 patterns for all interactive feedback.

**For Humans:**
- **Operational Focus**: Keep this file optimized for AI agent context efficiency.
- **Maintenance**: Update this file whenever architectural decisions or core patterns change.
- **Review**: Periodically prune rules that have become implicit in the codebase.

Last Updated: 2025-12-28
