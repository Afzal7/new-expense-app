/**
 * Category definitions for expense line items
 */
/** Stored form/API value when a line item has no category */
export const DEFAULT_EXPENSE_CATEGORY = "Others" as const;

export const EXPENSE_CATEGORIES = [
  { id: "Meals", label: "Meals", icon: "Utensils" },
  { id: "Travel", label: "Travel", icon: "Plane" },
  { id: "Transport", label: "Transport", icon: "Car" },
  { id: "Office", label: "Office", icon: "Briefcase" },
  { id: "Software", label: "Software", icon: "Laptop" },
  { id: "Others", label: "Others", icon: "Package" },
] as const;

/**
 * Use when loading or saving line items: empty / whitespace-only → Others.
 */
export function normalizeExpenseCategory(category?: string | null): string {
  const trimmed = category?.trim();
  return trimmed ? trimmed : DEFAULT_EXPENSE_CATEGORY;
}

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((cat) => [cat.id, cat.icon])
);

/**
 * Get icon name for a category, with fallback to default icon
 */
export function getCategoryIconName(category?: string): string {
  if (!category?.trim()) return "Briefcase";
  return CATEGORY_ICONS[category] || "Package";
}
