import { describe, it, expect, afterEach } from "bun:test";
import Veganify, { createVeganify } from "../lib";
import { mockFetch } from "./helpers/mock-fetch";

const originalFetch = globalThis.fetch;

const mockProduct = {
  status: 200,
  product: { productname: "Test Product" },
  sources: { processed: true, api: "test", baseuri: "test" },
};

describe("createVeganify factory", () => {
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns independent instances that are Veganify objects", () => {
    const a = createVeganify();
    const b = createVeganify();

    expect(a).not.toBe(b);
    expect(b).not.toBe(a);
    expect(a).toBeInstanceOf(Veganify);
    expect(b).toBeInstanceOf(Veganify);
  });

  it("does not touch the singleton", () => {
    const a = createVeganify();
    const b = createVeganify();

    expect(Veganify.getInstance()).not.toBe(a);
    expect(Veganify.getInstance()).not.toBe(b);
  });

  it("uses the injected fetch instead of globalThis.fetch", async () => {
    const sentinel = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const late = mockFetch();

    globalThis.fetch = late;

    const client = createVeganify({ fetch: sentinel });

    await client.getProductByBarcode("4066600204404");

    expect(sentinel).toHaveBeenCalledTimes(1);
    expect(late).not.toHaveBeenCalled();
  });

  it("honours each instance's own config", async () => {
    let capturedUrl = "";

    const fetchMock = mockFetch().mockImplementation((url: string) => {
      capturedUrl = url;

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      });
    });

    const client = new Veganify({
      baseUrl: "https://x.test",
      fetch: fetchMock,
    });

    await client.getProductByBarcode("4066600204404");

    expect(capturedUrl.startsWith("https://x.test/v0/product/")).toBe(true);
  });

  it("keeps caches per instance", async () => {
    const fetchMock = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const noCache = createVeganify({ cacheTTL: 0, fetch: fetchMock });
    const cached = createVeganify({ fetch: fetchMock });

    await noCache.getProductByBarcode("4066600204404");
    await noCache.getProductByBarcode("4066600204404");
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await cached.getProductByBarcode("4066600204404");
    await cached.getProductByBarcode("4066600204404");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("is unaffected by resetInstance()", async () => {
    const fetchMock = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    const client = createVeganify({ fetch: fetchMock });

    await client.getProductByBarcode("4066600204404");

    Veganify.resetInstance();

    await client.getProductByBarcode("4066600204404");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reads globalThis.fetch lazily for clients built without an injected fetch", async () => {
    const client = createVeganify();

    const late = mockFetch().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProduct),
    });

    globalThis.fetch = late;

    await client.getProductByBarcode("4066600204404");

    expect(late).toHaveBeenCalledTimes(1);
  });

  it("accepts the full config of the singleton path", () => {
    const client = createVeganify({
      baseUrl: "https://x.test",
      cacheTTL: 5,
      cacheMaxSize: 5,
      staging: true,
      timeout: 5,
    });

    expect(client).toBeInstanceOf(Veganify);
  });
});
