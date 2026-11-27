import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { mockFetch } from "./helpers/mock-fetch";
import Veganify, { ValidationError } from "../lib";

const originalFetch = globalThis.fetch;

describe("Veganify Ingredients Analysis", () => {
  let veganify: Veganify;

  beforeEach(() => {
    Veganify.resetInstance();
    veganify = Veganify.getInstance({ staging: true });
    veganify.clearCache();
    mock.clearAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    Veganify.resetInstance();
  });

  describe("checkIngredientsListV1", () => {
    it("should analyze ingredients successfully", async () => {
      const mockResponse = {
        code: "200",
        status: "success",
        message: "OK",
        data: {
          vegan: true,
          surely_vegan: ["water"],
          not_vegan: [],
          maybe_not_vegan: [],
          unknown: [],
        },
      };

      globalThis.fetch = mockFetch().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await veganify.checkIngredientsListV1("water,salt");
      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError for empty ingredients", async () => {
      await expect(veganify.checkIngredientsListV1("")).rejects.toThrow(
        ValidationError,
      );
    });

    it("should handle various ingredient combinations", async () => {
      const testCases = [
        { input: "water,sugar", vegan: true, surely_vegan: ["water", "sugar"] },
        { input: "milk,eggs", vegan: false, not_vegan: ["milk", "eggs"] },
        { input: "water,unknown", vegan: false, unknown: ["unknown"] },
        {
          input: "sugar,honey",
          vegan: false,
          maybe_not_vegan: ["sugar"],
          not_vegan: ["honey"],
        },
      ];

      for (const testCase of testCases) {
        const mockResponse = {
          code: "200",
          status: "success",
          message: "OK",
          data: {
            vegan: testCase.vegan,
            surely_vegan: testCase.surely_vegan ?? [],
            not_vegan: testCase.not_vegan ?? [],
            maybe_not_vegan: testCase.maybe_not_vegan ?? [],
            unknown: testCase.unknown ?? [],
          },
        };

        globalThis.fetch = mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await veganify.checkIngredientsListV1(testCase.input);
        expect(result).toEqual(mockResponse);
      }
    });

    it("should handle special characters in ingredients", async () => {
      const mockResponse = {
        code: "200",
        status: "success",
        message: "OK",
        data: {
          vegan: true,
          surely_vegan: ["ingredient"],
          not_vegan: [],
          maybe_not_vegan: [],
          unknown: [],
        },
      };

      const specialCharCases = [
        "ingredient!",
        "ingredient&",
        "ingredient#",
        "ingredient$",
      ];

      for (const input of specialCharCases) {
        globalThis.fetch = mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });

        const result = await veganify.checkIngredientsListV1(input);
        expect(result).toEqual(mockResponse);
      }
    });

    it("should handle malformed responses", async () => {
      const malformedResponses = [
        {},
        { data: null },
        { data: { vegan: "yes" } },
        { data: { vegan: true, surely_vegan: null } },
      ];

      for (const response of malformedResponses) {
        globalThis.fetch = mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(response),
        });

        await expect(
          veganify.checkIngredientsListV1("water,sugar"),
        ).rejects.toThrow(ValidationError);
      }
    });

    it("should maintain cache integrity", async () => {
      const mockResponse = {
        code: "200",
        status: "success",
        message: "OK",
        data: {
          vegan: true,
          surely_vegan: ["water"],
          not_vegan: [],
          maybe_not_vegan: [],
          unknown: [],
        },
      };

      globalThis.fetch = mockFetch().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result1 = await veganify.checkIngredientsListV1("water");
      result1.data.vegan = false;
      const result2 = await veganify.checkIngredientsListV1("water");
      expect(result2.data.vegan).toBe(true);
    });
    it("should URL-encode the ingredients path segment", async () => {
      const mockResponse = {
        code: "200",
        status: "success",
        message: "OK",
        data: {
          vegan: true,
          surely_vegan: ["water"],
          not_vegan: [],
          maybe_not_vegan: [],
          unknown: [],
        },
      };

      let capturedUrl = "";
      globalThis.fetch = mockFetch().mockImplementation((url: string) => {
        capturedUrl = url;

        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResponse),
        });
      });

      // Ingredients with characters that must be percent-encoded in a URL path
      await veganify.checkIngredientsListV1("water & salt", false);

      const urlObj = new URL(capturedUrl);
      // The path segment after /v1/ingredients/ should be percent-encoded
      expect(urlObj.pathname).not.toContain(" & ");
      expect(decodeURIComponent(urlObj.pathname)).toContain("water & salt");
    });
  });
});
