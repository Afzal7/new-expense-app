# Component Inventory

> UI and shared components for Next.js SaaS Starter

## Summary

| Category | Count | Location |
|----------|-------|----------|
| shadcn/ui Components | 27 | `/components/ui/` |
| Shared Components | 8 | `/components/shared/` |
| Page Components | 9 | `/components/*.tsx` |
| Dashboard Components | 12 | `/app/dashboard/_components/` |
| **Total** | **56** | — |

---

## shadcn/ui Components (`/components/ui/`)

Base UI components from shadcn/ui library.

| Component | File | Size | Purpose |
|-----------|------|------|---------|
| AlertDialog | `alert-dialog.tsx` | 3.9KB | Confirmation dialogs |
| Alert | `alert.tsx` | 1.6KB | Alert messages |
| AnimatedGroup | `animated-group.tsx` | 3.3KB | Animated container |
| Avatar | `avatar.tsx` | 1.1KB | User avatars |
| Badge | `badge.tsx` | 1.6KB | Status badges |
| Breadcrumb | `breadcrumb.tsx` | 2.4KB | Navigation breadcrumbs |
| Button | `button.tsx` | 2.9KB | Primary action component |
| Card | `card.tsx` | 2.0KB | Content containers |
| Collapsible | `collapsible.tsx` | 0.8KB | Expandable sections |
| Dialog | `dialog.tsx` | 4.0KB | Modal dialogs |
| DropdownMenu | `dropdown-menu.tsx` | 8.4KB | Dropdown menus |
| Input | `input.tsx` | 1.0KB | Text inputs |
| Label | `label.tsx` | 0.6KB | Form labels |
| RadioGroup | `radio-group.tsx` | 1.5KB | Radio selections |
| Select | `select.tsx` | 6.3KB | Dropdown select |
| Separator | `separator.tsx` | 0.7KB | Visual dividers |
| Sheet | `sheet.tsx` | 4.1KB | Side panels |
| Sidebar | `sidebar.tsx` | 21.7KB | Dashboard sidebar ⭐ |
| Skeleton | `skeleton.tsx` | 0.3KB | Loading states |
| Sonner | `sonner.tsx` | 1.0KB | Toast notifications |
| Switch | `switch.tsx` | 1.2KB | Toggle switches |
| Tabs | `tabs.tsx` | 2.0KB | Tab navigation |
| TextAnimate | `text-animate.tsx` | 7.7KB | Text animations |
| TextEffect | `text-effect.tsx` | 7.3KB | Text effects |
| Textarea | `textarea.tsx` | 0.8KB | Multi-line input |
| Tooltip | `tooltip.tsx` | 1.9KB | Hover tooltips |
| UpgradeModal | `upgrade-modal.tsx` | 2.2KB | Subscription upgrade |

---

## Shared Components (`/components/shared/`)

Reusable business logic components.

| Component | File | Size | Purpose |
|-----------|------|------|---------|
| DashboardBreadcrumb | `dashboard-breadcrumb.tsx` | 3.1KB | Dashboard navigation |
| EmptyState | `empty-state.tsx` | 2.2KB | Empty content placeholder |
| ErrorState | `error-state.tsx` | 2.1KB | Error display |
| LoadingSkeleton | `loading-skeleton.tsx` | 5.0KB | Loading states |
| OAuthButton | `oauth-button.tsx` | 2.7KB | OAuth login buttons |
| ProOnly | `pro-only.tsx` | 3.3KB | Pro feature gate |
| SubscriptionBanner | `subscription-banner.tsx` | 3.8KB | Subscription status banner |
| SubscriptionStatus | `subscription-status.tsx` | 3.2KB | Status indicator |

---

## Page Components (`/components/*.tsx`)

Root-level page and layout components.

| Component | File | Size | Purpose |
|-----------|------|------|---------|
| ErrorBoundary | `error-boundary.tsx` | 5.7KB | Error handling |
| FooterOne | `footer-one.tsx` | 7.8KB | Site footer |
| Header | `header.tsx` | 6.0KB | Site header |
| HeroSection | `hero-section.tsx` | 15.5KB | Homepage hero ⭐ |
| Login | `login.tsx` | 6.7KB | Login form |
| Logo | `logo.tsx` | 6.7KB | Logo component |
| Pricing | `pricing.tsx` | 3.1KB | Pricing display |
| Providers | `providers.tsx` | 2.1KB | Context providers |
| SignUp | `sign-up.tsx` | 7.3KB | Signup form |

---

## Dashboard Components (`/app/dashboard/_components/`)

Dashboard-specific components.

| Component | File | Size | Purpose |
|-----------|------|------|---------|
| CreateOrganizationModal | `create-organization-modal.tsx` | 4.0KB | Org creation |
| DashboardContent | `dashboard-content.tsx` | 2.6KB | Main dashboard view |
| KeyMetricsCard | `key-metrics-card.tsx` | 4.1KB | Metrics display |
| OrganizationCard | `organization-card.tsx` | 3.4KB | Org summary card |
| ProjectStatusCard | `project-status-card.tsx` | 2.6KB | Project status |
| QuickActionsCard | `quick-actions-card.tsx` | 2.7KB | Quick action buttons |
| SystemHealthCard | `system-health-card.tsx` | 2.7KB | System status |
| TeamActivityCard | `team-activity-card.tsx` | 2.0KB | Team activity feed |
| TipsGuidanceCard | `tips-guidance-card.tsx` | 1.7KB | User tips |
| UpgradeModal | `upgrade-modal.tsx` | 3.6KB | Upgrade prompt |
| UsageMetricsCard | `usage-metrics-card.tsx` | 2.7KB | Usage statistics |
| WelcomeCard | `welcome-card.tsx` | 5.2KB | Welcome message |

---

## Component Dependencies

### Design System
- **Base**: shadcn/ui components
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)

### Key Patterns

1. **Composition**: Components compose shadcn primitives
2. **Variants**: Use `class-variance-authority` for variants
3. **Slots**: Use Radix slots for flexibility
4. **Server Components**: Many components are RSC by default

---

## Adding New Components

### Using shadcn/ui CLI

```bash
# Add new shadcn component
npx shadcn@latest add <component-name>
```

### Custom Shared Component

```typescript
// /components/shared/my-component.tsx
export function MyComponent({ prop }: MyComponentProps) {
  return (
    <div className="...">
      {/* Component content */}
    </div>
  );
}
```

### Dashboard Component

```typescript
// /app/dashboard/_components/my-card.tsx
"use client";

import { Card } from "@/components/ui/card";

export function MyCard() {
  return (
    <Card>
      {/* Card content */}
    </Card>
  );
}
```
