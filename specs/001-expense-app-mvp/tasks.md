---
description: "Task list template for feature implementation"
---

# Tasks: Expense App MVP (All User Stories)

**Input**: Design documents from `/specs/001-expense-app-mvp/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests are included for critical components. Tests are OPTIONAL - included here for quality assurance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: app/, components/, lib/, types/, hooks/, tests/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project structure per implementation plan
- [x] T002 Initialize TypeScript Next.js project with required dependencies including react-dropzone
- [x] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup MongoDB connection with Mongoose in lib/db.ts
- [x] T005 [P] Configure Better Auth integration in lib/auth.ts
- [x] T006 [P] Setup environment configuration management in .env files
- [x] T007 Create base types for Expense in types/expense.ts
- [x] T008 Configure error handling utilities in lib/errors.ts
- [x] T009 Setup toast notification system in components/ui/sonner.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Data Layer (Priority: P1) 🎯 MVP

**Goal**: Establish data models and types for expense management

**Independent Test**: Expense schema validates correctly and types are properly defined

### Tests for User Story 1 - Data Layer ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T010 [P] [US1] Unit test for expense schema validation in tests/unit/models/expense.test.ts

### Implementation for User Story 1 - Data Layer

- [x] T012 [US1] Create Expense Mongoose schema in lib/models/expense.ts

**Checkpoint**: Data layer ready for API development

---

## Phase 4: User Story 1 - API Layer

**Goal**: Implement backend API endpoints for expense operations

**Independent Test**: API endpoints return correct responses for expense CRUD operations

### Tests for User Story 1 - API Layer ⚠️

- [x] T011 [P] [US1] Unit test for expense API routes in tests/unit/api/expenses.test.ts

### Implementation for User Story 1 - API Layer

- [x] T016 [US1] Implement signed URL API route in app/api/upload/signed-url/route.ts
- [x] T017 [US1] Implement expense creation API route in app/api/expenses/route.ts
- [x] T018 [US1] Implement expense update API route in app/api/expenses/[id]/route.ts
- [x] T019 [US1] Implement expense retrieval API routes in app/api/expenses/route.ts and app/api/expenses/[id]/route.ts

**Checkpoint**: API layer ready for frontend integration

---

## Phase 5: User Story 1 - UI Components

**Goal**: Create reusable UI components for expense forms and displays

**Independent Test**: Components render correctly and handle user input

### Tests for User Story 1 - UI Components ⚠️

- [x] T013 [P] [US1] Unit test for expense form component in tests/unit/components/expense-form.test.tsx

### Implementation for User Story 1 - UI Components

- [x] T013 [US1] Create reusable expense form component (DRY: used for both create and edit) in components/expense-form.tsx
- [x] T014 [US1] Create line item form component in components/line-item-form.tsx
- [x] T015 [US1] Create file upload component using React Dropzone in components/file-upload.tsx
- [x] T022 [US1] Create expense creation page using shared form component in app/dashboard/expenses/create/page.tsx
- [x] T023 [US1] Create expense list page with edit functionality using shared form component in app/dashboard/expenses/page.tsx

**Checkpoint**: UI components ready for state management

---

## Phase 6: User Story 1 - Integration & State Management

**Goal**: Connect UI to APIs with proper state management and user feedback

**Independent Test**: Full expense creation workflow works end-to-end with proper feedback

### Tests for User Story 1 - Integration ⚠️

- [x] T014 [P] [US1] Integration test for expense creation workflow in tests/integration/expense-workflow.test.ts

### Implementation for User Story 1 - Integration

- [x] T020 [US1] Create expense mutations hook in hooks/use-expense-mutations.ts
- [x] T021 [US1] Create expense queries hook in hooks/use-expenses.ts
- [x] T024 [US1] Add loading and error states to all components
- [x] T025 [US1] Add success/error toast notifications for all actions
- [x] T027 [US1] Add expense state transitions (Draft → Pre-Approval Pending)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 7: User Story 2 - Manager Approval Workflow (Priority: P2)

**Goal**: Implement "Ready for Approvals" page for managers to review and approve/reject expense submissions

**Independent Test**: Manager can view approval_pending expenses, search/filter, and take approval actions

### Tests for User Story 2 - Manager Approval ⚠️

- [ ] T035 [P] [US2] Unit test for manager approval workflow in tests/unit/components/manager/approval-workflow.test.tsx

### Implementation for User Story 2 - Manager Approval

- [ ] T036 [US2] Create reusable expense list component with search and employee filter in components/shared/expense-list.tsx
- [ ] T037 [US2] Create "Ready for Approvals" page showing approval_pending expenses in app/dashboard/manager/approvals/page.tsx
- [ ] T038 [US2] Create expense detail modal for managers in components/manager/expense-detail-modal.tsx
- [ ] T039 [US2] Update PATCH /api/expenses/[id] validation to only allow assigned managers to approve in app/api/expenses/[id]/route.ts
- [ ] T040 [US2] Add manager-specific navigation in app/dashboard/layout.tsx

**Checkpoint**: Manager approval workflow ready for testing

---

## Phase 8: User Story 3 - Finance Processing (Priority: P2)

**Goal**: Implement "Ready for Reimbursement" page for finance users to process approved expenses

**Independent Test**: Finance users can view approved expenses, mark as reimbursed, and export reports

### Tests for User Story 3 - Finance Processing ⚠️

- [ ] T041 [P] [US3] Unit test for finance reimbursement workflow in tests/unit/components/finance/reimbursement-workflow.test.tsx

### Implementation for User Story 3 - Finance Processing

- [ ] T042 [US3] Create "Ready for Reimbursement" page showing approved expenses in app/dashboard/finance/reimbursements/page.tsx
- [ ] T043 [US3] Update PATCH /api/expenses/[id] validation to allow any admin to mark as reimbursed in app/api/expenses/[id]/route.ts
- [ ] T044 [US3] Add expense export functionality (CSV/PDF) in app/api/exports/route.ts
- [ ] T045 [US3] Create export UI components in components/finance/export-controls.tsx
- [ ] T046 [US3] Add reimbursement notification system in lib/notifications.ts

**Checkpoint**: Finance reimbursement workflow ready for testing

---

## Phase 9: User Story 1 - Audit Logging & Security

**Goal**: Implement audit logging and security features for compliance

**Independent Test**: All expense changes are audited and access is properly controlled

### Implementation for User Story 1 - Audit & Security

- [x] T028 [US1] Implement audit log recording in expense operations in lib/models/expense.ts

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T029 [P] Documentation updates in README.md
- [x] T030 Code cleanup and refactoring
- [x] T031 Performance optimization for file uploads
- [x] T032 [P] Additional unit tests in tests/unit/
- [x] T033 Security review and hardening
- [x] T034 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 Phases (Phase 3-6)**: All depend on Foundational phase completion
  - Phase 3 (Data Layer): No dependencies within US1
  - Phase 4 (API Layer): Depends on Phase 3
  - Phase 5 (UI Components): Depends on Phase 3, can run parallel to Phase 4
  - Phase 6 (Integration): Depends on Phase 4 and Phase 5
- **User Story 2 (Phase 7)**: Depends on User Story 1 completion - reuses shared expense list component
- **User Story 3 (Phase 8)**: Depends on User Story 1 completion - reuses shared expense list component, can run parallel to Phase 7
- **Audit & Security (Phase 9)**: Depends on User Story 1 API completion
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion
- **User Story 3 (P2)**: Depends on User Story 1 completion (can run parallel to US2)

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, User Stories 2 and 3 can run in parallel after US1 completion
- Within each story: Tests marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Stories Implementation

```bash
# Phase 3-6: User Story 1 (MVP)
Task: "Unit test for expense schema validation in tests/unit/models/expense.test.ts"
Task: "Create Expense Mongoose schema in lib/models/expense.ts"
Task: "Implement signed URL API route in app/api/upload/signed-url/route.ts"
Task: "Create reusable expense form component in components/expense-form.tsx"
Task: "Create expense mutations hook in hooks/use-expense-mutations.ts"

# Phase 7: User Story 2 (Manager Approval) - After US1 complete
Task: "Create reusable expense list component in components/shared/expense-list.tsx"
Task: "Create Ready for Approvals page in app/dashboard/manager/approvals/page.tsx"
Task: "Update PATCH validation for manager approval in app/api/expenses/[id]/route.ts"

# Phase 8: User Story 3 (Finance Processing) - Parallel with US2
Task: "Create Ready for Reimbursement page in app/dashboard/finance/reimbursements/page.tsx"
Task: "Add expense export functionality in app/api/exports/route.ts"
Task: "Update PATCH validation for admin reimbursement in app/api/expenses/[id]/route.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: US1 Data Layer
4. Complete Phase 4: US1 API Layer
5. Complete Phase 5: US1 UI Components (parallel with Phase 4 if possible)
6. Complete Phase 6: US1 Integration
7. **STOP and VALIDATE**: Test User Story 1 independently
8. Deploy/demo MVP if ready

### Full Implementation (All User Stories)

1. Complete MVP (User Story 1) as above
2. Complete Phase 7: US2 Manager Approval Workflow
3. Complete Phase 8: US3 Finance Processing (parallel with Phase 7)
4. Complete Phase 9: Audit Logging & Security
5. Complete Phase 10: Polish & Cross-Cutting Concerns

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 in sub-phases → Test independently → Deploy/Demo (MVP!)
3. Add User Stories 2 & 3 → Test workflows → Deploy full system
4. Each sub-phase adds incremental value within the story

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
3. Once US1 is done:
   - Developer B: User Story 2 (Manager Approval) - reuses shared components
   - Developer C: User Story 3 (Finance Processing) - reuses shared components
4. Final integration and polish by any available developer

**Shared Component Strategy**: User Stories 1, 2, and 3 all use the same underlying expense list component (`components/shared/expense-list.tsx`) with different API filters and action buttons. This ensures consistency and reduces code duplication.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
