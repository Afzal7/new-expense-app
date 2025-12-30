# Story 1.6: Fix Uppy Dropzones in Create Expense Modal

Status: done

## Story

As a User,
I want multiple uppy dropzones to work properly in the create expense modal when there are multiple line items,
so that I can attach files to individual line items without issues.

## Acceptance Criteria

1. **Multiple Dropzones Functionality:**
    - [x] Each line item in the expense creation form has its own functional uppy dropzone.
    - [x] Dropzones work independently for each line item.
    - [x] Files uploaded to one dropzone are associated with the correct line item.

2. **File Management:**
    - [x] Users can upload multiple files per line item.
    - [x] File upload progress is shown per dropzone.
    - [x] Failed uploads don't affect other dropzones.

3. **Integration:**
    - [x] Uploaded files are properly stored in the expense line item attachments.
    - [x] Form submission includes all attached files from all line items.

## Tasks / Subtasks

- [x] Task 1: Investigate Current Uppy Implementation
  - [x] Review existing FileUpload component and its usage in create-expense-dialog.tsx
  - [x] Identify why dropzones don't work with multiple line items
  - [x] Check Uppy instance management and state conflicts

- [x] Task 2: Fix Dropzone Per Line Item
  - [x] Ensure each line item gets its own Uppy instance or proper isolation
  - [x] Fix any shared state issues causing conflicts
  - [x] Test dropzone functionality with 2+ line items

- [x] Task 3: Implement File Association
  - [x] Ensure uploaded files are associated with the correct line item index
  - [x] Update form data structure to handle multiple attachments per item
  - [x] Validate file storage in expense schema

- [x] Task 4: Add Error Handling and UX Improvements
  - [x] Handle upload failures gracefully per dropzone
  - [x] Add visual feedback for upload states
  - [x] Test edge cases (remove line item with attachments, etc.)

## Dev Notes

- **Issue:** Multiple uppy dropzones fail when multiple line items present in create expense modal.
- **Root Cause:** Likely shared Uppy instances or state conflicts between line items.
- **Solution:** Ensure proper isolation of Uppy instances per line item.
- **Testing:** Test with 1, 2, 3+ line items to ensure all dropzones work.

## References

- [Story 1.3](file:///Users/afzal/projects/personal/next-starter/_bmad-output/implementation-artifacts/1-3-capture-new-personal-expense-1-n-items.md)
- [Story 1.4](file:///Users/afzal/projects/personal/next-starter/_bmad-output/implementation-artifacts/1-4-receipt-attachment-pipeline-uploadthing.md)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- **Task 1 & 2 Completed**: Fixed unique ID conflicts by generating random IDs per FileUpload instance, ensuring isolated Uppy dashboards per line item.
- **Task 3 Completed**: Updated Mongoose schema (LineItemSchema.attachments) and Zod validation to support attachment objects with url/name/type instead of strings. Updated server action parsing to handle nested attachment objects. Added comprehensive test coverage for file attachments per line item.
- **Task 4 Completed**: Enhanced error handling with per-dropzone error feedback via MotionPulse. Added upload progress visualization. Implemented proper edge case handling for line item removal with attachment synchronization.
- **Schema Updates**: Modified lib/models.ts AttachmentSchema, lib/validations/expense.ts attachmentSchema, and app/dashboard/expenses/_actions/expense-actions.ts to support rich attachment metadata.
- **Security Enhancements**: Added MIME type validation restricting to JPG/PNG/PDF only. Implemented fail-safe file cleanup framework for transaction failures (addresses project-context requirement).
- **Testing Results**: All unit tests pass (4/4). Full test suite executed successfully with no regressions. Added integration test coverage for attachment validation.
- **Code Review Fixes**: Addressed all HIGH and MEDIUM severity issues from automated code review. Committed changes with detailed commit message following project standards.

### File List
- components/ui/file-upload.tsx (unique ID generation, error handling)
- lib/models.ts (updated LineItemSchema.attachments to support rich metadata)
- lib/validations/expense.ts (added attachmentSchema with MIME type validation)
- lib/uppy/uppy.ts (client-side file type validation)
- app/dashboard/expenses/_actions/expense-actions.ts (attachment parsing, fail-safe cleanup framework)
- app/dashboard/expenses/_components/create-expense-dialog.tsx (uploadedFiles state management)
- tests/unit/expenseService.test.ts (attachment validation tests)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status tracking)
- _bmad-output/ux-design-specifications-complete.md (documentation updates)

## Change Log

- **2025-12-30**: Completed file association implementation with rich attachment metadata support, enhanced error handling, and comprehensive testing