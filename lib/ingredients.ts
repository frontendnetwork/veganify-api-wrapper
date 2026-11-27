/**
 * Normalises a raw ingredient list string into a deduplicated array of
 * clean ingredient name tokens.
 *
 * @param input - A string containing ingredient names separated by commas,
 *   colons, semicolons, pipes, or whitespace (tabs, newlines). Percentage
 *   values and standalone numbers are stripped. Parenthetical sub-strings
 *   are split into separate entries.
 * @returns A deduplicated array of trimmed ingredient name strings. Returns
 *   an empty array when `input` is falsy or not a string.
 *
 * @example
 * preprocessIngredients("Water 95%, Sugar (organic), Salt")
 * // → ["Water", "Sugar", "organic", "Salt"]
 */
export const preprocessIngredients = (input: string): string[] => {
  // oxlint-disable-next-line anti-slop/no-runtime-typeof -- public helper, callable from JavaScript
  if (!input || typeof input !== "string") {
    return [];
  }

  const parts = input
    .split(/[,:;|\n\r\t]+/u)
    .map((part) => part.replaceAll(/\s+/gu, " ").trim())
    .filter(Boolean);

  const result = new Set<string>();

  for (const part of parts) {
    // Remove percentages and standalone numbers
    const cleaned = part
      .replaceAll(/\s*\d+(?:\.\d+)?%/gu, "")
      .replaceAll(/\b\d+(?:\.\d+)?\b/gu, "")
      .trim();

    // Handle parentheses
    const parenthesesMatch = /^(?<main>.*?)\s*\((?<inner>.*?)\)$/u.exec(
      cleaned,
    );

    const { main = "", inner = "" } = parenthesesMatch?.groups ?? {};

    if (parenthesesMatch) {
      if (main.trim()) {
        result.add(main.trim());
      }

      if (inner.trim()) {
        result.add(inner.trim());
      }
    } else if (cleaned) {
      result.add(cleaned);
    }
  }

  return [...result];
};
