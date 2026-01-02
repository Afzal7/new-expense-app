# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, Next.js 16+
**Primary Dependencies**: TanStack Query, shadcn/ui, Better Auth, Mongoose, React Dropzone
**Storage**: MongoDB (data), Cloudflare R2 (files via signed URLs)
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Next.js 16 web application with App Router
**Performance Goals**: Sub-100ms response times for form submissions and state transitions
**Constraints**: 5MB file size limit, mobile-first responsive design, no native fetch calls, REST APIs only
**Scale/Scope**: 1-100 users, expense management with file attachments

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- DRY Principle: ✅ Confirmed - Shared expense list component and reusable hooks implemented
- Component Completeness: ✅ Confirmed - Expense form components contain complete action logic with API calls
- API Management: ✅ Confirmed - TanStack Query used exclusively for all data operations
- UI Component Library: ✅ Confirmed - shadcn components used throughout for consistency
- State Management: ✅ Confirmed - Loading/error states implemented for all pages and components
- Action Feedback: ✅ Confirmed - Loading states, success/error toasts, and list updates on all actions
- API Design: ✅ Confirmed - REST APIs with PATCH actions for state transitions implemented
- Code Quality: ✅ Confirmed - TypeScript strict mode, readable code, and proper structure
- Development Workflow: ✅ Confirmed - Tasks divided into logical blocks with lint/build checks
- Type Safety: ✅ Confirmed - TypeScript strict mode enabled throughout
- Configuration Management: ✅ Confirmed - Environment variables used for all configuration
- Error Handling: ✅ Confirmed - Error boundaries and user-friendly messages implemented
- Existing Code: ✅ Confirmed - Existing expense view page and APIs reused for manager/finance pages

All principles successfully implemented and verified in the final design.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── auth/[...all]/route.ts      # Better Auth routes
│   ├── expenses/
│   │   ├── route.ts                # GET/POST expenses
│   │   └── [id]/route.ts           # PUT/PATCH individual expenses
│   └── upload/
│       ├── signed-url/route.ts     # Generate signed URLs for uploads
│       └── delete-signed-url/route.ts # Delete signed URLs
├── dashboard/
│   ├── expenses/
│   │   ├── page.tsx                # Expenses list with edit functionality
│   │   └── create/page.tsx         # Expense creation form
│   ├── manager/
│   │   └── approvals/page.tsx      # Ready for Approvals page
│   └── finance/
│       └── reimbursements/page.tsx # Ready for Reimbursement page
├── layout.tsx                      # Root layout with providers
└── page.tsx                        # Landing page

components/
├── ui/                             # shadcn/ui components
├── expense-form.tsx                # Main expense form component
├── line-item-form.tsx              # Line item sub-form
├── file-upload.tsx                 # File upload with React Dropzone
├── shared/
│   └── expense-list.tsx            # Reusable expense list component
├── expenses/
│   ├── ExpenseFormActions.tsx      # Form action buttons
│   ├── ManagerSelector.tsx         # Manager selection component
│   └── LineItemsSection.tsx        # Line items management
└── manager/
    └── expense-detail-modal.tsx    # Manager expense detail modal

hooks/
├── use-expense-mutations.ts        # TanStack Query mutations
├── use-expenses.ts                 # TanStack Query queries
└── use-optimized-upload.ts         # File upload hook

lib/
├── auth.ts                         # Better Auth configuration
├── db.ts                           # MongoDB/Mongoose connection
├── models/
│   └── expense.ts                  # Expense Mongoose schema
├── validations/
│   └── expense.ts                  # Zod validation schemas
├── constants/
│   └── expense-states.ts           # Expense state constants
├── errors.ts                       # Error handling utilities
├── env.ts                          # Environment validation
└── utils.ts                        # Utility functions

types/
└── expense.ts                      # TypeScript interfaces

tests/
├── unit/
│   ├── models/expense.test.ts      # Schema validation tests
│   ├── api/expenses.test.ts        # API route tests
│   ├── components/                 # Component unit tests
│   └── hooks/                      # Hook unit tests
└── integration/
    └── expense-workflow.test.ts    # End-to-end workflow tests
```

**Structure Decision**: Next.js 16 App Router with feature-based component organization. API routes follow REST conventions with PATCH actions for state transitions. Testing covers unit, integration, and component levels. Shared components are placed in dedicated directories for reusability.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
