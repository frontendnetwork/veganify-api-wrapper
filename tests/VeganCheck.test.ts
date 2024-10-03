import Veganify from "../lib/index.js";

describe("Veganify API Wrapper", () => {
  test("getProductByBarcode returns product information", async () => {
    const barcode = "4066600204404";
    const productInfo = await Veganify.getProductByBarcode(barcode);
    expect(productInfo).toBeDefined();
    expect(productInfo).toHaveProperty("product.productname");
  });

  test("getProductByBarcode returns 404 on unknown barcode", async () => {
    const barcode = "01010";
    await expect(Veganify.getProductByBarcode(barcode)).rejects.toThrow(Error);
    await expect(Veganify.getProductByBarcode(barcode)).rejects.toThrow(
      new Error("HTTP error! status: 404")
    );
  }, 15000);

  test.skip("getProductByBarcode returns 400 on bad request", async () => {
    const barcode = "thisisnotabarcode";
    await expect(Veganify.getProductByBarcode(barcode)).rejects.toThrow();
  });

  test("checkIngredientsList returns information about ingredients (vegan)", async () => {
    const ingredientsList = "water, sugar, salt";
    const ingredientsInfo = await Veganify.checkIngredientsList(
      ingredientsList
    );
    expect(ingredientsInfo).toBeDefined();
    expect(ingredientsInfo.data.vegan).toBe(true);
  });

  test("checkIngredientsList returns information about ingredients (non-vegan)", async () => {
    const ingredientsList = "water, sugar, salt, duck";
    const ingredientsInfo = await Veganify.checkIngredientsList(
      ingredientsList
    );
    expect(ingredientsInfo).toBeDefined();
    expect(ingredientsInfo.data.vegan).toBe(false);
    expect(ingredientsInfo.data.flagged).toContain("duck");
  });

  test("checkIngredientsList returns 400 on bad request", async () => {
    const ingredientsList = "&/%";
    await expect(
      Veganify.checkIngredientsList(ingredientsList)
    ).rejects.toThrow();
  });

  test("getPetaCrueltyFreeBrands returns a list of cruelty-free brands", async () => {
    const brands = await Veganify.getPetaCrueltyFreeBrands();
    expect(brands).toBeDefined();
    expect(brands.PETA_DOES_NOT_TEST).toContain("_SkinLabo");
  });
});
