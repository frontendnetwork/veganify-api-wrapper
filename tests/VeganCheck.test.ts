import Veganify from "../lib/index.js";

describe("Veganify API Wrapper", () => {
  describe("getProductByBarcode", () => {
    test("returns product information", async () => {
      const barcode = "4066600204404";
      const productInfo = await Veganify.getProductByBarcode(barcode);
      expect(productInfo).toBeDefined();
      expect(productInfo).toHaveProperty("product.productname");
    });

    test("returns 404 on unknown barcode", async () => {
      const barcode = "01010";
      await expect(Veganify.getProductByBarcode(barcode)).rejects.toEqual({
        response: { status: 404 },
      });
    }, 15000);

    test("uses staging URL when staging flag is true", async () => {
      const barcode = "4066600204404";
      const productInfo = await Veganify.getProductByBarcode(barcode, true);
      expect(productInfo).toBeDefined();
      expect(productInfo).toHaveProperty("product.productname");
    });
  });

  describe("checkIngredientsList", () => {
    test("returns information about ingredients (vegan)", async () => {
      const ingredientsList = "water, sugar, salt";
      const ingredientsInfo = await Veganify.checkIngredientsList(
        ingredientsList
      );
      expect(ingredientsInfo).toBeDefined();
      expect(ingredientsInfo.data.vegan).toBe(true);
    });

    test("returns information about ingredients (non-vegan)", async () => {
      const ingredientsList = "water, sugar, salt, duck";
      const ingredientsInfo = await Veganify.checkIngredientsList(
        ingredientsList
      );
      expect(ingredientsInfo).toBeDefined();
      expect(ingredientsInfo.data.vegan).toBe(false);
      expect(ingredientsInfo.data.flagged).toContain("duck");
    });

    test("returns 400 on bad request", async () => {
      const ingredientsList = "&/%";
      await expect(
        Veganify.checkIngredientsList(ingredientsList)
      ).rejects.toEqual({
        response: { status: 400 },
      });
    });

    test("uses staging URL when staging flag is true", async () => {
      const ingredientsList = "water, sugar";
      const ingredientsInfo = await Veganify.checkIngredientsList(
        ingredientsList,
        true
      );
      expect(ingredientsInfo).toBeDefined();
      expect(ingredientsInfo.data.vegan).toBe(true);
    });
  });

  describe("getPetaCrueltyFreeBrands", () => {
    test("returns a list of cruelty-free brands", async () => {
      const brands = await Veganify.getPetaCrueltyFreeBrands();
      expect(brands).toBeDefined();
      expect(brands.PETA_DOES_NOT_TEST).toContain("_SkinLabo");
    });

    test("uses staging URL when staging flag is true", async () => {
      const brands = await Veganify.getPetaCrueltyFreeBrands(true);
      expect(brands).toBeDefined();
      expect(brands.PETA_DOES_NOT_TEST).toContain("_SkinLabo");
    });
  });
});
