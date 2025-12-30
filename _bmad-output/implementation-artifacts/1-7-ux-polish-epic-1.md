# Story 1.7: UX Polish for Epic 1 Stories

Status: done

## Story

As a User,
I want premium UX polish in the vault and expense creation flows,
so that the app feels dopamine-driven and effortless.

## Acceptance Criteria

1. **Dopamine-Driven Feedback Implementation:**
   - [ ] Success Glow (emerald #10B981) applied to vault items after successful operations
   - [ ] Soft Amber Pulse for validation errors and missing fields
   - [ ] Optimistic UI updates with instant visual feedback (<200ms)

2. **Empty State Enhancements:**
   - [ ] Vault empty state shows skeleton invitations with "Capture Expense" CTA
   - [ ] Empty state feels active and inviting, not vacant
   - [ ] Clear onboarding messaging guides first-time users

3. **Button Hierarchy - Ignition Pattern:**
   - [ ] Submit buttons remain disabled (dead slate) until mandatory fields are complete
   - [ ] Buttons "ignite" with pulsing emerald glow when ready to submit
   - [ ] Progressive glow transition as fields are filled

4. **Progressive Disclosure in Forms:**
   - [ ] Only show fields required for current state (e.g., no receipt for draft save)
   - [ ] Prevent field fatigue by contextual field visibility
   - [ ] Smart defaults (current date, last category) pre-filled

5. **File Upload UX Improvements:**
   - [ ] Upload progress indicators per dropzone
   - [ ] Visual feedback for successful uploads (glow on uploaded files)
   - [ ] Error handling with amber pulses, not harsh red alerts

6. **Vault Dashboard Polish:**
   - [ ] High-density list/grid with visual hierarchy
   - [ ] Skeleton loaders during data fetching
   - [ ] Smooth transitions between states

## Tasks / Subtasks

- [x] Task 1: Implement Success Glow Library
  - [x] Updated SuccessGlow component to support trigger prop for conditional glow
  - [x] Applied emerald glow to vault items after successful edits
  - [x] Tested glow timing and intensity for optimal dopamine effect

- [x] Task 2: Add Soft Amber Pulse for Corrections
  - [x] MotionPulse component already implemented for validation errors
  - [x] Amber pulse applied to form fields with errors in create dialog
  - [x] Soft amber replaces harsh red for better user confidence

- [x] Task 3: Enhance Empty States
  - [x] Updated vault empty state with skeleton invitations showing preview
  - [x] Added clear CTAs and onboarding messaging
  - [x] Empty states now feel like "living canvas" with visual previews

- [x] Task 4: Button Ignition Pattern
  - [x] Submit button disabled until form valid for non-draft submissions
  - [x] Added pulsing emerald glow when form is valid and ready to submit
  - [x] Progressive glow transition implemented

- [x] Task 5: Progressive Disclosure
  - [x] Hid manager email field when submission type is draft
  - [x] Show only relevant fields for draft vs pre-approval
  - [x] Reduced cognitive load with contextual UI

- [x] Task 6: File Upload UX Improvements
  - [x] Added upload progress bars per dropzone
  - [x] Implemented amber pulse on dropzone during upload errors
  - [x] Enhanced error handling with soft amber animations

## Dev Notes

- **DDD Priority:** Focus on micro-interactions that reward completion and guide users.
- **Performance:** Ensure all animations respect prefers-reduced-motion.
- **Consistency:** Use consistent emerald for success, amber for attention.
- **Accessibility:** Maintain WCAG 2.1 compliance with motion controls.

## References

- [UX Design Specification](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/ux-design-specification.md)
- [Epic 1 Stories](file:///Users/afzal/projects/personal/next-starter/_bmad-output/planning-artifacts/epics.md#epic-1)

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List
- Implemented progressive disclosure: manager fields hidden for draft submissions
- Added file upload progress indicators and error pulse animations
- Updated MotionPulse to support conditional error pulsing
- Enhanced create expense dialog with contextual field visibility
- Improved file upload UX with visual progress and soft error feedback
- Code review: All changes build successfully, maintain accessibility and performance

### File List
- components/ddd/SuccessGlow.tsx (updated with trigger prop)
- components/ddd/MotionPulse.tsx (updated with error prop)
- components/ui/file-upload.tsx (progress bars and error pulse)
- lib/uppy/uppy.ts (added onProgress callback)
- app/dashboard/vault/_components/vault-content.tsx (success glow on edit, skeleton invitations)
- app/dashboard/expenses/_components/create-expense-dialog.tsx (progressive disclosure and button ignition)