import { describe, it, expect } from "bun:test";
import { mockFetch } from "./helpers/mock-fetch";
import {
  createVeganify,
  ValidationError,
  NotFoundError,
  VeganifyError,
} from "../lib";

import type { ProductResponse } from "../lib";

describe("Veganify Product Lookup", () => {
  describe("getProductByBarcode", () => {
    it("should fetch product information successfully", async () => {
      const mockProduct: ProductResponse = {
        status: 200,
        product: {
          productname: "Test Product",
          vegan: true,
        },
        sources: {
          processed: true,
          api: "test",
          baseuri: "test",
        },
      };

      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        }),
      });

      const result = await client.getProductByBarcode("4066600204404");
      expect(result).toEqual(mockProduct);
    });

    it("should handle product with all possible fields", async () => {
      const mockProduct: ProductResponse = {
        status: 200,
        product: {
          productname: "Complete Product",
          genericname: "Generic Name",
          vegan: true,
          vegetarian: true,
          animaltestfree: false,
          palmoil: "n/a",
          nutriscore: "A",
          grade: "1",
        },
        sources: {
          processed: true,
          api: "test",
          baseuri: "test",
        },
      };

      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        }),
      });

      const result = await client.getProductByBarcode("4066600204404");
      expect(result).toEqual(mockProduct);
    });

    it("should handle product with minimal fields", async () => {
      const mockProduct: ProductResponse = {
        status: 200,
        product: {
          productname: "Minimal Product",
        },
        sources: {
          processed: true,
          api: "test",
          baseuri: "test",
        },
      };

      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        }),
      });

      const result = await client.getProductByBarcode("4066600204404");
      expect(result).toEqual(mockProduct);
    });

    it("should handle various barcode formats", async () => {
      const mockProduct: ProductResponse = {
        status: 200,
        product: { productname: "Test" },
        sources: { processed: true, api: "test", baseuri: "test" },
      };

      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockProduct),
        }),
      });

      await expect(client.getProductByBarcode("123")).resolves.toBeDefined();
      await expect(client.getProductByBarcode("abc")).rejects.toThrow(
        ValidationError,
      );
      await expect(client.getProductByBarcode("12.34")).rejects.toThrow(
        ValidationError,
      );
      await expect(client.getProductByBarcode("")).rejects.toThrow(
        ValidationError,
      );
    });

    it("should handle various HTTP errors", async () => {
      const errorCases = [
        { status: 400, error: ValidationError },
        { status: 404, error: NotFoundError },
        { status: 500, error: VeganifyError },
        { status: 503, error: VeganifyError },
      ];

      for (const { status, error } of errorCases) {
        const client = createVeganify({
          staging: true,
          fetch: mockFetch().mockResolvedValueOnce({
            ok: false,
            status,
          }),
        });

        await expect(
          client.getProductByBarcode("4066600204404"),
        ).rejects.toThrow(error);
      }
    });

    it("should handle network errors", async () => {
      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockRejectedValueOnce(new Error("Network error")),
      });

      await expect(client.getProductByBarcode("4066600204404")).rejects.toThrow(
        "Network error",
      );
    });

    it("should handle invalid JSON responses", async () => {
      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: true,
          json: () => Promise.reject(new Error("Invalid JSON")),
        }),
      });

      await expect(
        client.getProductByBarcode("4066600204404"),
      ).rejects.toThrow();
    });

    it("should throw ValidationError for invalid barcode", async () => {
      const client = createVeganify({ staging: true, fetch: mockFetch() });

      await expect(client.getProductByBarcode("invalid")).rejects.toThrow(
        ValidationError,
      );
    });

    it("should throw NotFoundError for non-existent product", async () => {
      const client = createVeganify({
        staging: true,
        fetch: mockFetch().mockResolvedValueOnce({
          ok: false,
          status: 404,
        }),
      });

      await expect(client.getProductByBarcode("0000000000000")).rejects.toThrow(
        NotFoundError,
      );
    });

    it("should use cache for subsequent requests", async () => {
      const mockProduct: ProductResponse = {
        status: 200,
        product: {
          productname: "Test Product",
          vegan: true,
        },
        sources: {
          processed: true,
          api: "test",
          baseuri: "test",
        },
      };

      const fetchMock = mockFetch().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockProduct),
      });

      const client = createVeganify({ staging: true, fetch: fetchMock });

      await client.getProductByBarcode("4066600204404");
      await client.getProductByBarcode("4066600204404");

      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
});
