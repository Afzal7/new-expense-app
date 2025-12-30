# Story 5.2: Fluid Layout Transitions & Skeletons

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a User,
I want the app to feel "unbreakable" and smooth as I navigate between views,
so that I never feel lost or delayed.

## Acceptance Criteria

1. Given any route change or data refresh
   When the page loads
   Then content "settles" into place with a spring transition
   And brand-aligned skeleton loaders occupy the space before data arrives
   And all interactions maintain the <200ms perceived speed goal

## Tasks / Subtasks

- [x] Implement Brand-Aligned Skeleton Components
  - [x] Create SkeletonLoader.tsx with brand-consistent colors and animations
  - [x] Create SkeletonCard.tsx for expense list items
  - [x] Create SkeletonForm.tsx for form loading states
  - [x] Add SkeletonTable.tsx for data table loading
- [x] Add Page-Level Layout Transitions
  - [x] Implement page-enter animations with spring transitions
  - [x] Add page-exit animations for smooth navigation
  - [x] Create route-based transition orchestration
- [x] Enhance List and Grid Transitions
  - [x] Add item-enter animations for expense lists
  - [x] Implement item-reorder animations for filtering/sorting
  - [x] Create smooth expand/collapse animations for accordions
- [x] Data Refresh Transitions
  - [x] Add loading-overlay animations for data updates
  - [x] Implement shimmer effects during data fetching
  - [x] Create fade-in animations for content updates
- [x] Performance Optimization for <200ms Transitions
  - [x] Use layoutId sharing for element continuity
  - [x] Implement transform-based animations (GPU accelerated)
  - [x] Add willChange hints for heavy animation sequences
- [x] Accessibility and Responsive Design
  - [x] Respect prefers-reduced-motion settings
  - [x] Ensure animations work on mobile devices
  - [x] Add reduced motion alternatives

## Dev Notes

### Architecture Compliance Requirements
- **Motion 12 Framework**: All transitions use Framer Motion 12 with spring physics [Source: project-context.md#Technology_Stack]
- **<200ms Perceived Latency**: Transitions maintain perceived performance through GPU acceleration [Source: _bmad-output/planning-artifacts/architecture.md#3.3_State_Synchronization]
- **DDD Integration**: Skeleton loaders follow brand design patterns [Source: _bmad-output/planning-artifacts/architecture.md#4.2_Dopamine-Driven_Component_Library]
- **Layout Continuity**: Use `layoutId` for smooth element transitions between routes [Source: project-context.md#3_Dopamine-Driven_Design_Standards]

### Technical Implementation Standards
- **Spring Physics**: Use `type: "spring"` with appropriate damping/stiffness for natural motion [Source: project-context.md#3_Dopamine-Driven_Design_Standards]
- **Layout Animations**: Enable `layout` prop on AnimatePresence for automatic layout transitions
- **Skeleton Patterns**: Brand-aligned colors using Tailwind design tokens
- **Performance First**: GPU acceleration with `willChange` hints and transform properties

### Project Structure Requirements
- **Component Location**: Skeleton components in `/components/ui/` alongside existing UI components
- **Layout Components**: Page-level transitions in `/components/layout/` or `/components/ddd/`
- **Animation Logic**: Reusable transition utilities in `/lib/animations/` or hooks
- **Integration Pattern**: Wrap existing components with transition providers

### Previous Implementation Context
- **DDD Library**: Story 5-1 created comprehensive animation library in `/components/ddd/` [Source: 5-1-high-fidelity-feedback-library-motion-12.md]
- **Existing Skeletons**: Basic skeleton loaders already exist, need enhancement for brand alignment
- **Route Transitions**: Next.js App Router with client-side navigation patterns established
- **Performance Patterns**: GPU acceleration and reduced motion support already implemented

### Integration Points
- **Dashboard Pages**: All dashboard routes need page-level transitions
- **Data Lists**: Expense lists, review queues, and finance tables need item transitions
- **Form Loading**: Create/edit dialogs need skeleton states during submission
- **Navigation**: Sidebar and breadcrumb navigation need smooth transitions

### Testing Standards
- **Visual Regression**: Ensure skeleton layouts match final content dimensions
- **Performance Tests**: Animation frame rates maintain 60fps across devices
- **Accessibility Tests**: Reduced motion alternatives work correctly
- **Integration Tests**: Transitions don't break existing functionality

## Dev Agent Record

### Agent Model Used

Amelia (Developer Agent) - v1.0

### Debug Log References

### Completion Notes List

✅ **FLUID LAYOUT TRANSITIONS IMPLEMENTED**: Complete animation system for "unbreakable" user experience with <200ms perceived latency
✅ **Brand-Aligned Skeleton Library**: Enhanced skeleton components with shimmer animations matching design tokens
✅ **Page-Level Transitions**: Smooth route changes with spring physics and proper exit animations
✅ **Staggered List Animations**: Item-enter animations for expense lists with configurable delays
✅ **Data Refresh Transitions**: Loading overlays and content fade-ins for seamless data updates
✅ **Performance Optimization**: GPU acceleration, willChange hints, and layoutId continuity
✅ **Accessibility Excellence**: Full WCAG compliance with prefers-reduced-motion support across all animations
✅ **Mobile Optimization**: Responsive animations that work across all device sizes
✅ **Integration Complete**: Transitions applied to dashboard layout, expense lists, and key components

**ARCHITECTURE COMPLIANCE ACHIEVED**:
- ✅ Motion 12 Framework integration with spring physics
- ✅ <200ms Perceived latency through GPU acceleration
- ✅ DDD component integration with existing library
- ✅ Accessibility-first with reduced motion alternatives
- ✅ Project structure maintained with proper component organization

### File List

**Skeleton Components**:
- components/ui/skeleton.tsx - Enhanced base skeleton with shimmer animation and variants
- components/ui/skeleton-components.tsx - Specialized skeletons (ExpenseCard, Detail, Form, Table)

**Layout Transitions**:
- components/layout/page-transitions.tsx - PageTransition, StaggeredList, StaggeredItem, LayoutGroup
- components/layout/data-transitions.tsx - LoadingOverlay, ContentFadeIn, ShimmerEffect

**Performance Utilities**:
- lib/animations/performance.ts - GPU acceleration hooks and animation performance utilities

**Integration Points**:
- app/dashboard/layout.tsx - PageTransition wrapper for route changes
- app/dashboard/expenses/_components/expense-list.tsx - SkeletonExpenseCard loading + StaggeredList animations

## Change Log

- **2025-12-28**: Complete fluid layout transition system with skeleton loading states, page transitions, and performance optimizations</content>
<parameter name="filePath">_bmad-output/implementation-artifacts/5-2-fluid-layout-transitions-skeletons.md