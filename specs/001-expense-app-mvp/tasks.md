---

description: "Task list template for feature implementation"
---

# Tasks: Expense App MVP (User Story 1)

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

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize TypeScript Next.js project with required dependencies including react-dropzone
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Setup MongoDB connection with Mongoose in lib/db.ts
- [ ] T005 [P] Configure Better Auth integration in lib/auth.ts
- [ ] T006 [P] Setup environment configuration management in .env files
- [ ] T007 Create base types for Expense in types/expense.ts
- [ ] T008 Configure error handling utilities in lib/errors.ts
- [ ] T009 Setup toast notification system in components/ui/sonner.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Data Layer (Priority: P1) 🎯 MVP

**Goal**: Establish data models and types for expense management

**Independent Test**: Expense schema validates correctly and types are properly defined

### Tests for User Story 1 - Data Layer ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for expense schema validation in tests/unit/models/expense.test.ts

### Implementation for User Story 1 - Data Layer

- [ ] T012 [US1] Create Expense Mongoose schema in lib/models/expense.ts
- [ ] T007 [US1] Create base types for Expense in types/expense.ts (moved from foundational)

**Checkpoint**: Data layer ready for API development

---

## Phase 4: User Story 1 - API Layer

**Goal**: Implement backend API endpoints for expense operations

**Independent Test**: API endpoints return correct responses for expense CRUD operations

### Tests for User Story 1 - API Layer ⚠️

- [ ] T011 [P] [US1] Unit test for expense API routes in tests/unit/api/expenses.test.ts

### Implementation for User Story 1 - API Layer

- [ ] T016 [US1] Implement signed URL API route in app/api/upload/signed-url/route.ts
- [ ] T017 [US1] Implement expense creation API route in app/api/expenses/route.ts
- [ ] T018 [US1] Implement expense update API route in app/api/expenses/[id]/route.ts
- [ ] T019 [US1] Implement expense retrieval API routes in app/api/expenses/route.ts and app/api/expenses/[id]/route.ts

**Checkpoint**: API layer ready for frontend integration

---

## Phase 5: User Story 1 - UI Components

**Goal**: Create reusable UI components for expense forms and displays

**Independent Test**: Components render correctly and handle user input

### Tests for User Story 1 - UI Components ⚠️

- [ ] T013 [P] [US1] Unit test for expense form component in tests/unit/components/expense-form.test.tsx

### Implementation for User Story 1 - UI Components

- [ ] T013 [US1] Create reusable expense form component (DRY: used for both create and edit) in components/expense-form.tsx
- [ ] T014 [US1] Create line item form component in components/line-item-form.tsx
- [ ] T015 [US1] Create file upload component using React Dropzone in components/file-upload.tsx
- [ ] T022 [US1] Create expense creation page using shared form component in app/dashboard/expenses/create/page.tsx
- [ ] T023 [US1] Create expense list page with edit functionality using shared form component in app/dashboard/expenses/page.tsx

**Checkpoint**: UI components ready for state management

---

## Phase 6: User Story 1 - Integration & State Management

**Goal**: Connect UI to APIs with proper state management and user feedback

**Independent Test**: Full expense creation workflow works end-to-end with proper feedback

### Tests for User Story 1 - Integration ⚠️

- [ ] T014 [P] [US1] Integration test for expense creation workflow in tests/integration/expense-workflow.test.ts

### Implementation for User Story 1 - Integration

- [ ] T020 [US1] Create expense mutations hook in hooks/use-expense-mutations.ts
- [ ] T021 [US1] Create expense queries hook in hooks/use-expenses.ts
- [ ] T024 [US1] Add loading and error states to all components
- [ ] T025 [US1] Add success/error toast notifications for all actions
- [ ] T026 [US1] Implement draft auto-save functionality
- [ ] T027 [US1] Add expense state transitions (Draft → Pre-Approval Pending)
- [ ] T028 [US1] Implement audit log recording in expense operations

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T029 [P] Documentation updates in README.md
- [ ] T030 Code cleanup and refactoring
- [ ] T031 Performance optimization for file uploads
- [ ] T032 [P] Additional unit tests in tests/unit/
- [ ] T033 Security review and hardening
- [ ] T034 Run quickstart.md validation

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
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch tests for Phase 3 (Data Layer):
Task: "Unit test for expense schema validation in tests/unit/models/expense.test.ts"

# Launch API implementation in Phase 4:
Task: "Implement signed URL API route in app/api/upload/signed-url/route.ts"
Task: "Implement expense creation API route in app/api/expenses/route.ts"

# Launch UI components in Phase 5 (parallel with Phase 4):
Task: "Create expense form component in components/expense-form.tsx"
Task: "Create line item form component in components/line-item-form.tsx"
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
8. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 in sub-phases → Test independently → Deploy/Demo (MVP!)
3. Each sub-phase adds incremental value within the story

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence