import Veganify, {
  ValidationError,
  NotFoundError,
  VeganifyError,
} from "../lib";

describe("Veganify Product Lookup", () => {
  let veganify: Veganify;

  beforeEach(() => {
    veganify = Veganify.getInstance({ staging: true });
    veganify.clearCache();
    jest.clearAllMocks();
  });

  describe("getProductByBarcode", () => {
    it("should fetch product information successfully", async () => {
      const mockProduct = {
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

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

      const result = await veganify.getProductByBarcode("4066600204404");
      expect(result).toEqual(mockProduct);
    });

    it("should handle product with all possible fields", async () => {
      const mockProduct = {
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

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

      const result = await veganify.getProductByBarcode("4066600204404");
      expect(result).toEqual(mockProduct);
    });

    it("should handle product with minimal fields", async () => {
      const mockProduct = {
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

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

      const result = await veganify.getProductByBarcode("4066600204404");
      expect(result).toEqual(mockProduct);
    });

    it("should handle various barcode formats", async () => {
      const mockProduct = {
        status: 200,
        product: { productname: "Test" },
        sources: { processed: true, api: "test", baseuri: "test" },
      };

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

      await expect(veganify.getProductByBarcode("123")).resolves.toBeDefined();
      await expect(veganify.getProductByBarcode("abc")).rejects.toThrow(
        ValidationError
      );
      await expect(veganify.getProductByBarcode("12.34")).rejects.toThrow(
        ValidationError
      );
      await expect(veganify.getProductByBarcode("")).rejects.toThrow(
        ValidationError
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
        global.fetch = jest.fn().mockResolvedValueOnce({
          ok: false,
          status,
        });

        await expect(
          veganify.getProductByBarcode("4066600204404")
        ).rejects.toThrow(error);
      }
    });

    it("should handle network errors", async () => {
      global.fetch = jest
        .fn()
        .mockRejectedValueOnce(new Error("Network error"));

      await expect(
        veganify.getProductByBarcode("4066600204404")
      ).rejects.toThrow("Network error");
    });

    it("should handle invalid JSON responses", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(
        veganify.getProductByBarcode("4066600204404")
      ).rejects.toThrow();
    });

    it("should throw ValidationError for invalid barcode", async () => {
      await expect(veganify.getProductByBarcode("invalid")).rejects.toThrow(
        ValidationError
      );
    });

    it("should throw NotFoundError for non-existent product", async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await expect(
        veganify.getProductByBarcode("0000000000000")
      ).rejects.toThrow(NotFoundError);
    });

    it("should use cache for subsequent requests", async () => {
      const mockProduct = {
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

      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduct,
      });

      await veganify.getProductByBarcode("4066600204404");
      await veganify.getProductByBarcode("4066600204404");

      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });
});
