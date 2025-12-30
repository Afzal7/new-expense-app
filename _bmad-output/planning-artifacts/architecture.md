---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2025-12-28'
inputDocuments: 
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/product-brief-next-starter-2025-12-26.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/epics.md
  - docs/architecture.md
  - docs/expense-app.md
  - docs/project-overview.md
  - docs/context.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
  - lib/auth.ts
  - lib/db.ts
workflowType: 'architecture'
project_name: 'expense-app'
user_name: 'Afzal'
date: '2025-12-28'
---

## 1. Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The system is centered around a **Unified Expense Entity** with a 1-to-N relationship with **Line Items**. 
*   **Dual-Flow Core**: Workflow A (Direct Reimbursement) and Workflow B (Pre-approval followed by Reimbursement).
*   **Logical Privacy**: Expenses are "Personal" (Private Vault) by default and only become "Org-Related" when a manager is attached.
*   **Reactive Linking**: Orphaned drafts must seamlessly merge into Organizations upon membership confirmation.

**Non-Functional Requirements:**
*   **Dopamine Velocity**: <200ms perceived response time via Motion 12 feedback and Optimistic UI updates.
*   **Fintech Integrity**: Must maintain an **Immutable, Append-Only Audit Trail** for every financial mutation.
*   **Multi-Tenancy**: Strict query-level isolation between Organizations.

**Scale & Complexity:**
*   **Primary Domain**: Fintech / SaaS B2B.
*   **Complexity Level**: **Medium-High** due to the state machine logic, audit requirements, and DDD polish.
*   **Estimated Components**: ~7 core modules (Entity Manager, Workflow Engine, Audit Logger, Visibility Service, Org Sync, Export Service, DDD Component Library).

### Technical Constraints & Dependencies
*   **Stack**: Next.js 16 (Server Actions), Better Auth (Org Plugin), Mongoose/MongoDB, Motion 12, TanStack Query v5.
*   **Auth Hooks**: Custom `beforeAddMember` and `beforeUpdateMemberRole` in `lib/auth.ts` already handle member limits and role protection.

## 2. Starter Template Evaluation

### Primary Technology Domain
**Full-stack Web (SaaS)** based on the existing technical foundation and Fintech/DDD requirements.

### Selected Foundation: "Next-Starter" (Custom)

**Rationale for Selection:**
The project is already utilizing a high-performance **Next.js 16 / React 19** foundation. This stack is specifically chosen for its ability to deliver the **Dopamine-Driven Design (DDD)** requirements, specifically <200ms perceived latency through Server Actions and Optimistic UI updates.

**Architectural Decisions Provided by Foundation:**

*   **Language & Runtime**: TypeScript (Strict) with Node.js 20+ runtime compatibility.
*   **Auth & Multi-Tenancy**: **Better Auth** with the Organization plugin. This handles session management and organization-aware routing. 
    *   *Note*: In Next.js 16, lightweight redirection is handled in `proxy.ts`, while heavy authorization checks are performed directly inside Server Actions.
*   **Data Layer**: **Mongoose / MongoDB**. Provides the flexible schema needed for the "Unified Expense" entity and the append-only audit trail.
*   **Styling & Motion**: **Tailwind CSS v4** + **Motion (Framer Motion 12)**.
    *   Tailwind v4 provides ultra-fast styling, while Motion 12 is critical for the "Success Pulses" and "Glows" required for the DDD experience.
*   **State Management**: **TanStack Query (React Query) v5**.
    *   This is our backbone for **Optimistic UI**. It allows the UI to reflect state changes instantly while background processes ensure eventual consistency.

## 3. Core Architectural Decisions

### Category 1: Data Architecture

#### 1.1 Model Strategy: The "Fat Document" Expense
We utilize a **Single Unified Document** strategy for Expenses to ensure atomic updates and high-performance retrieval for the "Review Queue."
*   **Root Entity**: `Expense` schema containing `userId`, `organizationId` (logical isolation key), `managerId`, and `status`.
*   **Nested Line Items**: A 1-to-N array of line items embedded directly within the document.
*   **Immutable Audit Trail**: An embedded array of audit snapshots, capturing every state change and critical field mutation.

#### 1.2 Transaction & Integrity Strategy
*   **Mandatory Transactions**: Every write operation (mutation) must be wrapped in a **MongoDB session transaction** to ensure all-or-nothing consistency across multiple document updates.
*   **Atomic File Handling**: Since file uploads (UploadThing) occur before the DB transaction, a **Fail-Safe Cleanup** pattern is enforced. If the database transaction fails, the Server Action *must* trigger an immediate deletion of the uploaded asset to prevent "orphaned" storage.

#### 1.3 Validation & Multi-Tenancy
*   **Validation**: **Zod** is the source of truth for all input validation, shared between Client and Server.
*   **Logical Isolation**: All queries are wrapped in an `expenseVisibilityService` that forces inclusion of the `organizationId` or `userId` (for personal vault) filters.

### Category 2: Authentication & Security

#### 2.1 Multi-Layered Protection
*   **Edge Layer (`proxy.ts`)**: Next.js 16 Edge middleware for lightweight, coarse-grained checks (session existence and primary redirections).
*   **Action Guards**: Every Server Action must perform session verification and **RBAC checks** (Role-Based Access Control) using a centralized `verifyPermission` helper.

#### 2.2 Role-Based Access Control (RBAC) Matrix
Permissions are enforced through the Better Auth Organization plugin:
*   **Employee**: `CREATE`, `READ` (own), `UPDATE` (`Draft`, `Rejected`, and **`Pre-Approved`**).
    *   *Note*: The ability to update `Pre-Approved` expenses is critical for the "Incremental Folder" model, allowing users to add receipts to a pre-authorized budget.
*   **Manager**: `READ` (org-wide), `APPROVE/REJECT` (assigned).
*   **Finance/Accountant**: `READ` (org-wide), `REIMBURSE` (all approved).

#### 2.3 Data Exposure Control
*   **Safe DTOs**: Raw Mongoose documents are never exposed. A Data Transfer Object (DTO) layer strips internal fields and ensures sensitive data (like manager emails or audit logs) is only exposed to authorized roles.

### Category 3: API & Communication Patterns

#### 3.1 Architecture: Service Layer Pattern
*   **Decision**: High-level **Server Actions** will act as thin orchestrators, calling a dedicated **`expenseService.ts`** layer for all business logic, database mutations, and audit logging.
*   **Rationale**: Decouples business logic from Next.js action boilerplate, ensuring high testability and reusability (e.g., if we add a background cron job later).

#### 3.2 Data Flow: Server Actions & Result Objects
*   **Decision**: All mutations follow the standard Server Action pattern and return a consistent **Result Object**: `{ success: boolean, data?: T, error?: string }`.
*   **Rationale**: Simplifies client-side error handling and allows the UI to reliably trigger "Success Glows" or "Soft Amber Pulses" based on the response.

#### 3.3 State Synchronization: TanStack Query (v5)
*   **Decision**: Use `useMutation` with **Optimistic Updates** for all "Dopamine-Driven" actions.
*   **Rationale**: Critical for achieving <200ms perceived response time. The UI assumes success immediately while the service layer manages the DB transaction and file handles in the background.

#### 3.4 Media Handling: UploadThing Lifecycle
*   **Decision**: File uploads are handled client-side via **UploadThing**. The generated file URL is then passed to the `createExpense` or `updateExpense` action. 
*   **Integrity**: If the Server Action transaction fails, a manual cleanup call to UploadThing's API is triggered to delete the orphaned asset.

### Category 4: Frontend Architecture

#### 4.1 Rendering Strategy: RSC & Dynamic Interactivity
*   **Decision**: Progressive enhancement using **React Server Components (RSC)** for data-intensive views (Vault/Queue) and **Client Components** for high-fidelity interactive zones (Forms/Animations).
*   **Rationale**: Ensures fast initial paint and SEO while allowing complex stateful interactions (Glows/Pulses) without impacting bulk page performance.

#### 4.2 "Dopamine-Driven" Component Library: Motion 12
*   **Decision**: Standardize on **Framer Motion 12** for all micro-interactions.
*   **Patterns**: 
    *   **Success Glow Overlay**: A reusable emerald aura provider.
    *   **Layout Transitions**: Item movement between lists (e.g., Vault -> Submitted) via `layoutId` sharing.
    *   **Smart Mandate Highlighting**: Dynamic amber/emerald border pulses on inputs.

#### 4.3 Form Utility: React Hook Form + Zod
*   **Decision**: Use `react-hook-form` paired with the `zodResolver`.
*   **Rational**: Bridges the gap between complex frontend validation and the backend Mongoose schemas, ensuring data integrity before the transaction starts.

### Category 5: Infrastructure & Deployment

#### 5.1 Hosting & Runtime: Platform-Agnostic (Node.js 20+)
*   **Decision**: Target a **Standard Node.js 20+** environment (Netlify, Cloudflare, or Railway). We avoid Vercel-specific features (like special caching) in favor of standard Next.js build outputs.
*   **Runtime**: Use the Node.js runtime for the primary API/Service layer to ensure stable Mongoose/MongoDB connections. Use the Edge runtime only where compatible (e.g., standard redirections in `proxy.ts`).

#### 5.2 Database: MongoDB Atlas
*   **Decision**: **MongoDB Atlas** (Dedicated or Serverless).
*   **Connectivity**: Use standardized connection pooling in `lib/db.ts` to ensure compatibility across different serverless/containerized providers.

#### 5.3 Storage: Uppy + Transloadit
*   **Decision**: Use **Uppy** for file upload UI (drag-drop, mobile photo capture) and **Transloadit** for backend processing (resizing, optimization, malware protection). Ensures fail-safe file handling and aligns with performance/security goals.

#### 5.4 CI/CD: Provider-Native or GitHub Actions
*   **Strategy**: Standard GitHub-integrated deployment. Every merge to `main` triggers a production build.

## 4. Implementation Patterns & Consistency Rules

### Category 4: Implementation Patterns

#### 4.1 Naming Conventions (Conflict Prevention)
*   **Database**: MongoDB collections in **`snake_case`** (e.g., `expenses`, `audit_logs`).
*   **Code**: 
    *   Files: **`camelCase.ts`** (e.g., `expenseService.ts`, `successGlow.tsx`).
    *   Functions/Variables: **`camelCase`**.
    *   Types/Interfaces: **`PascalCase`** (e.g., `ExpenseResult`).
*   **API**: Server Action exports named as `[verb][Entity]Action` (e.g., `createExpenseAction`).

#### 4.2 Structural Blueprint
*   **The Service Layer**: All business logic lives in `lib/services/`. Each major entity gets its own file (e.g., `expenseService.ts`, `authService.ts`).
*   **The DDD Layer**: Custom "Dopamine" components (Motion 12) live in `components/ddd/`.
*   **The Schema Layer**: Zod schemas for validation live in `lib/validations/` and are imported by both Client and Server.

#### 4.3 Error & Loading Patterns
*   **Error Handling**: All services must throw a custom `AppError` which the Server Action catches to return the standardized `{ success: false, error: "..." }` object.
*   **Loading States**: Use **Optimistic Updates** via TanStack Query. Every interactive button must have a "Pending" state (visualized via Motion 12 pulses) to maintain the <200ms perceived latency.

#### 4.4 Transactional Integrity Rule
*   **Pattern**: `const session = await db.startSession(); session.startTransaction(); try { ... await session.commitTransaction(); } catch (e) { await session.abortTransaction(); throw e; } finally { session.endSession(); }`

## 5. Project Structure & Directory Mapping

### Complete Project Directory Structure (Expense-App)
```text
next-starter/
├── app/
│   └── dashboard/
│       └── expenses/           # Main functional area
│           ├── layout.tsx      # Multi-item container
│           ├── page.tsx        # Personal Vault / Org Queue toggle
│           ├── [id]/           # Individual expense view
│           └── _actions/       # Route-specific server actions
├── components/
│   └── ddd/                    # Dopamine-Driven Design components
│       ├── SuccessGlow.tsx     # Reusable emerald aura
│       ├── AuditSeal.tsx       # Immutable record indicator
│       └── TransitionBridge.tsx # High-fidelity state transition animations
├── lib/
│   ├── services/               # THE SERVICE LAYER (Core business logic)
│   │   └── expenseService.ts   # Mutations, transactions, and audit logic
│   ├── validations/            # SHARED ZOD SCHEMAS
│   │   └── expense.ts          # Zod schemas for Expenses and Line Items
│   ├── models.ts               # MONGOOSE COLLECTIONS (Root Expense Schema)
│   └── hooks/
│       └── useExpense.ts       # TanStack Query logic (Optimistic Updates)
├── types/
│   └── expense.ts              # Global TypeScript interfaces
```

### Architectural Boundaries & Integration Points

**Service Boundary:**
The `expenseService.ts` is the **System of Record** for all expense mutations. It encapsulates MongoDB transactions and audit logging. No other module (Server Actions or external jobs) should write directly to the `Expense` collection.

**Validation Boundary:**
All data entering the Service layer must be sanitized and validated using the Zod schemas in `lib/validations/expense.ts`. This ensures a "Security-First" approach where malformed data never hits the database or audit logs.

**Visibility & Multi-Tenancy Boundary:**
The `expenseService` methods must strictly enforce organization-level isolation. Queries must always include a mandatory filter for `organizationId` (for shared expenses) or `userId` (for the private vault), with no exceptions.

### Requirements to Structure Mapping

**Feature/Epic Mapping:**
*   **Epic: Expense Lifecycle** -> `app/dashboard/expenses/`, `lib/services/expenseService.ts`.
*   **Epic: Dopamine Feedback** -> `components/ddd/`, `lib/hooks/useExpense.ts`.
*   **Epic: Audit & Compliance** -> `lib/models.ts` (Audit Schema), `lib/services/expenseService.ts:logMutation`.

## 6. Architecture Validation Results

### Coherence Validation ✅
*   **Decision Compatibility**: The stack (Next.js 16 + Mongoose + TanStack Query) is stable and leverages modern 2025 best practices. Transactions and file handling are explicitly decoupled but logically linked.
*   **Pattern Consistency**: The Service Layer acts as the single source of truth, ensuring that audit logs and state transitions are never bypassed.
*   **Structure Alignment**: The directory mapping separates concerns (DDD vs Services vs Validations) to prevent AI agent conflicts.

### Requirements Coverage Validation ✅
*   **Epic/Feature Coverage**: 100% of the PRD's core flows (Capture, Pre-approval, Submission) are mapped to specific service methods and component zones.
*   **Functional Requirements Coverage**: All state-machine transitions and "Private Vault" logic are accounted for in the Service Layer design.
*   **Non-Functional Requirements Coverage**: 
    *   **Performance**: Guaranteed by Optimistic Updates and Motion 12 pulses.
    *   **Integrity**: Enforced by mandatory transactions and fail-safe file cleanup logic.
    *   **Multi-Tenancy**: Secured by the mandatory visibility service filters.

### Implementation Readiness Validation ✅
*   **Overall Status**: **READY FOR IMPLEMENTATION**
*   **Confidence Level**: **High**. 
*   **Key Strengths**: Explicitly handles the complex intersection of file uploads and database transactions, while codifying the "Dopamine" feel into implementation patterns.

### Architecture Completeness Checklist
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical stack fully specified (Platform-Agnostic)
- [x] Naming conventions and patterns established
- [x] Complete directory structure defined
- [x] Requirements to structure mapping complete

### Implementation Handoff

**AI Agent Guidelines:**
- Follow the **Service Layer Pattern**: Handlers in `lib/services/expenseService.ts` must be the only source of truth for mutations.
- Prioritize **Optimistic UI**: Use TanStack Query mutations for all DDD interactions.
- Enforce **Transactional Integrity**: Use the documented MongoDB transaction pattern for all complex writes.

## 7. Architecture Completion Summary

### Workflow Completion
**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2025-12-28
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Architecture Readiness Assessment
**Overall Status:** READY FOR IMPLEMENTATION ✅
**Confidence Level:** High (Validated against PRD and UX Specs)

**Key Strengths:**
- **Financial Integrity**: Mandatory transactions and fail-safe file cleanup ensure high data reliability.
- **Performance First**: Explicit patterns for Optimistic UI and "Dopamine-Driven" micro-interactions.
- **Security-Led**: Multi-tenant visibility filters baked into the service layer service boundary.

### Next Implementation Phase

**First Steps for Developer Agents:**
1.  **Initialize Schemas**: Focus on `lib/validations/expense.ts` (Zod) and `lib/models.ts` (Mongoose).
2.  **Core Service Layer**: Implement `lib/services/expenseService.ts` with the transactional audit pattern.
3.  **Basic Actions**: Create the first CRUD actions in `app/dashboard/expenses/_actions/`.

---
*This architecture document serves as the Technical System of Record for the expense-app. AI agents must refer to this document before implementing any code.*
