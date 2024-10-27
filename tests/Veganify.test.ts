/* eslint-disable @typescript-eslint/no-explicit-any */
import Veganify from "../lib/index";

describe("Veganify API Wrapper", () => {
  describe("Product Endpoints", () => {
    test("getProductByBarcode returns product information", async () => {
      const barcode = "4066600204404";
      const productInfo = await Veganify.getProductByBarcode(barcode);
      expect(productInfo).toBeDefined();
      if ("status" in productInfo) {
        expect(productInfo.status).toBe(200);
      }
      if ("product" in productInfo) {
        expect(productInfo.product).toHaveProperty("productname");
      }
      if ("sources" in productInfo) {
        expect(productInfo.sources).toHaveProperty("processed");
        expect(productInfo.sources).toHaveProperty("api");
        expect(productInfo.sources).toHaveProperty("baseuri");
      }
    });

    test("getProductByBarcode returns 404 on unknown barcode", async () => {
      const barcode = "0";
      try {
        await Veganify.getProductByBarcode(barcode);
      } catch (error: any) {
        expect(error).toHaveProperty("response.status", 404);
      }
    });

    test.skip("getProductByBarcode returns 400 on bad request", async () => {
      const barcode = "thisisnotabarcode";
      try {
        await Veganify.getProductByBarcode(barcode);
        fail("Expected error was not thrown");
      } catch (error: any) {
        expect(error).toHaveProperty("response.status", 400);
      }
    });
  });

  describe("Ingredients Endpoints", () => {
    describe("v0 Endpoints", () => {
      test("checkIngredientsList returns information about ingredients (vegan)", async () => {
        const ingredientsList = "water,sugar,salt";
        const ingredientsInfo = await Veganify.checkIngredientsList(
          ingredientsList
        );

        expect(ingredientsInfo).toBeDefined();
        expect(ingredientsInfo).toHaveProperty("code");
        expect(ingredientsInfo).toHaveProperty("status");
        expect(ingredientsInfo).toHaveProperty("message");
        expect(ingredientsInfo.data).toHaveProperty("vegan", true);
        expect(Array.isArray(ingredientsInfo.data.surely_vegan)).toBe(true);
        expect(Array.isArray(ingredientsInfo.data.not_vegan)).toBe(true);
        expect(Array.isArray(ingredientsInfo.data.maybe_vegan)).toBe(true);
      });

      test("checkIngredientsList returns information about ingredients (non-vegan)", async () => {
        const ingredientsList = "water,sugar,salt,milk";
        const ingredientsInfo = await Veganify.checkIngredientsList(
          ingredientsList
        );

        expect(ingredientsInfo).toBeDefined();
        expect(ingredientsInfo.data).toHaveProperty("vegan", false);
        expect(ingredientsInfo.data.not_vegan).toContain("milk");
      });

      test("checkIngredientsList returns 400 on bad request", async () => {
        const ingredientsList = "&/%";
        try {
          await Veganify.checkIngredientsList(ingredientsList);
          fail("Expected error was not thrown");
        } catch (error: any) {
          expect(error).toHaveProperty("response.status", 400);
        }
      });
    });

    describe("v1 Endpoints", () => {
      test("checkIngredientsListV1 returns information about ingredients (vegan)", async () => {
        const ingredientsList = "water,tofu,salt";
        const ingredientsInfo = await Veganify.checkIngredientsListV1(
          ingredientsList
        );

        expect(ingredientsInfo).toBeDefined();
        expect(ingredientsInfo).toHaveProperty("code");
        expect(ingredientsInfo).toHaveProperty("status");
        expect(ingredientsInfo).toHaveProperty("message");
        expect(ingredientsInfo.data).toHaveProperty("vegan", true);
        expect(Array.isArray(ingredientsInfo.data.surely_vegan)).toBe(true);
        expect(Array.isArray(ingredientsInfo.data.not_vegan)).toBe(true);
        expect(Array.isArray(ingredientsInfo.data.maybe_not_vegan)).toBe(true);
        expect(Array.isArray(ingredientsInfo.data.unknown)).toBe(true);
      });

      test("checkIngredientsListV1 returns information about ingredients (maybe not vegan)", async () => {
        const ingredientsList = "water,sugar,salt";
        const ingredientsInfo = await Veganify.checkIngredientsListV1(
          ingredientsList
        );

        expect(ingredientsInfo).toBeDefined();
        expect(ingredientsInfo.data).toHaveProperty("vegan", false);
        expect(ingredientsInfo.data.maybe_not_vegan).toContain("sugar");
      });

      test("checkIngredientsListV1 returns information about ingredients (non-vegan)", async () => {
        const ingredientsList = "water,sugar,salt,milk";
        const ingredientsInfo = await Veganify.checkIngredientsListV1(
          ingredientsList
        );

        expect(ingredientsInfo).toBeDefined();
        expect(ingredientsInfo.data).toHaveProperty("vegan", false);
        expect(ingredientsInfo.data.not_vegan).toContain("milk");
      });

      test("checkIngredientsListV1 returns 400 on bad request", async () => {
        const ingredientsList = "&/%";
        try {
          await Veganify.checkIngredientsListV1(ingredientsList);
          fail("Expected error was not thrown");
        } catch (error: any) {
          expect(error).toHaveProperty("response.status", 400);
        }
      });
    });
  });

  describe("PETA Endpoints", () => {
    test("getPetaCrueltyFreeBrands returns a list of cruelty-free brands", async () => {
      const response = await Veganify.getPetaCrueltyFreeBrands();

      expect(response).toBeDefined();
      expect(response).toHaveProperty("LAST_UPDATE");
      expect(response).toHaveProperty("ENTRIES");
      expect(response).toHaveProperty("PETA_DOES_NOT_TEST");
      expect(Array.isArray(response.PETA_DOES_NOT_TEST)).toBe(true);
      expect(response.PETA_DOES_NOT_TEST).toContain("_SkinLabo");
    });
  });
});
