export class Cache<T> {
  private cache: Map<string, { value: T; timestamp: number }>;
  private ttl: number;
  private enabled: boolean;

  constructor(ttlMs: number = 1800000) {
    // Default 30 minutes
    this.cache = new Map();
    this.ttl = ttlMs;
    this.enabled = ttlMs > 0;
  }

  set(key: string, value: T): void {
    if (!this.enabled) return;
    this.cache.set(key, {
      value: JSON.parse(JSON.stringify(value)),
      timestamp: Date.now(),
    });
  }

  get(key: string): T | undefined {
    if (!this.enabled) return undefined;

    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return JSON.parse(JSON.stringify(item.value));
  }

  clear(): void {
    this.cache.clear();
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

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
