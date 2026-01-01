# Implementation Plan: Expense App MVP (User Story 1)

**Branch**: `001-expense-app-mvp` | **Date**: 2025-12-31 | **Spec**: spec.md
**Input**: Feature specification from `/specs/001-expense-app-mvp/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement User Story 1: Employee Expense Capture and Submission. This involves creating a form for expense entry with embedded line items, file uploads to Cloudflare R2 via signed URLs, draft saving, and submission for pre-approval. Technical approach uses Next.js, React, TanStack Query, shadcn components, and MongoDB with embedded documents.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.x, Next.js 14+
**Primary Dependencies**: TanStack Query, shadcn/ui, Better Auth, Mongoose
**Storage**: MongoDB (data), Cloudflare R2 (files)
**Testing**: Jest (unit), Cypress (E2E)
**Target Platform**: Web browsers (Chrome, Firefox, Safari)
**Project Type**: Web application
**Performance Goals**: Sub-100ms response times for form submissions and state transitions
**Constraints**: 5MB file size limit, mobile-first responsive design, no native fetch calls
**Scale/Scope**: 1-100 users, expense management with attachments

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- DRY Principle: Ensure no code duplication in components and hooks.
- Component Completeness: Create self-contained components with full action logic.
- API Management: Use TanStack Query exclusively for data operations.
- UI Component Library: Use shadcn components only.
- State Management: Implement empty/loading/error states.
- Action Feedback: Provide loading, success/error toasts, and list updates.
- API Design: Use REST APIs, no server actions.
- Code Quality: Maintain readable, maintainable code.
- Development Workflow: Divide tasks into logical blocks with lint/build checks.
- Type Safety: Use TypeScript with strict mode.
- Configuration Management: Use environment variables.
- Error Handling: Implement error boundaries and proper handling.

All principles are planned to be followed for User Story 1 implementation.

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
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
