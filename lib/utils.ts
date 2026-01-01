import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Compares two objects and returns only the fields that have changed.
 * Handles primitive values, arrays, and nested objects.
 * For arrays, it returns the full array if any element differs.
 * For objects, it recursively compares nested properties.
 */
export function getChangedFields(
  previous: Record<string, unknown> | undefined | null,
  updated: Record<string, unknown> | undefined | null
): Record<string, unknown> | undefined {
  if (!previous && !updated) return undefined;
  if (!previous) return updated || undefined;
  if (!updated) return undefined;

  const changes: Record<string, unknown> = {};

  // Get all keys from both objects
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(updated)]);

  for (const key of allKeys) {
    const prevValue = previous[key];
    const updatedValue = updated[key];

    // Handle arrays - if any element differs, include the entire array
    if (Array.isArray(prevValue) && Array.isArray(updatedValue)) {
      if (JSON.stringify(prevValue) !== JSON.stringify(updatedValue)) {
        changes[key] = updatedValue;
      }
      continue;
    }

    // Handle objects - recursively compare
    if (
      typeof prevValue === "object" &&
      typeof updatedValue === "object" &&
      prevValue !== null &&
      updatedValue !== null &&
      !Array.isArray(prevValue) &&
      !Array.isArray(updatedValue)
    ) {
      const nestedChanges = getChangedFields(
        prevValue as Record<string, unknown>,
        updatedValue as Record<string, unknown>
      );
      if (nestedChanges && Object.keys(nestedChanges).length > 0) {
        changes[key] = updatedValue;
      }
      continue;
    }

    // Handle primitive values and other types
    if (prevValue !== updatedValue) {
      changes[key] = updatedValue;
    }
  }

  return Object.keys(changes).length > 0 ? changes : undefined;
}
