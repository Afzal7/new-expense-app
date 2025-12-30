---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
inputDocuments: 
  - _bmad-output/planning-artifacts/product-brief-next-starter-2025-12-26.md
  - docs/architecture.md
  - docs/component-inventory.md
  - docs/context.md
  - docs/development-guide.md
  - docs/expense-app.md
  - docs/index.md
  - docs/project-overview.md
  - docs/source-tree-analysis.md
workflowType: 'prd'
lastStep: 10
documentCounts:
  briefCount: 1
  projectDocsCount: 8
  researchCount: 0
  brainstormingCount: 0
---

# Product Requirements Document - next-starter

- **Current Step:** 11/11 (Finalization & Review)
- **Status:** Final Review
- **Last Updated:** 2025-12-27

## Executive Summary

**next-starter** is a "UX-first" expense management platform designed specifically for SMBs (10-500 employees). While legacy enterprise tools (Concur, Expensify) prioritize rigid compliance and complex hierarchies, **next-starter** treats organization structure as a descriptive reporting layer. This ensures that the tool never blocks the user: employees can snap and submit expenses immediately, with manager visibility and approval workflows kicking in once organization membership is finalized. This is a pure "UX play" aimed at transforming chaotic receipt management into a seamless, frictionless experience for both employees and managers.

### What Makes This Special

*   **Flexibility First:** Non-blocking submission process. Employees can submit expenses without waiting for organization approval or setup.
*   **Pure UX Play:** A consumer-grade interface tailored for the "On-the-Go" employee and the "Player-Coach" manager. The focus is on speed (3-click submission) and reducing administrative burden over complex enterprise feature sets.
*   **Descriptive Hierarchy:** Organization membership is for reporting and routing, not a barrier to capturing financial data.

## Project Classification

**Technical Type:** saas_b2b
**Domain:** fintech
**Complexity:** high
**Project Context:** Brownfield - extending existing system (Next.js, Better Auth, Mongoose)

This project is classified as high complexity due to the fintech nature of expense management, requiring robust audit trails, security, and potential regional compliance considerations, even with a focus on UX simplicity.

## Success Criteria

### User Success
*   **Dopamine-Driven Design (DDD):** The UI is engineered to provide psychological rewards for productivity. Every core action (submission, approval, state change) triggers subtle, high-fidelity micro-interactions that make the user feel a sense of accomplishment and speed.
*   **Minimalist Aesthetic:** DDD is achieved through refined fluidity and whitespace, avoiding "cheap" or "busy" animations (like confetti). The dopamine hit comes from the *feeling of efficiency* and the *premium quality* of the interaction.
*   **"Sign-up to Snap" in < 2 mins:** Every barrier to entry is removed. Success is defined by how fast a user can capture their first expense.
*   **Unified Expense Logic:** A single, clean interface handles 1 to N items. No mental overhead.
*   **Safety Net:** 100% of "orphaned" receipts are captured instantly as Drafts and linked silently upon Org membership.

### Business Success
*   **UX-Induced Loyalty:** Small teams adopt the tool because it's the "path of least resistance."
*   **High Flow-B Adoption:** 90%+ of users utilize the pre-approval flow because the UI makes it feel faster than spending without permission.

### Technical Success
*   **Flexible State Machine (Mongoose):** A robust schema handling: `Draft`, `Pre-Approval Pending`, `Pre-Approved`, `Approved`, `Rejected`. 
*   **Industrial-Grade Performance:** Sub-100ms response times to maintain the "Dopamine-Driven" speed.

## Product Scope

### MVP - Minimum Viable Product
*   **Unified "Expense" Entity:** A minimalist form for 1..N items with attachment support.
*   **Dual-Flow Core:** 
    *   **Flow A:** Snap -> Add items -> Reimburse.
    *   **Flow B:** Request Pre-Approval -> Incur -> Attach -> Reimburse.
*   **Philosophy-First UI:** A design system built on **Dopamine-Driven Design (DDD) — prioritizing elegant, purposeful micro-feedback over flashy distractions.
*   **Extensible Workflow:** A five-state machine (`Draft`, `Pre-Approval Pending`, `Pre-Approved`, `Approved`, `Rejected`) designed for future flexibility.
*   **Reactive Org Linking:** Seamlessly merging draft expenses into new Organizations.
*   **Manager Review Queue:** A high-density, low-clutter view for managers to act on expenses.

### Growth Features (Post-MVP)
*   **AI OCR Automation:** "Zero-Entry" receipt scanning.
*   **Multi-Currency & Regional Tax Logic.**

### Vision (Future)
*   **Corporate Card Issuance & Financial OS Integration.**

## User Journeys

### Journey 1: Alex (Employee/Manager) - The "Total Spend" View
Alex uses **next-starter** for all his daily spending. He snaps a ₹400 personal bookstore receipt because he likes the organized history.
*   **Action:** He captures the receipt. By default, it is marked as **"Personal"**. The UI provides a subtle, warm "Private" indicator, ensuring him this data is in his "Private Vault."
*   **Flow (Business):** Later, he pays for a ₹3k business dinner. He snaps the receipt and selects **"Marcus (Global Corp)"** as the reviewer.
*   **The Dopamine Hit:** The app transitions the UI state smoothly. The bookstore receipt stays in his private timeline, while the dinner receipt generates a "Submission Pending" acknowledgment. Alex feels organized, safe, and completely in control of his boundary between life and work.

### Journey 2: Sarah (Employee) - The "Pre-Approval Peace of Mind" (Flow B)
Sarah is planning a ₹25k business trip but wants confirmation before committing funds.
*   **Action:** Sarah starts an Expense entry as a "Pre-Approval Request." She types "Onsite at Bangalore Office" and enters an estimate.
*   **Flow:** She hits "Send." The app gives her a "Request Sent" micro-acknowledgment—a gentle, minimalist glow.
*   **The Hit:** An hour later, she receives a notification: "Marcus approved your Bangalore Trip." The app reflects a premium, emerald-green "Pre-Approved" status. Sarah books her travel with zero anxiety, knowing the budget is cleared.

### Journey 3: Marcus (Manager) - The "Inbox Zero" High
Marcus is a busy lead with a team of 10. He avoids "admin days" by clearing his queue on the go.
*   **Action:** Marcus opens his minimalist "Review Queue" while in an Uber. 
*   **Flow:** He taps Alex's dinner expense. He sees the high-fidelity receipt image and clear itemization. 
*   **The Hit:** He taps "Approve." The item vanishes with a fluid transition, and his "Pending" count decrements with a sleek numeric flip. Marcus clears his entire queue in 2 minutes, enjoying the dopamine of a clean slate and unblocked team.

### Journey 4: Elena (Finance) - The "Reimbursement Loop"
Elena ensures the company's books are balanced and employees are actually paid.
*   **Action:** Elena enters the "Finance Audit" dashboard and sees a batch of "Approved" expenses ready for payout.
*   **Flow:** She verifies the tax categories and marks the batch as **"Processed"**.
*   **The Hit:** The app transitions the expenses to the **"Reimbursed"** state. Alex and Sarah get "Payment Sent" notifications. Elena feels the satisfaction of an immaculate audit trail with zero manual data entry.

### Journey 5: Mia (The "Guest to Member" Transition)
Mia uses **next-starter** as an individual (non-member) while waiting for her formal HR onboarding.
*   **Action:** She snaps several receipts into her **Private Drafts**.
*   **Transition:** Once she accepts her formal invite to "Global Corp" (via the existing Org flow), the app detects her drafts: *"You have 3 personal expenses. Ready to link them for reimbursement?"*
*   **The Hit:** She taps "Yes." Reactive Org Linking associates her drafts with the Org manager list. Mia feels the **"Dopamine of Order"**—she didn't lose a second of productivity during her onboarding.

### Journey Requirements Summary
*   **Privacy-First Architecture:** Logical separation between "Personal/Private" state and "Organization/Shared" state.
*   **Unified Expense Logic:** A single form handling 1..N items for both Flow A and Flow B.
*   **State Machine Extensibility:** Transitions for `Draft`, `Pre-Approval Pending`, `Pre-Approved`, `Approved`, `Rejected`, and `Reimbursed`.
*   **Finance Role Capabilities:** Batch processing and audit-ready reporting views.
*   **DDD Animation Library:** Subtle, purposeful micro-interactions that reinforce the "Premium Minimalist" aesthetic.

## Domain-Specific Requirements

### Fintech & Expense Management Compliance
The system acts as a financial record-keeper. While we prioritize "Dopamine-Driven Design," the underlying data must be audit-ready and legally defensible for business reimbursement.

### Key Domain Concerns
*   **Immutable Audit Trail:** Every single change to an **Expense** (amount, merchant, date, manager email, line items) must be logged with a timestamp and the user ID of the person making the change. This ensures transparency and prevents fraud.
*   **Logical Data Privacy:** Users can store "Personal" expenses in the same app. These are logically excluded from all Organization-level queries (Managers/Finance/Admins) until the moment they are explicitly attached to a manager/org.
*   **Verification of Reimbursement:** The systems of record for the actual money transfer remain external (bank portals), but **next-starter** serves as the verification layer.

### Compliance & Finance Requirements
*   **State-Based Accountability:** The transition to `Reimbursed` can only be performed by users with the **Finance/Accountant** role.
*   **Data Portability (Audit Ready):** Finance users must be able to export a filtered list of expenses (by date range, manager, or status) in **CSV** or **PDF** format to facilitate external bank payments and tax filing.
*   **Receipt Integrity:** Attachments (Photos/PDFs) must be securely stored and linked directly to the audit log of the expense.

### Technical Implementation Considerations
*   **Query-Level Multi-Tenancy:** Using specific DB filters to ensure "Personal" data never leaks into "Org" views, rather than maintaining physically separate databases.
*   **Extended Mongoose Schema:** Including an `auditLog` array in the Expense schema to store chronological change snapshots.

## Innovation & Novel Patterns

### Detected Innovation Areas
*   **Dopamine-Driven B2B Design (DDD):** We are challenging the assumption that business software must be "utilitarian and dull." By engineering psychological rewards into the simplest tasks (snapping a receipt, clearing an inbox), we maximize employee compliance through pleasure rather than policy enforcement.
*   **Zero-Config "Reactive" Onboarding:** We are flipping the enterprise onboarding funnel. Employees can be productive on Day 1 in their "Private Vault," with organizational hierarchies catching up to them reactively. This eliminates the "Setup Bottleneck" common in competitors like Zoho.
*   **The "Zero-Input" Roadmap:** Our strategic innovation is the elimination of the "Form." 
    *   **Phase 2 (Growth):** High-fidelity OCR and autofill will turn a 15-second entry into a 1-second "Confirm" action.
    *   **Phase 3 (Vision):** Pervasive AI integration to predict categories, flag unusual spend, and automate the manager's review process.

### Validation Approach
*   **Submission Velocity:** Measuring the delta between "Receipt Incurred" and "Receipt Snapped." A lower delta validates that our DDD + Zero-Config approach is working.
*   **Usage Heartbeat:** Tracking daily active usage for "Personal" vs. "Org" expenses to validate the "Life Tool" retention moat.

### Risk Mitigation
*   **Minimalist Guardrails:** To avoid "cheap" gamification, all DDD micro-interactions must pass a "Modern & Premium" review.
*   **AI Fallback:** By starting with a "Manual-First" MVP, we ensure the product remains 100% functional even in low-connectivity or high-complexity receipt scenarios where AI might fail.

## SaaS & B2B Technical Requirements

### Multi-Tenancy Architecture
To support the "Private Vault to Org Submission" model, the system utilizes a **Logical Tenancy** approach within a shared database.
*   **Privacy-First Logic:** Expenses by default have a `OrganizationID` of `null`, making them visible only to the individual user (the Private Vault).
*   **The Linking Trigger:** An expense is officially "shared" with an Organization the moment a Manager (associated with an Org) is attached to the record. This populates the `OrganizationID`.

### Role-Based Access Control (RBAC) Matrix
The system enforces a horizontal visibility model with vertical approval authority.
*   **Employee:** Can view and edit their own expenses (Personal and Org-related).
*   **Manager:** 
    *   **Visibility:** Can view all expenses shared with their specific Organization to ensure team-wide context.
    *   **Authority:** Can only `Approve` or `Reject` expenses where they are designated as the direct reviewer.
*   **Finance/Accountant:**
    *   **Global Visibility:** View-all access across the entire Organization's shared expenses.
    *   **Closing Authority:** Sole permission to transition expenses to the `Reimbursed` state.

### Data Security & Validation
*   **Verified Reviewers:** Users cannot manually enter an arbitrary manager email for submission. The system enforces validation against existing, verified users within the system/organization to prevent "dark" submissions.
*   **Export Sanitization:** While audit trails are maintained internally for integrity, external exports (CSV/PDF) are optimized for reimbursement processing—focusing on amount, merchant, date, and category, and excluding internal audit logs or attachment links to keep files lightweight.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy
*   **Experience MVP:** We launch with a minimalist, high-fidelity experience that solves the manual capture/approval pain with "Premium Minimalist" speed. The goal is to establish the "Dopamine-Driven" hook before introducing automation.

### Phase 1: MVP (The Core Experience)
*   **Unified Expense Management:** 1..N items, Flow A (Capture) & Flow B (Pre-Approval).
*   **Dopamine-Driven Design:** Premium micro-interactions for core actions (speed, fluidity, subtle cues).
*   **Privacy Vault Logic:** Robust logical separation of Personal vs. Org expenses.
*   **Auditability:** Standard immutable change logs for all financial entities.
*   **Manual Finance Workflow:** Multi-user RBAC for Employees, Managers, and Accountants.
*   **Existing Foundation**: Leveraging implemented Better Auth Org Join/Invite flows.

### Phase 2: AI Growth (The "Intelligence" Pivot)
*   **AI OCR Extraction:** One-tap receipt scanning with high-fidelity merchant/amount/date detection.
*   **AI Categorization:** Predictive category assignments based on organization history and user behavior.
*   **AI Policy Guardrail:** Context-aware flagging of duplicates or unusual spending without manual rule-setting.
*   **AI Interaction Layer:** Natural language summaries for efficient manager review.

### Phase 3: Expansion (The Financial OS)
*   **Multi-Currency & Regional Tax:** Global scaling and domestic tax compliance.
*   **Corporate Card Integration:** Real-time visibility into physical/virtual card spend.
*   **Automated Payments:** Integration with payment rails for direct reimbursement.

## Functional Requirements

### 1. Expense Capture & Management (The Unified Entity)
- **FR1:** Users can create an **Expense** entry that contains 1 or multiple line items.
- **FR2:** Users can attach one or more images (JPG/PNG) or PDFs to an Expense or specific line item.
- **FR3:** Users can save an Expense as a **Draft** at any stage of the creation process.
- **FR4:** Users can edit or delete Draft expenses and their associated line items.
- **FR5:** The system provides smart defaults (current date, last used category) for new items.

### 2. Workflow & Flexible State Machine
- **FR6:** Users can submit an Expense for **Pre-Approval** (Flow B).
- **FR7:** Managers can **Approve** or **Reject** a Pre-Approval request with an optional comment.
- **FR8:** Users can submit an Expense for **Final Approval/Reimbursement** (Flow A or B).
- **FR9:** Managers can **Approve** or **Reject** a Final Submission.
- **FR10:** The system enforces a strict transition path: `Draft` → `Pre-Approval Pending` → `Pre-Approved` → `Approved` → `Rejected` → `Reimbursed`.
- **FR11:** The system prevents any user from approving their own Expense submission.

### 3. Personal Vault & Privacy Logic
- **FR12:** Users can mark an Expense as **"Personal"** (Default state for new entries).
- **FR13:** The system ensures "Personal" expenses are never visible to Managers, Admins, or Finance roles.
- **FR14:** Users can convert a "Personal" expense into an "Org-Related" expense by attaching a Manager/Organization.
- **FR15:** The UI must display a "Private/Protected" indicator for all personal expenses.

### 4. Organization, Onboarding & Linking
- **FR16:** Users can create a new Organization (Foundation feature).
- **FR17:** Organization Admins can invite members via email (Foundation feature).
- **FR18:** The system detects "Orphaned" draft expenses when a user joins an Org and prompts for **Reactive Linking** (transitioning personal drafts to Org-related expenses).
- **FR19:** Users can only select from a list of verified Managers within their active Organization.

### 5. Finance & Audit Integrity
- **FR20:** The system records an **Immutable Audit Log** for every change to an Expense (Amount, State, Reviewer, Dates).
- **FR21:** Users can view the internal Audit Trail for their own expenses.
- **FR22:** Finance users can view all `Approved` expenses across the entire Organization.
- **FR23:** Finance users can mark an expense as **`Reimbursed`**.
- **FR24:** Finance users can export filtered expense lists as **CSV** or **PDF**.

### 6. Dopamine-Driven Design (DDD) Capabilities
- **FR25:** The system provides high-fidelity visual/tactile micro-feedback (e.g., pulses, "Success" glows) upon successful state transitions.
- **FR26:** The system uses fluid, minimalist layout transitions to signal progress (e.g., an item moving from "Draft" to "Submitted").

## 10. Non-Functional Requirements (NFRs)

To maintain a high velocity, we prioritize "Standard Excellence"—using industry-standard defaults that align with our Dopamine-Driven and Fintech-Secure requirements without over-engineering.

### 10.1 Performance & Experience (Dopamine Guardrails)
*   **Perceived Velocity:** All state transitions (e.g., clicking "Approve", creating a Draft) must provide visual feedback within **< 200ms**.
*   **Media Fluidity:** Expenses are image-heavy. We will use Next.js\` image optimization (\`next/image\`) and skeleton loaders to ensure receipt viewing feels "smooth" and never "stuck."
*   **Optimistic UI:** Where possible, the UI will reflect state changes immediately (optimistic updates) to satisfy the DDD requirement for instant gratification.

### 10.2 Security & Reliability (Fintech Foundation)
*   **Logical Isolation:** Multi-tenancy must be enforced at the query level. Org members MUST NOT be able to access data from other Organizations under any circumstances.
*   **Data Integrity:** The Audit Trail is the source of truth. It must be append-only. No UI or standard API endpoint shall allow deletion of audit logs.
*   **Session Friction:** We will use standard 24-hour sessions to maintain low friction for employees. High-risk actions (e.g., deleting an Org or changing Finance roles) will require a fresh session/password check.
*   **Durability:** Target 99.9% uptime for the MVP, relying on standard cloud provider (Vercel/Drizzle/Postgres) SLAs.

### 10.3 Scalability & Limits (MVP Boundaries)
*   **Team Capacity:** The system is optimized for teams of **1-100 users**. Beyond 100, we anticipate the need for more complex indexing.
*   **Storage Limits:** Receipt uploads are capped at **10MB per file** to prevent excessive bandwidth usage and storage costs during MVP.
*   **Export Performance:** Finance CSV/PDF exports for up to 1,000 records should generate in **< 5 seconds**.

### 10.4 Accessibility & Platform
*   **Mobile-First Parity:** 100% of Employee and Manager functionality must be usable via mobile web.
*   **Headless Accessibility:** We will use accessible component libraries (e.g., Shadcn) to ensure WCAG 2.1 compliance "by default" without manual overhead.
