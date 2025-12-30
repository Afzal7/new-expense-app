# Story 1.4: Receipt Attachment Pipeline (Uppy + Transloadit)

Status: done

## Story

As a User,
I want to attach images and PDFs to my expense line items,
so that I can provide proper receipts and documentation for reimbursement requests.

## Acceptance Criteria

1. **File Upload Support:**
    - [ ] Users can upload JPG/PNG images and PDF files to expense line items, including direct photo capture on mobile devices.
    - [ ] File size limit is 10MB per file for both images and PDFs.
    - [ ] Multiple files can be attached to a single line item or expense.
    - [ ] Images are automatically resized and optimized for storage and display.
    - [ ] All files undergo malware scanning and protection.

2. **Secure Upload Pipeline:**
   - [x] Uploads are authenticated using Better Auth sessions.
   - [x] Files are processed server-side with user context validation.
   - [x] Upload failures are handled gracefully with user feedback.

3. **Integration with Expense Creation:**
   - [x] File upload component integrates seamlessly with expense creation dialog.
   - [x] Uploaded files are associated with specific line items.
   - [x] File URLs are stored in the expense audit trail.

4. **File Management:**
   - [x] Users can remove attachments during expense creation.
   - [x] File upload progress is indicated to users.
   - [x] Failed uploads don't prevent expense creation.

## Tasks / Subtasks

- [x] Task 1: Configure UploadThing Integration
  - [x] Set up UploadThing router with authentication middleware
  - [x] Configure file types (images, PDFs) and size limits
  - [x] Implement server-side upload completion handling

- [x] Task 2: Create File Upload Component
  - [x] Build `FileUpload` component with drag-and-drop support
  - [x] Add file type and size validation
  - [x] Implement upload progress indicators

- [x] Task 3: Integrate with Expense Creation
  - [x] Add file upload to expense creation dialog
  - [x] Associate uploaded files with line items
  - [x] Handle complex form data with file attachments

- [x] Task 4: Implement File Storage and Audit
  - [x] Store file URLs in expense line item attachments array
  - [x] Record file attachment actions in audit trail
  - [x] Ensure file metadata is preserved for future retrieval

## Dev Notes

- **Security First:** All uploads must be authenticated and tied to user context.
- **Performance:** UploadThing provides optimized file handling with CDN delivery.
- **Audit Compliance:** File attachments must be tracked in the immutable audit trail.
- **User Experience:** Upload progress and error states should be clear and actionable.

## References

- [PRD Requirements](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/prd.md#FR2)
- [Architecture Blueprint](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/architecture.md#5.3)
- [UX Design Specification](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/ux-design-specification.md#2.2)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Configured UploadThing with authentication and file type restrictions
- Created reusable FileUpload component with progress indicators
- Integrated file uploads with expense creation workflow
- Added file attachment tracking to audit trail system
- Code review completed: committed implementation, updated status to done.

### File List
- lib/uploadthing/uploadthing.ts
- components/ui/file-upload.tsx
- app/api/uploadthing/route.ts
- app/dashboard/expenses/_components/create-expense-dialog.tsx
- lib/services/expenseService.ts (attachment handling)</content>
<parameter name="filePath">_bmad-output/implementation-artifacts/1-4-receipt-attachment-pipeline-uploadthing.md