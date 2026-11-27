import { describe, it, expect } from "bun:test";
import { createVeganify } from "../lib";
import { Cache } from "../lib/cache";
import { mockFetch } from "./helpers/mock-fetch";

const mockProduct = {
  status: 200,
  product: { productname: "Test Product" },
  sources: { processed: true, api: "test", baseuri: "test" },
};

describe("Veganify Cache Behavior", () => {
  it("should disable cache when TTL is 0", async () => {
    const fetchMock = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const veganifyNoCache = createVeganify({ cacheTTL: 0, fetch: fetchMock });

    await veganifyNoCache.getProductByBarcode("4066600204404");
    await veganifyNoCache.getProductByBarcode("4066600204404");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("should disable cache when TTL is negative", async () => {
    const fetchMock = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const veganifyNoCache = createVeganify({ cacheTTL: -1, fetch: fetchMock });

    await veganifyNoCache.getProductByBarcode("4066600204404");
    await veganifyNoCache.getProductByBarcode("4066600204404");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("should expire cache after TTL", async () => {
    const fetchMock = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    // 100ms TTL
    const veganifyShortCache = createVeganify({
      cacheTTL: 100,
      fetch: fetchMock,
    });

    await veganifyShortCache.getProductByBarcode("4066600204404");

    // Wait for cache to expire
    await Bun.sleep(150);

    await veganifyShortCache.getProductByBarcode("4066600204404");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("should handle cache clear", async () => {
    const fetchMock = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const veganify = createVeganify({ cacheTTL: 1000, fetch: fetchMock });

    await veganify.getProductByBarcode("4066600204404");
    veganify.clearCache();
    await veganify.getProductByBarcode("4066600204404");

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("should evict least-recently-used entry when maxSize is exceeded", () => {
    const cache = new Cache<string>(60_000, 2);

    cache.set("a", "alpha");
    cache.set("b", "beta");
    // Access 'a' so it becomes most-recently-used
    cache.get("a");
    // Insert 'c' — should evict 'b' (LRU), not 'a'
    cache.set("c", "gamma");

    expect(cache.get("a")).toBe("alpha");
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe("gamma");
  });
});
