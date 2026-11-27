import { describe, it, expect } from "bun:test";
import { createVeganify, ValidationError } from "../lib";
import { mockFetch } from "./helpers/mock-fetch";

describe("Veganify PETA Brands", () => {
  describe("getPetaCrueltyFreeBrands", () => {
    it("should fetch PETA brands successfully", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "100",
        PETA_DOES_NOT_TEST: ["Brand1", "Brand2"],
      };

      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }),
      });

      const result = await client.getPetaCrueltyFreeBrands();
      expect(result).toEqual(mockResponse);
    });

    it("should handle empty brand list", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "0",
        PETA_DOES_NOT_TEST: [],
      };

      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        }),
      });

      const result = await client.getPetaCrueltyFreeBrands();
      expect(result.PETA_DOES_NOT_TEST).toHaveLength(0);
    });

    it("should cache responses", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "100",
        PETA_DOES_NOT_TEST: ["Brand1"],
      };

      const fetchMock = mockFetch().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const client = createVeganify({ staging: true, fetch: fetchMock });

      await client.getPetaCrueltyFreeBrands();
      await client.getPetaCrueltyFreeBrands();

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("should handle malformed responses", async () => {
      const malformedResponses = [
        {},
        { LAST_UPDATE: null },
        { PETA_DOES_NOT_TEST: null },
        { ENTRIES: [] },
      ];

      for (const response of malformedResponses) {
        const client = createVeganify({
          staging: true,
          fetch: mockFetch().mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(response),
          }),
        });

        await expect(client.getPetaCrueltyFreeBrands()).rejects.toThrow(
          ValidationError,
        );
      }
    });
  });
});
