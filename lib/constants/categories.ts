/**
 * Category definitions for expense line items
 */
export const EXPENSE_CATEGORIES = [
  { id: "Meals", label: "Meals", icon: "Utensils" },
  { id: "Travel", label: "Travel", icon: "Plane" },
  { id: "Transport", label: "Transport", icon: "Car" },
  { id: "Office", label: "Office", icon: "Briefcase" },
  { id: "Software", label: "Software", icon: "Laptop" },
  { id: "Others", label: "Others", icon: "MoreHorizontal" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  EXPENSE_CATEGORIES.map((cat) => [cat.id, cat.icon])
);

/**
 * Get icon name for a category, with fallback to default icon
 */
export function getCategoryIconName(category?: string): string {
  if (!category) return "Briefcase";
  return CATEGORY_ICONS[category] || "MoreHorizontal";
}
