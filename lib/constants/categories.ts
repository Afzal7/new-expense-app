/**
 * Category to emoji mapping for expense line items
 * Add new categories here as they are introduced
 */

export const CATEGORY_EMOJIS: Record<string, string> = {
  Travel: "✈️",
  Lodging: "🏨",
  Meals: "🍽️",
  Transportation: "🚗",
  Office: "💼",
  Equipment: "💻",
  Training: "📚",
  Marketing: "📢",
  Software: "🔧",
  Utilities: "💡",
  Communication: "📞",
  Entertainment: "🎬",
  Healthcare: "🏥",
  Gifts: "🎁",
  Miscellaneous: "📦",
} as const;

/**
 * Get emoji for a category, with fallback to default emoji
 */
export function getCategoryEmoji(category?: string): string {
  if (!category) return "💼";
  return CATEGORY_EMOJIS[category] || "💼";
}
