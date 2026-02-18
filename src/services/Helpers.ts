/**
 * Converts a string representation of an array into a string array.
 *
 * @param str - The string to convert (e.g., "['item1', 'item2']").
 * @returns An array of strings.
 */
export function convertToArray(str: string): string[] {
  // Early return for empty or invalid strings
  if (!str || str === "[]") return [];

  // Trim quotes and brackets in one pass
  const trimmed = str.replace(/^\[\s*"|"\s*\]$/g, "");

  // Split and clean elements
  return trimmed
    .split(`", "`)
    .map((word) => word.replace(/^'|'$/g, ""))
    .filter(Boolean); // Remove empty strings
}

/**
 * Sanitizes circular references in an object for safe serialization.
 *
 * @param data - The data to sanitize.
 * @returns The sanitized data with circular references removed.
 */
export function sanitizeCircularReferences<T>(data: T): T {
  const seen = new WeakSet();
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) return undefined;
        seen.add(value);
      }
      return value;
    })
  );
}
