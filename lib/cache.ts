/**
 * A TTL-based in-memory LRU cache.
 *
 * @typeParam T - The type of values stored in the cache.
 */
export class Cache<T> {
  private readonly cache = new Map<string, { value: T; timestamp: number }>();
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly enabled: boolean;

  /**
   * @param ttlMs - Time-to-live in milliseconds. Pass `0` or a negative value
   *   to disable caching entirely.
   * @param maxSize - Maximum number of entries before the least-recently-used
   *   entry is evicted.
   */
  constructor(ttlMs = 1_800_000, maxSize = 500) {
    this.ttl = ttlMs;
    this.maxSize = maxSize;
    this.enabled = ttlMs > 0;
  }

  /**
   * Stores a deep-cloned copy of `value` under `key`.
   * Has no effect when the cache is disabled.
   */
  set(key: string, value: T): void {
    if (!this.enabled) {
      return;
    }

    this.cache.set(key, {
      value: structuredClone(value),
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
    if (!this.enabled) {
      return undefined;
    }

    const item = this.cache.get(key);

    if (item === undefined) {
      return undefined;
    }

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);

      return undefined;
    }

    // Move to tail = mark as most recently used
    this.cache.delete(key);
    this.cache.set(key, item);

    return structuredClone(item.value);
  }

  /**
   * Removes all entries from the cache.
   */
  clear(): void {
    this.cache.clear();
  }
}
