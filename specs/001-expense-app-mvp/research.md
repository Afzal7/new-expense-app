# Research Findings: Expense App MVP (User Story 1)

## File Upload to Cloudflare R2

**Decision**: Use signed URLs for direct upload to Cloudflare R2.

**Rationale**: Client requests signed URL from server, then uploads directly to R2. Secure and efficient.

**Alternatives Considered**:

- Server-side upload: Increases server load.
- Base64 encoding: Inefficient.

## TanStack Query for Expense Operations

**Decision**: Use useMutation for create/update, useQuery for fetching drafts.

**Rationale**: Handles loading states, error handling, and optimistic updates automatically.

**Alternatives Considered**:

- Redux: Overkill for this scope.
- Native fetch: Violates constitution.

## Form Validation with shadcn

**Decision**: Use react-hook-form with zod for schema validation, integrated with shadcn Form components.

**Rationale**: Provides type-safe validation and seamless UI integration.

**Alternatives Considered**:

- Manual validation: Error-prone.
- Formik: Less integrated with shadcn.

## Draft Saving Implementation

**Decision**: Auto-save drafts on form changes with debouncing.

**Rationale**: Prevents data loss while avoiding excessive API calls.

**Alternatives Considered**:

- Manual save button: Less user-friendly.
- Local storage only: No persistence across devices.

## State Transitions and Feedback

**Decision**: Use toast notifications for success/error, loading spinners on buttons.

**Rationale**: Aligns with constitution requirements for action feedback.

**Alternatives Considered**:

- Alerts: Less modern.
- No feedback: Poor UX.
