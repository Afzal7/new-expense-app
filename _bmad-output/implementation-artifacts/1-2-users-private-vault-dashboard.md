# Story 1.2: Users Private Vault Dashboard

Status: review

## Story

As a User,
I want a private vault dashboard,
so that I can securely manage my personal expense drafts before sharing them with my organization.

## Acceptance Criteria

1. **Vault Privacy:**
   - [x] Users can access a dedicated `/vault` page that shows only their personal expenses.
   - [x] Personal expenses are marked with "Private" badges and visual indicators.
   - [x] The vault enforces strict isolation - organization members cannot see personal expenses.

2. **Personal Draft Management:**
   - [x] The vault displays all personal draft expenses in reverse chronological order.
   - [x] Users can view draft details, edit drafts, and create new drafts directly from the vault.
   - [x] Empty vault state provides clear onboarding messaging and quick actions.

3. **Privacy Enforcement:**
   - [x] Personal expenses use `organizationId: null` for complete isolation.
   - [x] Vault queries only return expenses where `userId` matches current user and `organizationId` is null.
   - [x] Authentication is required to access the vault page.

## Tasks / Subtasks

- [x] Task 1: Create Vault Page Structure
  - [x] Implement `/vault` page with authentication guards
  - [x] Add vault header with privacy messaging
  - [x] Create loading skeleton for vault content

- [x] Task 2: Implement Vault Content Component
  - [x] Create `VaultContent` component with personal drafts fetching
  - [x] Add privacy badges and visual indicators
  - [x] Implement empty state with onboarding messaging

- [x] Task 3: Add Vault Navigation and Actions
  - [x] Add "View Details" links to individual expense pages
  - [x] Integrate "Edit" functionality with existing edit dialog
  - [x] Add "Create New" button linking to expense creation

- [x] Task 4: Implement Privacy Enforcement
  - [x] Create `usePersonalDrafts` hook for vault-specific queries
  - [x] Ensure `expenseVisibilityService.getPersonalDrafts()` enforces privacy
  - [x] Add error handling for unauthorized access

## Dev Notes

- **Privacy First:** The vault represents the "Personal Vault" concept from the PRD - a safe space before organizational involvement.
- **Query Isolation:** Use `organizationId: null` as the definitive marker for personal expenses.
- **User Experience:** Empty vault should feel welcoming and guide users toward their first expense capture.
- **Integration:** Vault should seamlessly integrate with existing expense creation and editing flows.

## References

- [PRD Requirements](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/prd.md#FR12-FR13-FR15)
- [Architecture Blueprint](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/architecture.md#3.1.2)
- [UX Design Specification](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/ux-design-specification.md#2.1)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Implemented complete vault dashboard with privacy enforcement
- Added personal draft filtering and management
- Integrated with existing expense creation/editing flows
- Added proper authentication and error handling
- **Code Review Fixes Applied:**
  - Fixed error message exposure security issue
  - Added retry mechanism for failed loads
  - Added loading states for edit operations
  - Fixed accessibility with aria-label on Lock icon
  - Made skeleton count configurable (removed magic number)

### File List
- app/dashboard/vault/page.tsx
- app/dashboard/vault/_components/vault-content.tsx
- hooks/use-expense.ts (usePersonalDrafts hook)
- lib/services/expenseVisibilityService.ts (getPersonalDrafts method)</content>
<parameter name="filePath">_bmad-output/implementation-artifacts/1-2-users-private-vault-dashboard.md