/**
 * A TTL-based in-memory LRU cache.
 *
 * @typeParam T - The type of values stored in the cache.
 */
export class Cache<T> {
  private cache: Map<string, { value: T; timestamp: number }>;
  private ttl: number;
  private enabled: boolean;

  /**
   * @param ttlMs   Time-to-live in milliseconds. Pass `0` or a negative value
   *   to disable caching entirely. @default 1_800_000 (30 minutes)
   * @param maxSize Maximum number of entries before the least-recently-used
   *   entry is evicted. @default 500
   */
  constructor(ttlMs: number = 1_800_000, private maxSize: number = 500) {
    this.cache = new Map();
    this.ttl = ttlMs;
    this.enabled = ttlMs > 0;
  }

  /**
   * Stores a deep-cloned copy of `value` under `key`.
   * Has no effect when the cache is disabled.
   */
  set(key: string, value: T): void {
    if (!this.enabled) return;
    this.cache.set(key, {
      value: JSON.parse(JSON.stringify(value)),
      timestamp: Date.now(),
    });
    if (this.cache.size > this.maxSize) {
      // Evict the least-recently-used entry (head of insertion order)
      const lruKey = this.cache.keys().next().value;
      if (lruKey !== undefined) {
        this.cache.delete(lruKey);
      }
    }
  }

  /**
   * Returns a deep-cloned copy of the cached value for `key`, or `undefined`
   * if the entry is absent or has expired.
   *
   * Accessing an entry moves it to the "most recently used" position so it
   * is the last to be evicted.
   */
  get(key: string): T | undefined {
    if (!this.enabled) return undefined;

    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to tail = mark as most recently used
    this.cache.delete(key);
    this.cache.set(key, item);

    return JSON.parse(JSON.stringify(item.value));
  }

  /**
   * Removes all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Returns `true` when the cache is active (TTL > 0).
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

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
export function preprocessIngredients(input: string): string[] {
  if (!input || typeof input !== "string") return [];

  const parts = input
    .split(/[,:;|\n\r\t]+/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const result = new Set<string>();

  parts.forEach((part) => {
    // Remove percentages and standalone numbers
    const cleaned = part
      .replace(/\s*\d+(\.\d+)?%/g, "")
      .replace(/\b\d+(\.\d+)?\b/g, "")
      .trim();

    // Handle parentheses
    const parenthesesMatch = cleaned.match(/^(.*?)\s*\((.*?)\)$/);
    if (parenthesesMatch) {
      const [, mainPart, parenthetical] = parenthesesMatch;
      if (mainPart.trim()) result.add(mainPart.trim());
      if (parenthetical.trim()) result.add(parenthetical.trim());
    } else {
      if (cleaned) result.add(cleaned);
    }
  });

  return Array.from(result);
}
