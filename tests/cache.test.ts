import Veganify from "../lib";

describe("Veganify Cache Behavior", () => {
  let veganify: Veganify;

  beforeEach(() => {
    veganify = Veganify.getInstance({ staging: true });
    veganify.clearCache();
    jest.clearAllMocks();
  });

  it("should disable cache when TTL is 0", async () => {
    const veganifyNoCache = Veganify.getInstance({ cacheTTL: 0 });
    const mockProduct = {
      status: 200,
      product: { productname: "Test Product" },
      sources: { processed: true, api: "test", baseuri: "test" },
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

    await veganifyNoCache.getProductByBarcode("4066600204404");
    await veganifyNoCache.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should disable cache when TTL is negative", async () => {
    const veganifyNoCache = Veganify.getInstance({ cacheTTL: -1 });
    const mockProduct = {
      status: 200,
      product: { productname: "Test Product" },
      sources: { processed: true, api: "test", baseuri: "test" },
    };

    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

    await veganifyNoCache.getProductByBarcode("4066600204404");
    await veganifyNoCache.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should expire cache after TTL", async () => {
    const veganifyShortCache = Veganify.getInstance({ cacheTTL: 100 }); // 100ms TTL
    const mockProduct = {
      status: 200,
      product: { productname: "Test Product" },
      sources: { processed: true, api: "test", baseuri: "test" },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    });

    await veganifyShortCache.getProductByBarcode("4066600204404");

    // Wait for cache to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    await veganifyShortCache.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("should handle cache clear", async () => {
    const veganify = Veganify.getInstance({ cacheTTL: 1000 });
    const mockProduct = {
      status: 200,
      product: { productname: "Test Product" },
      sources: { processed: true, api: "test", baseuri: "test" },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockProduct,
    });

    await veganify.getProductByBarcode("4066600204404");
    veganify.clearCache();
    await veganify.getProductByBarcode("4066600204404");

    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
