import VeganCheck from "../lib/index";

describe("VeganCheck API Wrapper", () => {
  test("getProductByBarcode returns product information", async () => {
    const barcode = "4066600204404";
    const productInfo = await VeganCheck.getProductByBarcode(barcode);
    expect(productInfo).toBeDefined();
    expect(productInfo).toHaveProperty("product.productname");
  });

  test("getProductByBarcode returns 404 on unknown barcode", async () => {
    const barcode = "0";
    try {
      const productInfo = await VeganCheck.getProductByBarcode(barcode);
      expect(false).toBeTruthy();
    } catch (error) {
      expect(error).toHaveProperty("response.status", 404);
    }
  });

  test.skip("getProductByBarcode returns 400 on bad request", async () => {
    const barcode = "thisisnotabarcode";
    try {
      const productInfo = await VeganCheck.getProductByBarcode(barcode);
      expect(false).toBeTruthy();
    } catch (error) {
      expect(error).toHaveProperty("response.status", 400);
    }
  });

  test("checkIngredientsList returns information about ingredients (vegan)", async () => {
    const ingredientsList = "water, sugar, salt";
    const ingredientsInfo = await VeganCheck.checkIngredientsList(
      ingredientsList
    );
    expect(ingredientsInfo).toBeDefined();
    expect(ingredientsInfo.data.vegan).toBe(true);
  });

  test("checkIngredientsList returns information about ingredients (non-vegan)", async () => {
    const ingredientsList = "water, sugar, salt, duck";
    const ingredientsInfo = await VeganCheck.checkIngredientsList(
      ingredientsList
    );
    expect(ingredientsInfo).toBeDefined();
    expect(ingredientsInfo.data.vegan).toBe(false);
    expect(ingredientsInfo.data.flagged).toContain("duck");
  });

  test("checkIngredientsList returns 400 on bad request", async () => {
    const ingredientsList = "&/%";
    try {
      const ingredientsInfo = await VeganCheck.checkIngredientsList(
        ingredientsList
      );
      expect(false).toBeTruthy();
    } catch (error) {
      expect(error).toHaveProperty("response.status", 400);
    }
  });

  test("getPetaCrueltyFreeBrands returns a list of cruelty-free brands", async () => {
    const brands = await VeganCheck.getPetaCrueltyFreeBrands();
    expect(brands).toBeDefined();
    expect(brands.PETA_DOES_NOT_TEST).toContain("_SkinLabo");
  });
});
