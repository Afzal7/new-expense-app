# Feature Specification: Expense App MVP

**Feature Branch**: `001-expense-app-mvp`
**Created**: 2025-12-31
**Status**: Draft
**Input**: User description: "use @docs/prd.md"

## Summary

Implement complete expense management system with three user stories:

- **US1**: Employee Expense Capture and Submission (MVP core)
- **US2**: Manager Approval Workflow
- **US3**: Finance Reimbursement Processing

This involves creating a comprehensive expense management platform with forms for expense entry, embedded line items, file uploads to Cloudflare R2 via signed URLs, multi-level approval workflows, and financial processing. Technical approach uses Next.js 16, React, TanStack Query, shadcn components, and MongoDB with embedded documents.

## Clarifications

### Session 2025-01-01

- Q: What pages should managers and accountants/finance users have for reviewing expenses? → A: Create two pages - "Ready for Approvals" (shows non-deleted expenses in approval_pending state) and "Ready for Reimbursement" (shows non-deleted expenses in approved state). Both pages will have search field, filter by employee dropdown, option to view expense details, and actions to approve/reject (approvals page) or reimburse (reimbursement page). Use same underlying list component with different API filters.
- Q: How should these pages integrate with existing APIs and authorization? → A: Use existing GET /api/expenses and PATCH /api/expenses/[id] APIs. Update validations: only assigned managers can approve expenses, any admin can mark as reimbursed. Use existing expense view page for details.

### Session 2025-12-31

- Q: MVP focus → A: Focus on all possible scenarios for creating an expense by the employee.
- Q: Scenario 1 → A: Employee takes a photo or fills any details in the expense form and saves it as draft. Closing the expense modal: photo gets deleted immediately.
- Q: Scenario 2 → A: Employee fills amount and manager email and submits for pre approval.
- Q: Scenario 3 → A: When an expense is preapproved, employee edits it and adds receipts/photos/PDFs.
- Q: Scenario 4 → A: When employee wants, he can submit the expense for approval.
- Q: Scenario 5 → A: An expense can have multiple managers in the future so plan for that. But required fields are only amount & dates for each line item.
- Q: Scenario 6 → A: Employee can delete the whole expense or any line item within the expense only before the approved state. Files attached to each line item are deleted immediately.
- Q: Scenario 7 → A: If the employee is part of an org then the manager email input should behave as an autocomplete field. If the employee is not part of any org then on entering the email we should check whether that email exists in our system or not.
- Q: Scenario 8 → A: A user can create expense without a manager and save them as draft and not send it for approval ever. These are their private expenses they want to keep.
- Q: How should the approval process work for expenses with multiple managers? → A: Any one manager can approve the expense.
- Q: What happens when editing a pre-approved expense? → A: Allow editing without changing state; expense has totalAmount at root, filled by employee and sent for pre-approval; totalAmount gets frozen on approval; if adding line items where sum exceeds total, manager sees message that expense has crossed pre-approved limit.
- Q: What are the file size limits and supported formats for attachments? → A: Max 5MB, JPG/PNG/PDF.
- Q: What storage solution will be used for attachments? → A: Cloudflare R2 via signed URLs (exempt from no-native-fetch rule per constitution).
- Q: What UI library will be used for file uploads? → A: React Dropzone.
- Q: Should User Story 4 be removed? → A: Yes, completely remove User Story 4 as the flow is not needed.
- Q: What are the Better Auth org roles for the system? → A: Owner can do everything, Admin can do manager and accountant jobs, Member is employee.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Employee Expense Capture and Submission (Priority: P1)

As an employee, I want to capture and submit expenses seamlessly, either as personal drafts or for organizational reimbursement, to manage my spending efficiently.

**Why this priority**: This is the core functionality that enables the primary user value - quick expense management without friction.

**Independent Test**: Can be fully tested by capturing a receipt, adding line items, and submitting for approval, delivering immediate value for expense tracking.

**Acceptance Scenarios**:

1. **Given** a new user, **When** they sign up and capture a receipt, **Then** it is saved as a personal draft within 2 minutes.
2. **Given** an expense form with photo or details, **When** the user saves as draft and closes modal, **Then** the photo is deleted immediately if not saved.
3. **Given** an expense form, **When** the user fills amount and manager email, **Then** they can submit for pre-approval.
4. **Given** a pre-approved expense, **When** the user edits it, **Then** they can add receipts/photos/PDFs without resetting state.
5. **Given** an expense with totalAmount, **When** the user sends for pre-approval, **Then** totalAmount gets frozen on approval.
6. **Given** a pre-approved expense, **When** user adds line items exceeding totalAmount sum, **Then** manager sees a message about crossing pre-approved limit.
7. **Given** an expense, **When** the user wants, **Then** they can submit it for final approval.
8. **Given** an expense before approved state, **When** the user deletes the whole expense or a line item, **Then** attached files are deleted immediately.
9. **Given** an employee in an org, **When** entering manager email, **Then** it provides autocomplete from org members.
10. **Given** an employee not in an org, **When** entering manager email, **Then** the system checks if the email exists in the system.
11. **Given** an expense form, **When** the user creates without a manager, **Then** it saves as private draft and can remain unsubmitted.
12. **Given** an expense draft, **When** the user attaches a manager, **Then** it becomes visible to the manager for approval.
13. **Given** an approved expense, **When** finance processes it, **Then** the user receives reimbursement notification.

---

### User Story 2 - Manager Approval Workflow (Priority: P2)

As a manager, I want to review and approve/reject expense submissions from my team, to maintain control over organizational spending.

**Why this priority**: Essential for organizational governance and the dual-flow system (capture vs pre-approval).

**Independent Test**: Can be fully tested by a manager viewing pending expenses and taking approval actions, ensuring workflow integrity.

**Acceptance Scenarios**:

1. **Given** a "Ready for Approvals" page, **When** I access it, **Then** I see all non-deleted expenses in approval_pending state with search and employee filter options.
2. **Given** an expense in the approval list, **When** I click to view it, **Then** I am taken to the existing expense detail view page.
3. **Given** an expense I'm reviewing, **When** I choose to approve or reject, **Then** I can add optional comments and the expense state updates accordingly.
4. **Given** a pre-approval request, **When** I approve it, **Then** the user can proceed with spending and get final approval faster.

---

### User Story 3 - Finance Reimbursement Processing (Priority: P2)

As a finance user, I want to process approved expenses for reimbursement and export data, to ensure accurate financial records.

**Why this priority**: Critical for closing the reimbursement loop and maintaining audit trails.

**Independent Test**: Can be fully tested by marking expenses as reimbursed and exporting reports, verifying financial workflow completion.

**Acceptance Scenarios**:

1. **Given** a "Ready for Reimbursement" page, **When** I access it, **Then** I see all non-deleted expenses in approved state with search and employee filter options.
2. **Given** an expense in the reimbursement list, **When** I click to view it, **Then** I am taken to the existing expense detail view page.
3. **Given** an approved expense, **When** I mark it as reimbursed, **Then** it is locked and users are notified of reimbursement completion.
4. **Given** expense data, **When** I export to CSV or PDF, **Then** it generates within 5 seconds for up to 1000 records.

---

### Edge Cases

- What happens when a user tries to approve their own expense? System prevents self-approval.

- What if finance tries to reimburse without approval? System enforces state transitions.
- How to handle duplicate receipts or unusual spending? Manual review for now, AI in future phases.
- What happens if user closes expense modal without saving draft? Attached photos are deleted immediately.
- What if user tries to delete an approved expense or line item? System prevents deletion.
- What if manager email entered by non-org user does not exist? System blocks submission or notifies.
- Can private expenses be converted to organizational later? User can attach manager to convert.
- What if sum of line item amounts exceeds totalAmount on pre-approved expense? Manager sees message that expense has crossed pre-approved limit.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST allow users to create expense entries with 1 or multiple line items.
- **FR-002**: System MUST support attachment of images (JPG/PNG) or PDFs to expenses or line items.
- **FR-003**: System MUST enable saving expenses as drafts at any stage.
- **FR-004**: System MUST allow editing or deleting draft expenses and line items.
- **FR-005**: System MUST provide smart defaults (current date, last used category) for new expense items.
- **FR-006**: System MUST support pre-approval workflow (Flow B) for expenses.
- **FR-007**: System MUST allow managers to approve or reject pre-approval requests with optional comments.
- **FR-008**: System MUST support final approval/reimbursement submission (Flow A or B).
- **FR-009**: System MUST allow managers to approve or reject final submissions.
- **FR-010**: System MUST enforce strict state transitions: Draft → Pre-Approval Pending → Pre-Approved → Approved → Rejected → Reimbursed.
- **FR-011**: System MUST prevent users from approving their own expense submissions.
- **FR-012**: System MUST allow marking expenses as "Personal" by default.
- **FR-013**: System MUST ensure "Personal" expenses are never visible to managers, admins, or finance.
- **FR-014**: System MUST allow converting personal expenses to org-related by attaching a manager/organization.
- **FR-015**: System MUST display a "Private/Protected" indicator for personal expenses.
- **FR-016**: System MUST support organization creation and member invites.
- **FR-017**: System MUST only allow selection of verified managers within active organizations.
- **FR-019**: System MUST record immutable audit logs for all expense changes.
- **FR-020**: System MUST allow users to view audit trails for their expenses.
- **FR-021**: System MUST provide admin users view-all access to approved expenses.
- **FR-022**: System MUST allow admin to mark expenses as reimbursed.
- **FR-023**: System MUST support exporting filtered expense lists as CSV or PDF.
- **FR-024**: System MUST provide immediate visual feedback for state transitions including success toasts with checkmark icons, loading spinners during transitions, and smooth 200ms ease-in-out animations.
- **FR-025**: System MUST use fluid, minimalist transitions for progress indication.
- **FR-026**: System MUST delete attached files immediately when the expense modal is closed without saving the draft.
- **FR-027**: Required fields for each line item are only amount and date.
- **FR-028**: System MUST support multiple managers per expense for future functionality, where any one manager can approve.
- **FR-029**: System MUST allow deletion of expenses or line items only before the approved state, and delete attached files immediately.
- **FR-030**: Manager email input MUST be an autocomplete field for organization members, and validate existence for non-organization users.
- **FR-031**: System MUST allow creation of private expenses without a manager, saved as drafts that can remain unsubmitted.
- **FR-032**: System MUST allow editing pre-approved expenses without resetting state.
- **FR-033**: Expense MUST have a totalAmount field at the root, set by employee and frozen on pre-approval.
- **FR-034**: System MUST validate that the sum of line item amounts does not exceed totalAmount; notify manager if exceeded.
- **FR-035**: Attachments MUST be in JPG/PNG/PDF formats and limited to 5MB max size per file.
- **FR-036**: System MUST prevent users from approving their own expense submissions.
- **FR-037**: System MUST enforce state transitions and prevent invalid operations (e.g., reimbursing unapproved expenses).
- **FR-038**: System MUST allow manual review flags for duplicate receipts or unusual spending patterns.
- **FR-039**: System MUST immediately delete attached files when expense modal is closed without saving draft.
- **FR-040**: System MUST prevent deletion of expenses or line items in approved state.
- **FR-041**: System MUST validate manager email existence for non-organization users and block submission with clear error message.
- **FR-042**: System MUST allow conversion of private expenses to organizational by attaching a manager.
- **FR-043**: System MUST notify managers when line item amounts exceed pre-approved totalAmount with clear warning message.
- **FR-044**: System MUST provide a "Ready for Approvals" page for managers showing all non-deleted expenses in approval_pending state.
- **FR-045**: System MUST provide a "Ready for Reimbursement" page for finance users showing all non-deleted expenses in approved state.
- **FR-046**: Both approval and reimbursement pages MUST include search field and employee filter dropdown.
- **FR-047**: System MUST allow managers to view expense details and approve/reject expenses from the approvals page.
- **FR-048**: System MUST allow finance users to view expense details and mark expenses as reimbursed from the reimbursement page.
- **FR-049**: System MUST use reusable expense list components across all pages with different API filters.
- **FR-050**: System MUST use existing GET /api/expenses and PATCH /api/expenses/[id] APIs for manager and finance pages.
- **FR-051**: System MUST only allow assigned managers to approve expenses via PATCH approval action.
- **FR-052**: System MUST allow any admin user to mark expenses as reimbursed via PATCH reimbursement action.
- **FR-053**: System MUST use existing expense detail view page for viewing expense details from manager/finance pages.

### Key Entities _(include if feature involves data)_

- **Expense**: Represents a financial transaction with totalAmount (frozen on pre-approval), line items, attachments, state, audit log; relationships to User, Organization, Managers (multiple).
- **User**: Individual with roles (Owner, Admin, Member); associated with personal expenses and organizational memberships.
- **Organization**: Group for shared expenses; has members, managers, finance roles.
- **Line Item**: Component of expense with amount, category, date, merchant.
- **Audit Log**: Immutable record of changes to expenses with timestamps and user IDs.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can sign up and capture first expense in under 2 minutes.
- **SC-002**: Pre-approval submission button is prominently displayed and used in 80% of expense submissions after 30 days of user data collection.
- **SC-003**: System provides sub-100ms response times for state transitions.

- **SC-004**: Admin exports generate in under 5 seconds for up to 1000 records.
- **SC-005**: System maintains 99.9% uptime with logical data isolation.
