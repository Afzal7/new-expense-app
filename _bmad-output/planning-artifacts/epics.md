---
stepsCompleted: [1, 2, 3]
inputDocuments: 
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# expense-app - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for expense-app, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can create an Expense entry that contains 1 or multiple line items.
FR2: Users can attach one or more images (JPG/PNG) or PDFs to an Expense or specific line item.
FR3: Users can save an Expense as a Draft at any stage of the creation process.
FR4: Users can edit or delete Draft expenses and their associated line items.
FR5: The system provides smart defaults (current date, last used category) for new items.
FR6: Users can submit an Expense for Pre-Approval (Flow B).
FR7: Managers can Approve or Reject a Pre-Approval request with an optional comment.
FR8: Users can submit an Expense for Final Approval/Reimbursement (Flow A or B).
FR9: Managers can Approve or Reject a Final Submission.
FR10: The system enforces a strict transition path: Draft → Pre-Approval Pending → Pre-Approved → Approved → Rejected → Reimbursed.
FR11: The system prevents any user from approving their own Expense submission.
FR12: Users can mark an Expense as "Personal" (Default state for new entries).
FR13: The system ensures "Personal" expenses are never visible to Managers, Admins, or Finance roles.
FR14: Users can convert a "Personal" expense into an "Org-Related" expense by attaching a Manager/Organization.
FR15: The UI must display a "Private/Protected" indicator for all personal expenses.
FR16: Users can create a new Organization.
FR17: Organization Admins can invite members via email.
FR18: The system detects "Orphaned" draft expenses when a user joins an Org and prompts for Reactive Linking.
FR19: Users can only select from a list of verified Managers within their active Organization.
FR20: The system records an Immutable Audit Log for every change to an Expense (Amount, State, Reviewer, Dates).
FR21: Users can view the internal Audit Trail for their own expenses.
FR22: Finance users can view all Approved expenses across the entire Organization.
FR23: Finance users can mark an expense as Reimbursed.
FR24: Finance users can export filtered expense lists as CSV or PDF.
FR25: The system provides high-fidelity visual/tactile micro-feedback (e.g., pulses, "Success" glows) upon successful state transitions.
FR26: The system uses fluid, minimalist layout transitions to signal progress.

### NonFunctional Requirements

NFR1: Perceived Velocity: Visual feedback within < 200ms.
NFR2: Media Fluidity: Use Next.js image optimization and skeleton loaders.
NFR3: Optimistic UI: Reflect state changes immediately.
NFR4: Logical Isolation: Multi-tenancy enforced at the query level.
NFR5: Data Integrity: Append-only Audit Trail.
NFR6: Session Friction: Standard 24-hour sessions with fresh checks for high-risk actions.
NFR7: Durability: 99.9% uptime (Standard cloud provider SLAs).
NFR8: Team Capacity: Optimized for 1-100 users.
NFR9: Storage Limits: Receipt uploads capped at 10MB per file.
NFR10: Export Performance: Exports for up to 1,000 records in < 5 seconds.
NFR11: Mobile-First Parity: 100% of functionality usable via mobile web.
NFR12: Headless Accessibility: Use Shadcn for WCAG 2.1 compliance.

### Additional Requirements

- **Foundation:** "Next-Starter" (Next.js 16, React 19).
- **Data Layer:** Mongoose/MongoDB with embedded `auditLog` array inside the Expense document.
- **Validation:** Zod for shared client/server schemas.
- **Security Pattern:** Middleware (Layout level) + Server Action Guards (verifyPermission).
- **Logic Separation:** Standalone `expense.service.ts` for all business logic mutations.
- **Frontend Components:** Shadcn using specialized registries (@tailark, @animate-ui, @efferd, @shadcn-studio).
- **Animation Engine:** Motion 12 for premium micro-interactions (Glow/Pulse).
- **Storage:** UploadThing for receipt/file uploads.
- **API Strategy:** Server Actions (Next.js 16) with `revalidatePath` and TanStack Query v5.
- **Hosting:** Deferred (Candidates: Cloudflare Pages or Netlify).

### FR Coverage Map

FR1: Epic 1 - Create Expense (1..N items)
FR2: Epic 1 - Attachments support
FR3: Epic 1 - Save as Draft
FR4: Epic 1 - Edit/Delete Drafts
FR5: Epic 1 - Smart Defaults
FR6: Epic 3 - Pre-Approval (Flow B)
FR7: Epic 3 - Manager Review (Pre-Approval)
FR8: Epic 3 - Final Submission
FR9: Epic 3 - Manager Review (Final)
FR10: Epic 3 - State Machine Enforcement
FR11: Epic 3 - Self-Approval Prevention
FR12: Epic 1 - Personal Marker
FR13: Epic 1 - Personal Vault Privacy
FR14: Epic 3 - Convert Personal to Org
FR15: Epic 1 - Private UI Indicator
FR16: Epic 2 - Create Organization
FR17: Epic 2 - Invite Members
FR18: Epic 2 - Reactive Linking
FR19: Epic 2 - Verified Manager Selection
FR20: Epic 1 - Immutable Audit Log (Infrastructure)
FR21: Epic 1 - User View of Audit Trail
FR22: Epic 4 - Finance Review Queue
FR23: Epic 4 - Mark as Reimbursed
FR24: Epic 4 - CSV/PDF Export
FR25: Epic 5 - DDD Feedback Pulses/Glows
FR26: Epic 5 - Fluid Transitions

## Epic List

### Epic 1: Personal Expense Management (The "Vault")
Capture, store, and organize personal receipts with sub-200ms "Vault" speed.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR12, FR13, FR15, FR20, FR21.

### Epic 2: Organization Setup & Onboarding
Teams form, invite members, and link guest drafts reactively.
**FRs covered:** FR16, FR17, FR18, FR19.

### Epic 3: Collaborative Approvals (Flow A/B)
Submission -> Review loop for employees and managers.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR14.

### Epic 4: Finance Control & Audit Integrity
Accountants verify, reimburse, and export organization spend.
**FRs covered:** FR22, FR23, FR24.

### Epic 5: Premium DDD Experience & Polish
Dopamine-Driven micro-interactions and high-fidelity polish.
**FRs covered:** FR25, FR26.

---

## Epic 1: Personal Expense Management (The "Vault")

**Goal:** Enable users to capture, store, and organize personal receipts with sub-200ms "Vault" speed.

### Story 1.1: Project Scaffolding & Core Expense Schema
**As a** Developer,
**I want** to establish the feature-first folder structure and the Mongoose Expense model,
**So that** I have a type-safe foundation for all future expense features.

**Acceptance Criteria:**
- **Given** the defined architecture blueprint
- **When** I initialize the project
- **Then** the folders `@/features/expenses`, `@/lib/services`, and `@/components/ddd` are created
- **And** the Mongoose `Expense` schema includes status enums, 1..N items, and an embedded `auditLog` array
- **And** Zod schemas are defined for expense validation and shared between client/server
- **And** a base `expense.service.ts` is created with a `createPersonalDraft` method that includes audit logging

### Story 1.2: User's Private "Vault" Dashboard
**As a** User,
**I want** to see a clean dashboard listing all my personal draft expenses,
**So that** I have a centralized view of my untracked receipts.

**Acceptance Criteria:**
- **Given** I am logged into the application
- **When** I navigate to `/dashboard/vault`
- **Then** I see a high-density list or grid of my personal draft expenses
- **And** the view uses a skeleton loader while fetching data
- **And** an empty state is displayed if I have no drafts, with a clear "Capture Receipt" CTA

### Story 1.3: Capture New Personal Expense (1..N Items)
**As a** User,
**I want** to fill out a minimalist form to capture merchant, date, and multiple line-items,
**So that** I can accurately record my spending as a personal draft.

**Acceptance Criteria:**
- **Given** I am on the Vault Dashboard
- **When** I click "Capture Receipt"
- **Then** I am presented with a form that defaults to today's date and the last used category
- **And** I can add multiple line items with descriptions and amounts
- **And** clicking "Save Draft" triggers an optimistic UI update, closing the form instantly (<200ms visual feedback)
- **And** the record is created with `organizationId: null` and `status: 'Draft'`

### Story 1.4: Receipt Attachment Pipeline (UploadThing)
**As a** User,
**I want** to upload photos or PDFs of my receipts directly into my expense record,
**So that** I have verifiable proof for future reimbursements.

**Acceptance Criteria:**
- **Given** I am creating or editing an expense draft
- **When** I drop a file (up to 10MB) into the upload zone
- **Then** the file is uploaded to UploadThing via a server action
- **And** a high-fidelity preview/thumbnail is displayed in the form
- **And** the file URL is saved to the specific line item or expense record

### Story 1.5: Draft Management (Edit & Delete)
**As a** User,
**I want** to modify or remove my existing drafts,
**So that** my "Vault" remains accurate and free of clutter.

**Acceptance Criteria:**
- **Given** I have an existing draft in my vault
- **When** I choose to "Edit" or "Delete" the item
- **Then** changes are reflected immediately on the dashboard (Optimistic UI)
- **And** the Background Server Action updates the database and logs the change in the `auditLog`
- **And** a "Draft Updated" or "Draft Removed" Sonner toast is displayed with premium motion

---

## Epic 2: Organization Setup & Onboarding

**Goal:** Enable teams to form, invite members, and link guest drafts reactively.

### Story 2.1: The "Org Guard" Middleware & Layout
**As a** Security-Conscious User,
**I want** secondary protection for my organization routes,
**So that** I can be certain my financial data never leaks to outsiders.

**Acceptance Criteria:**
- **Given** I am navigating to `/dashboard/[orgId]/*`
- **When** the request is processed
- **Then** the Layout Middleware verifies my membership in the specific `orgId`
- **And** I am redirected to an "Access Denied" or "Join Org" page if I lack permission
- **And** the Organization context (Name, Role, Settings) is provided to all child components

### Story 2.2: Create and Manage Organizations
**As a** Team Lead,
**I want** to create a new Organization boundary for my company,
**So that** my team has a dedicated space for expense submissions.

**Acceptance Criteria:**
- **Given** I have a personal account
- **When** I click "Create Organization" and enter a name
- **Then** a new Org record is created via Better Auth
- **And** I am automatically assigned the "Owner" role
- **And** the UI provides a subtle "Org Created" pulse feedback

### Story 2.3: Invite Members & Role Management
**As an** Org Owner,
**I want** to invite my employees to the organization via email,
**So that** they can start submitting expenses against the company budget.

**Acceptance Criteria:**
- **Given** I am in the Org Settings
- **When** I enter an email and select a role (Employee, Manager, Admin)
- **Then** an invite is sent via Resend
- **And** the member appears in the "Pending" list in the Org dashboard
- **And** roles (Owner, Admin, Manager, Employee) are enforced correctly by the UI

### Story 2.4: Reactive Linking Flow (Guest to Member)
**As a** New Employee,
**I want** the system to automatically detect my personal drafts when I join my first organization,
**So that** I can easily convert them into reimbursable business expenses.

**Acceptance Criteria:**
- **Given** I have 1 or more personal drafts with `organizationId: null`
- **When** I accept an invite and join an Organization
- **Then** the UI displays a specialized "Personal to Org" linking prompt
- **And** clicking "Link All" updates the drafts with the new `organizationId`
- **And** the Audit Log records the transition from "Private" to "Org Shared" status

---

## Epic 3: Collaborative Approvals (Flow A/B)

**Goal:** Submission -> Review loop for employees and managers.

### Story 3.1: Manager's Review Queue
**As a** Manager,
**I want** a high-density dashboard showing all expenses pending my signature,
**So that** I can clear my team's blockers quickly.

**Acceptance Criteria:**
- **Given** I have the Manager role
- **When** I view the "Review Queue"
- **Then** I see only expenses where I am the designated reviewer
- **And** I can filter by Employee or Date
- **And** the UI uses skeleton loaders for high-fidelity data fetching

### Story 3.2: Submission Workflow (Flow A/B)
**As an** Employee,
**I want** to submit either a completed expense or a pre-approval request to my manager,
**So that** I can follow company spend policy.

**Acceptance Criteria:**
- **Given** I have a draft expense
- **When** I select a verified manager and click "Submit"
- **Then** the expense state transitions to `Pre-Approval Pending` or `Approved Pending`
- **And** the manager receives an email notification via Resend
- **And** the Audit Log records the submission and actor details

### Story 3.3: Manager Approval/Rejection State Machine
**As a** Manager,
**I want** to approve or reject expenses with optional comments,
**So that** I can control the organization's budget.

**Acceptance Criteria:**
- **Given** an expense is in a `Pending` state
- **When** I click "Approve" or "Reject" with a comment
- **Then** the state machine transitions to the next valid state (`Pre-Approved`, `Approved`, or `Rejected`)
- **And** an Optimistic UI update clears the item from the queue instantly
- **And** the Audit Log captures the manager's comment and timestamp

### Story 3.4: Self-Approval Prevention Guard
**As an** Org Owner,
**I want** to prevent users from approving their own expenses,
**So that** our financial records remain compliant and fraud-free.

**Acceptance Criteria:**
- **Given** a user is an Employee AND a Manager
- **When** they try to select themselves as the reviewer for their own expense
- **Then** the UI prevents the selection
- **And** the Server Action validator throws a "Self-Approval Forbidden" error if bypassed

---

## Epic 4: Finance Control & Audit Integrity

**Goal:** Accountants verify, reimburse, and export organization spend.

### Story 4.1: Finance Global Audit Dashboard
**As a** Finance User,
**I want** a "Read-All" view of all approved expenses across the organization,
**So that** I can prepare for the weekly payout cycle.

**Acceptance Criteria:**
- **Given** I have the Finance/Accountant role
- **When** I enter the Finance Dashboard
- **Then** I can see all expenses in the `Approved` state, regardless of the reviewer
- **And** I see a "Total Payout" roll-up sum for the current view

### Story 4.2: Payout Processing (Reimbursement)
**As a** Finance User,
**I want** to mark batches of approved expenses as "Reimbursed",
**So that** the system reflects that employees have been paid externally.

**Acceptance Criteria:**
- **Given** expenses in the `Approved` state
- **When** I select multiple items and click "Mark as Reimbursed"
- **Then** the items transition to the final `Reimbursed` state
- **And** the Audit Log records the Finance user as the closing actor

### Story 4.3: Financial Data Export (CSV/PDF)
**As a** Finance User,
**I want** to export my current view to a CSV or PDF file,
**So that** I can upload payout data to our corporate bank portal.

**Acceptance Criteria:**
- **Given** any filtered list of expenses
- **When** I click "Export CSV" or "Export PDF"
- **Then** the system generates a file including Merchant, Date, Amount, Category, and Employee Email
- **And** the PDF header includes the Organization Name and timestamp

---

## Epic 5: Premium DDD Experience & Polish

**Goal:** Dopamine-Driven micro-interactions and high-fidelity polish.

### Story 5.1: High-Fidelity Feedback Library (Motion 12)
**As a** User,
**I want** clear, high-quality visual rewards when I complete a task,
**So that** using the app feels productive and premium.

**Acceptance Criteria:**
- **Given** any state transition (Save, Submit, Approve)
- **When** the action completes
- **Then** the UI triggers a subtle "Pulse" or "Glow" micro-interaction from the `@/components/ddd` library
- **And** numerical values (like "Total Spent") use a fluid numeric-flip animation

### Story 5.2: Fluid Layout Transitions & Skeletons
**As a** User,
**I want** the app to feel "unbreakable" and smooth as I navigate between views,
**So that** I never feel lost or delayed.

**Acceptance Criteria:**
- **Given** any route change or data refresh
- **When** the page loads
- **Then** content "settles" into place with a spring transition
- **And** brand-aligned skeleton loaders occupy the space before data arrives
- **And** all interactions maintain the <200ms perceived speed goal
