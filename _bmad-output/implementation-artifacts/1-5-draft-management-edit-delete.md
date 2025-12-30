# Story 1.5: Draft Management (Edit/Delete)

Status: done

## Story

As a User,
I want to edit and delete my draft expenses,
so that I can maintain accurate personal expense records before sharing them organizationally.

## Acceptance Criteria

1. **Draft Editing:**
   - [x] Users can edit draft expenses from the vault dashboard.
   - [x] Edit functionality preserves all existing data (line items, attachments).
   - [x] Changes are saved as drafts and don't trigger approval workflows.

2. **Draft Deletion:**
   - [x] Users can delete draft expenses they own.
   - [x] Deletion requires confirmation to prevent accidental data loss.
   - [x] Deleted drafts are permanently removed (no soft delete).

3. **Audit Trail Integrity:**
   - [x] All draft modifications are recorded in the audit trail.
   - [x] Edit actions track field-level changes (old value → new value).
   - [x] Deletion actions are logged with deletion metadata.

4. **Privacy Preservation:**
   - [x] Users can only edit/delete their own draft expenses.
   - [x] Organizational expenses in draft status cannot be edited/deleted by regular employees.
   - [x] Edit permissions respect the organizational hierarchy.

## Tasks / Subtasks

- [x] Task 1: Implement Edit Expense Dialog
  - [x] Create `EditExpenseDialog` component with pre-populated data
  - [x] Handle complex form state with line items and attachments
  - [x] Preserve existing data while allowing modifications

- [x] Task 2: Add Delete Functionality
  - [x] Implement delete confirmation dialog
  - [x] Add delete action to expense server actions
  - [x] Ensure only draft expenses can be deleted

- [x] Task 3: Enhance Audit Trail for Modifications
  - [x] Track field-level changes in edit operations
  - [x] Record deletion actions with metadata
  - [x] Maintain chronological audit trail integrity

- [x] Task 4: Implement Permission Controls
  - [x] Add ownership validation for edit/delete operations
  - [x] Prevent editing of organizational expenses by non-managers
  - [x] Ensure vault isolation for personal draft operations

## Dev Notes

- **Data Integrity:** Edit operations must preserve audit trail immutability.
- **User Safety:** Deletion requires explicit confirmation to prevent accidents.
- **State Management:** Only draft expenses can be modified - organizational workflows have different rules.
- **Performance:** Edit operations should use optimistic updates for better UX.

## References

- [PRD Requirements](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/prd.md#FR4-FR20-FR21)
- [Architecture Blueprint](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/architecture.md#4.4)
- [UX Design Specification](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/ux-design-specification.md#2.1)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Implemented comprehensive edit expense dialog with data preservation
- Added delete functionality with confirmation dialogs
- Enhanced audit trail to track field-level changes and deletions
- Added proper permission controls for draft modification
- Code review completed: committed implementation, updated status to done.

### File List
- app/dashboard/expenses/_components/edit-expense-dialog.tsx
- app/dashboard/expenses/_actions/edit-actions.ts
- lib/services/expenseService.ts (update and delete methods)
- lib/validations/expense.ts (update schemas)</content>
<parameter name="filePath">_bmad-output/implementation-artifacts/1-5-draft-management-edit-delete.md