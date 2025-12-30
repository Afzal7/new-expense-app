# Story 1.1: Project Scaffolding & Core Expense Schema

Status: done

## Story

As a Developer,
I want to initialize the project scaffolding and core data models,
so that I have a robust, transactional foundation for implementing the expense lifecycle.

## Acceptance Criteria

1. **Schema Definition:**
   - [x] Mongoose `Expense` schema is created with fields for `userId`, `organizationId`, `managerId`, `status`, `totalAmount`, and `isPersonal`. [Source: architecture.md#3.1.1]
   - [x] `Expense` schema includes a nested `lineItems` array containing `amount`, `description`, `date`, and `attachments`.
   - [x] `Expense` schema includes a nested `auditTrail` array to capture immutable snapshots of state changes. [Source: prd.md#FR20]
2. **Validation Layer:**
   - [x] Zod schemas are created in `lib/validations/expense.ts` for validating expense creation and updates. [Source: architecture.md#4.3]
   - [x] Validation enforces mandatory fields based on the expense state (e.g., `amount` is required for Pre-approval). [Source: ux-design-specification.md#2.3]
3. **Service Layer Foundation:**
   - [x] `lib/services/expenseService.ts` is initialized with a `createExpense` method.
   - [x] The service layer uses MongoDB sessions and transactions for all database writes. [Source: architecture.md#4.4]
4. **Project Scaffolding:**
   - [x] Folders `app/dashboard/expenses/`, `components/ddd/`, and `lib/services/` exist and follow naming conventions. [Source: architecture.md#5]

## Tasks / Subtasks

- [x] Task 1: Initialize Database Models (AC: 1)
  - [x] Define Expense and LineItem types/interfaces in `types/expense.ts`.
  - [x] Implement Mongoose schema in `lib/models.ts`.
- [x] Task 2: Implement Validation (AC: 2)
  - [x] Create Zod schemas in `lib/validations/expense.ts`.
- [x] Task 3: Build Service Layer (AC: 3)
  - [x] Implement `expenseService.ts` with basic transactional `create` method.
  - [x] Implement `logMutation` helper for audit trail consistency.
- [x] Task 4: Folder Scaffolding (AC: 4)
  - [x] Verify/Create directory structure as per architecture.

## Dev Notes

- **Unified Entity:** Ensure the single-document strategy is followed. Line items are embedded, not separate collections.
- **Transactions:** DO NOT perform writes without `session.startTransaction()`.
- **RBAC Readiness:** Ensure schemas include the necessary IDs (`userId`, `organizationId`) for query-level isolation.

### Project Structure Notes

- Alignment with `architecture.md#5`:
  - `lib/services/` for business logic.
  - `lib/validations/` for shared Zod schemas.
  - `lib/models.ts` for Mongoose definitions.

### References

- [PRD Requirements](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/prd.md)
- [Architecture Blueprint](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/architecture.md)
- [UX Design Specification](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/ux-design-specification.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Successfully implemented core `Expense` and `LineItem` models.
- Established transactional integrity in `expenseService.ts`.
- Configured Vitest for unit testing.
- Fixed lint errors in Mongoose middleware.
- Code review completed: committed implementation, updated status to done.

### File List
- types/expense.ts
- lib/models.ts
- lib/validations/expense.ts
- lib/services/expenseService.ts
- tests/unit/expenseService.test.ts
- vitest.config.ts
- package.json
