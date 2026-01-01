<!--
Sync Impact Report:
- Version change: N/A → 1.0.0 (initial version)
- Added sections: All principles and sections added
- Templates requiring updates: None (constitution newly created)
- Follow-up TODOs: None
-->

# Expense App Constitution

## Core Principles

### I. DRY Principle

Always follow DRY principle. Create common components, hooks, utils, etc. Never repeat code. This ensures maintainability and reduces bugs from duplicated logic.

### II. Component Completeness

Always create common components and hooks that contain the complete user action. For example: CreateExpenseButton should contain the button code + modal code for creating the expense + API calls etc. so the button can be copy pasted at multiple places. This promotes reusability and consistency across the UI.

### III. API Management

No native fetch calls allowed. Always use TanStack Query for data fetching and mutations. This provides caching, error handling, and optimistic updates out of the box. No multiple retries in tanstack query.

### IV. UI Component Library

No custom components allowed without asking the user. Always use shadcn and its registries for components. This ensures consistent design system and accessibility. use shadcn mcp for fetching the components.

### V. State Management

Always maintain empty, loading, error state for every page/section/modal. This provides a robust user experience and handles all possible UI states.

### VI. Action Feedback

Always check what should happen when an action is successful. For example: on creating an expense, loading is shown on the button, a toast is shown on success/error, expenses list is updated on success, etc. This ensures users receive clear feedback on their actions.

### VII. API Design

No server actions. Always create generic reusable REST APIs that follow best practices. This allows for better testing, caching, and client flexibility.

### VIII. Code Quality

No shortcuts allowed in code. The code should be ideal, readable and maintainable. This includes proper naming, comments, and structure.

### IX. Development Workflow

Divide tasks in logical blocks and run lint then build after completing each block. This ensures incremental quality and catches issues early.

### X. Type Safety

Always use TypeScript with strict mode enabled. This prevents runtime errors and improves developer experience. No any type allowed.

### XI. Configuration Management

Use environment variables for all configuration. Never hardcode secrets or environment-specific values.

### XII. Error Handling

Implement error boundaries in React and proper error handling in APIs. Always log errors and provide user-friendly messages.

### XIII. Existing Code

Always use existing code and components if they are already present. Do not create new components if they are already present.

## Technology Stack

The project uses React, Next.js, MongoDB, Better Auth, TanStack Query, shadcn UI, and Cloudflare R2 for storage. All code must adhere to the specified stack without deviations.

## Quality Assurance

- Automated linting and building in CI/CD
- Unit tests for components and hooks
- Integration tests for API calls
- E2E tests for critical user flows
- Code reviews required for all changes
- Performance monitoring and optimization

## Governance

Amendments to this constitution require consensus from all contributors and documentation of changes. Version increments follow semantic versioning: MAJOR for breaking changes, MINOR for additions, PATCH for clarifications. Compliance is reviewed in pull requests, with references to this constitution for justification of any deviations.

**Version**: 1.0.0 | **Ratified**: 2025-12-31 | **Last Amended**: 2025-12-31
