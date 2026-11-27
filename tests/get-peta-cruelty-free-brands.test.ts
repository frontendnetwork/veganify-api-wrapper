import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mockFetch } from "./helpers/mock-fetch";
import Veganify, { ValidationError } from "../lib";

const originalFetch = globalThis.fetch;

describe("Veganify PETA Brands", () => {
  let veganify: Veganify;

  beforeEach(() => {
    veganify = Veganify.getInstance({ staging: true });
    veganify.clearCache();
    mock.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  describe("getPetaCrueltyFreeBrands", () => {
    it("should fetch PETA brands successfully", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "100",
        PETA_DOES_NOT_TEST: ["Brand1", "Brand2"],
      };

      globalThis.fetch = mockFetch().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await veganify.getPetaCrueltyFreeBrands();
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty brand list", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "0",
        PETA_DOES_NOT_TEST: [],
      };

      globalThis.fetch = mockFetch().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await veganify.getPetaCrueltyFreeBrands();
      expect(result.PETA_DOES_NOT_TEST).toHaveLength(0);
    });

    it("should cache responses", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "100",
        PETA_DOES_NOT_TEST: ["Brand1"],
      };

      globalThis.fetch = mockFetch().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await veganify.getPetaCrueltyFreeBrands();
      await veganify.getPetaCrueltyFreeBrands();

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it("should handle malformed responses", async () => {
      const malformedResponses = [
        {},
        { LAST_UPDATE: null },
        { PETA_DOES_NOT_TEST: null },
        { ENTRIES: [] },
      ];

      for (const response of malformedResponses) {
        globalThis.fetch = mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        });

        await expect(veganify.getPetaCrueltyFreeBrands()).rejects.toThrow(
          ValidationError,
        );
      }
    });
  });
});
