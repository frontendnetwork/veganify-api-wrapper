import Veganify from "../lib";

const mockProduct = {
  status: 200,
  product: { productname: "Test Product" },
  sources: { processed: true, api: "test", baseuri: "test" },
};

describe("Veganify Cache Behavior", () => {
  beforeEach(() => {
    Veganify.resetInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    Veganify.resetInstance();
  });

  it("should disable cache when TTL is 0", async () => {
    const veganifyNoCache = Veganify.getInstance({ cacheTTL: 0 });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockProduct })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProduct });

    await veganifyNoCache.getProductByBarcode("4066600204404");
    await veganifyNoCache.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should disable cache when TTL is negative", async () => {
    const veganifyNoCache = Veganify.getInstance({ cacheTTL: -1 });

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockProduct })
      .mockResolvedValueOnce({ ok: true, json: async () => mockProduct });

    await veganifyNoCache.getProductByBarcode("4066600204404");
    await veganifyNoCache.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should expire cache after TTL", async () => {
    const veganifyShortCache = Veganify.getInstance({ cacheTTL: 100 }); // 100ms TTL

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    });

    await veganifyShortCache.getProductByBarcode("4066600204404");

    // Wait for cache to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    await veganifyShortCache.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should handle cache clear", async () => {
    const veganify = Veganify.getInstance({ cacheTTL: 1000 });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    });

    await veganify.getProductByBarcode("4066600204404");
    veganify.clearCache();
    await veganify.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("should evict least-recently-used entry when maxSize is exceeded", async () => {
    const Cache = (await import("../lib/utils")).Cache;
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
