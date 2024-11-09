import Veganify, { ValidationError } from "../lib";

describe("Veganify PETA Brands", () => {
  let veganify: Veganify;

  beforeEach(() => {
    veganify = Veganify.getInstance({ staging: true });
    veganify.clearCache();
    jest.clearAllMocks();
  });

  describe("getPetaCrueltyFreeBrands", () => {
    it("should fetch PETA brands successfully", async () => {
      const mockResponse = {
        LAST_UPDATE: "2024-01-01",
        ENTRIES: "100",
        PETA_DOES_NOT_TEST: ["Brand1", "Brand2"],
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
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

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
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

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
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
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: true,
          json: async () => response,
        });

        await expect(veganify.getPetaCrueltyFreeBrands()).rejects.toThrow(
          ValidationError
        );
      }
    });
  });
});
