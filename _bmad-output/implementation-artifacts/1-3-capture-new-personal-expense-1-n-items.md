# Story 1.3: Capture New Personal Expense (1-N Items)

Status: done

## Story

As a User,
I want to capture new personal expenses with multiple line items,
so that I can accurately record complex expenses (like multi-day trips or multiple purchases) in a single entry.

## Acceptance Criteria

1. **Multi-Line Item Support:**
   - [x] Users can add 1 or more line items to a single expense entry.
   - [x] Each line item includes amount, description, and date fields.
   - [x] Line items are displayed in a dynamic form with add/remove functionality.

2. **Expense Creation Flow:**
   - [x] New expenses default to "Personal" state with privacy indicators.
   - [x] Users can save as draft at any point in the creation process.
   - [x] Form provides smart defaults (current date, last used category if applicable).

3. **Data Validation:**
   - [x] Required fields are validated before submission.
   - [x] Amount fields must be positive numbers.
   - [x] At least one line item is required for expense creation.

4. **Integration with Vault:**
   - [x] Created expenses appear in the user's private vault.
   - [x] Draft status allows editing before organizational submission.
   - [x] Total amount is automatically calculated from line items.

## Tasks / Subtasks

- [x] Task 1: Implement Multi-Line Item Form
  - [x] Create dynamic form component with useFieldArray
  - [x] Add/remove line item functionality
  - [x] Validate required fields per line item

- [x] Task 2: Build Expense Creation Dialog
  - [x] Implement `CreateExpenseDialog` with form validation
  - [x] Add submission type selection (draft/pre-approval/submit)
  - [x] Integrate with expense creation server actions

- [x] Task 3: Add Smart Defaults and UX
  - [x] Set current date as default
  - [x] Mark expenses as personal by default
  - [x] Add loading states and success feedback

- [x] Task 4: Integrate with Vault and Audit
  - [x] Ensure created expenses appear in personal vault
  - [x] Create initial audit trail entry for expense creation
  - [x] Update total amount calculation middleware

## Dev Notes

- **Unified Entity:** Single expense can contain multiple line items, supporting complex real-world expenses.
- **Progressive Enhancement:** Start with draft creation, allow upgrade to organizational workflow later.
- **Form Complexity:** Handle dynamic arrays with proper validation and error handling.
- **Performance:** Use optimistic UI updates for better perceived performance.

## References

- [PRD Requirements](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/prd.md#FR1-FR3-FR5-FR12)
- [Architecture Blueprint](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/architecture.md#4.1)
- [UX Design Specification](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/ux-design-specification.md#2.2)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Implemented comprehensive expense creation dialog with form validation
- Created dynamic multi-line item form with add/remove functionality
- Added draft saving and personal expense defaults
- Integrated with vault display and audit trail creation
- **Code Review Fixes Applied:**
  - Strengthened validation: amounts must be positive numbers, dates validated properly
  - Improved UX: larger dialog size, better form reset logic
  - Performance: MotionPulse only applied on validation errors
  - Better defaults: amount field starts with '0.00' instead of empty string
  - Enhanced error handling: proper email validation, future date prevention
- Code review completed: committed implementation, updated status to done.

### File List
- app/dashboard/expenses/_components/create-expense-dialog.tsx
- app/dashboard/expenses/_actions/expense-actions.ts
- lib/validations/expense.ts
- lib/services/expenseService.ts
- lib/models.ts (Expense schema with lineItems)</content>
<parameter name="filePath">_bmad-output/implementation-artifacts/1-3-capture-new-personal-expense-1-n-items.md