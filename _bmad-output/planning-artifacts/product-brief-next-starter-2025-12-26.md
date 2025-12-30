---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: 
  - docs/expense-app.md
  - docs/index.md
  - docs/architecture.md
date: 2025-12-26
author: Afzal
---

# Product Brief: next-starter


## Executive Summary

**next-starter** is an expense management platform specifically designed for small-to-medium teams (10-500 employees) who are underserved by complex enterprise tools like Concur or Expensify. By prioritizing consumer-grade UX and extreme flexibility, it transforms chaotic receipt management into a seamless "snap, submit, reimburse" experience. The system treats organization structure as a descriptive layer rather than a blocker, allowing expenses to flow freely while maintaining necessary oversight.

---

## Core Vision

### Problem Statement

Small and medium-sized businesses struggle with chaotic receipt management using either disorganized manual methods or "enterprise" tools that are overkill for their needs. Existing solutions enforce rigid, hardcoded workflows that create friction for employees and slow down reimbursement.

### Problem Impact

*   **Employees** dread submitting expenses due to complex forms and rigid rules.
*   **Managers** get bogged down in administrative hurdles rather than quick approvals.
*   **Companies** suffer from delayed reporting and frustrated teams.

### Why Existing Solutions Fall Short

Market leaders like Concur and Expensify are designed for large enterprises. They prioritize compliance and rigid hierarchy over user experience, making them:
*   Too complex and expensive for teams of 10-500.
*   Overly prescriptive, forcing teams to adapt to the tool rather than the reverse.
*   Clunky and outdated in their user interfaces.

### Proposed Solution

An AI-powered expense management system built on the core principle of **flexibility**.
*   **Consumer-grade UI:** A modern, intuitive interface that feels like a B2C app.
*   **Flexible Workflows:** No hardcoded rules. Employees control the submission flow (draft vs. pre-approval vs. final).
*   **Non-blocking Structure:** Organization membership groups users but never blocks a reimbursement.
*   **Three-Click Experience:** Snap receipt, submit expense, get reimbursed.

### Key Differentiators

1.  **Flexibility First:** Unlike competitors, the system doesn't enforce pre-approval or specific status sequences.
2.  **Descriptive, Not Prescriptive:** Organization structure is for reporting, not a barrier to payment. Managers can approve expenses even if an employee isn't formally "in" the org yet.
3.  **Consumer-Grade UX:** Built with modern tech (Next.js, Tailwind, shadcn/ui) to look and feel premium vs. legacy enterprise tools.
4.  **Bot-Free Automation:** AI handles the heavy lifting without rigid rule-based bots blocking the user.


## Target Users

### Primary Users

#### 1. "On-the-Go" Employee (Base Role)
*   **Persona:** Field sales rep, consultant, or remote engineer who incurs expenses regularly.
*   **Motivation:** Wants to get reimbursed quickly with zero friction. Hates keeping paper receipts and manually filling out spreadsheets.
*   **Pain Points:** Lost receipts, forgetting to submit expenses until end of month, complex approval forms, opaque reimbursement status.
*   **Needs:** Mobile-first experience, "snap and forget" submission, immediate confirmation that the expense is in the system.

#### 2. The "Player-Coach" Manager
*   **Persona:** Team lead or department manager who manages a team of 5-10 people while also having their own individual responsibilities.
*   **Motivation:** Wants to unblock their team quickly without getting bogged down in admin work. Needs to track team spend without being an accountant.
*   **Pain Points:** Chasing employees for missing receipts, approving expenses in batches (delaying payment), lack of visibility into total team spend.
*   **Needs:** One-click approvals, clear timeline of team expenses, ability to approve from anywhere (mobile), handling their own personal expenses easily.

### Secondary Users

#### 3. Organization Creator / Admin
*   **Persona:** Founder, VP of Operations, or Finance Lead at a small/medium startup.
*   **Motivation:** Wants a lightweight system to impose *just enough* structure to track efficiency without stifling culture.
*   **Pain Points:** Setting up complex enterprise tools, paying per-seat fees for features they don't use, lack of visibility into company-wide burn.
*   **Needs:** Easy invites, simple role management (Owner/Member), zero-setup "organization" grouping.

---

## User Journeys

### Journey 1: The "Three-Click" Submission (Employee)
1.  **Discovery:** Employee pays for client lunch.
2.  **Capture:** Opens app on mobile, taps "New Expense", snaps photo of receipt.
3.  **Submit:** Checks auto-filled amount (AI), selects Manager from dropdown (if in org) or enters email (if not). Taps "Submit".
4.  **Success:** Receives "Submitted" toast. Expense moves to "Pending Approval". Employee puts phone away, task done.
5.  **Reimbursement:** Receives notification: "Expense Approved by [Manager]". Funds processed.

### Journey 2: The "Unblocker" Approval (Manager)
1.  **Trigger:** Receives push notification: "New expense from [Employee] - ₹2,200".
2.  **Review:** Opens app, sees receipt preview and details in "Approvals" tab.
3.  **Action:** Taps "Approve" (or "Request Changes" if receipt is blurry).
4.  **Success:** Expense moves to "Approved". Manager feels good about unblocking team member.
5.  **Dual Role:** Switches tab to "My Expenses" to submit their own coffee receipt to *their* manager.


## Success Metrics

Success for **next-starter** is defined by **speed** and **adoption**. If we are successful, expenses will be submitted faster, approved faster, and users will voluntarily join organizations to streamline their workflows.

### User Success Metrics (The "Value" Metrics)

*   **Submission Speed:** Time from "New Expense" to "Submitted" should be under 30 seconds (proving the "3-click" promise).
*   **Rejection Rate:** Percentage of expenses rejected should decrease (indicating clearer communication and better submission quality).
*   **Reimbursement Velocity:** Average time from "Expense Incurred" to "Expense Approved" decreases compared to baseline (manual process).
*   **Mobile Usage:** >70% of submissions should come from mobile devices (validating the "on-the-go" use case).

### Business Objectives (The "Growth" Metrics)

*   **Viral Adoption:** Track the % of users who join an organization after discovering it via a manager's email (Reactive path).
*   **Organization Density:** Average number of users per organization (growth within teams).
*   **Expansion Revenue:** Number of organizations upgrading to paid tiers (future state, but important to track free-to-paid conversion indicators).

### Key Performance Indicators (KPIs)

| Metric | Target (MVP) | Rationale |
| :--- | :--- | :--- |
| **Submission Friction** | < 30s avg submission time | Validates "consumer-grade" UX promise. |
| **Approval Latency** | < 24h avg approval time | Measures the "unblocking" value for managers. |
| **Org Adoption** | 40% of users join an Org | Checks if the "organization" feature adds perceived value. |
| **Receipt Compliance** | 90% of expenses have receipts | Ensures the system solves the "lost receipt" chaos. |


## MVP Scope

### Core Features

1.  **Expense Submission:**
    *   Single one-off expenses (with/without receipts).
    *   Expense reports (multi-line item collections).
    *   Receipt upload (images/PDF) via mobile or desktop.
2.  **Flexible Workflow:**
    *   Draft mode, Pre-approval request, and Final submission options.
    *   AI-powered extraction (date, amount, merchant) to speed up data entry.
3.  **Organization Management:**
    *   Create Organization (Name, Slug).
    *   Invite Members (Email).
    *   Join Requests (Reactive & Proactive paths).
    *   Basic Role Management (Owner, Member).
4.  **Approvals Dashboard:**
    *   "My Expenses" view for employees.
    *   "Approvals" inbox for managers.
    *   Approve/Reject actions with optional comments.
    *   Timeline view of history.

### Out of Scope for MVP

*   **Complex Routing:** No multi-level approval chains (Manager → Director → VP). Only direct manager approval.
*   **Finance Features:** No integrations with accounting software (Xero, Quickbooks). No multi-currency support.
*   **Advanced Policy:** No hardcoded spending limits or per-diem calculations.
*   **Analytics:** No spending reports or budget tracking dashboards.

### MVP Success Criteria

*   **Functional:** A user can sign up, create an org, invite a team member, and approve that member's expense in < 5 minutes total.
*   **Reliability:** Receipt upload and OCR works 95% of the time without error.
*   **Usability:** Zero support tickets related to "how do I submit an expense?".

### Future Vision

Post-MVP, **next-starter** evolves into a financial operating system for teams.
*   **Smart Policy:** "Auto-approve if under $50 and has receipt."
*   **Corporate Cards:** Issuing virtual cards with pre-set limits.
*   **Travel Integration:** Booking flights/hotels directly inside the app.
*   **Slack/Teams Integration:** Approve expenses directly from a chat message.

<!-- Content will be appended sequentially through collaborative workflow steps -->
