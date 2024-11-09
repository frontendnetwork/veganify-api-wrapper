import { preprocessIngredients } from "../lib";

describe("preprocessIngredients", () => {
  it("should clean and normalize ingredients", () => {
    const input = "water 100%, sugar (organic), salt:, milk powder (10%)";
    const expected = ["water", "sugar", "organic", "salt", "milk powder"];
    expect(preprocessIngredients(input)).toEqual(expected);
  });

  it("should handle empty input", () => {
    expect(preprocessIngredients("")).toEqual([]);
    expect(preprocessIngredients(" ")).toEqual([]);
  });

  it("should remove duplicates", () => {
    const input = "sugar, sugar, organic sugar";
    expect(preprocessIngredients(input)).toEqual(["sugar", "organic sugar"]);
  });

  it("should handle various number formats", () => {
    const inputs = [
      "sugar 100%",
      "sugar 100.5%",
      "sugar(100)",
      "sugar (100.5)",
    ];

    inputs.forEach((input) => {
      expect(preprocessIngredients(input)).toEqual(["sugar"]);
    });
  });

  it("should handle nested parentheses", () => {
    const input = "sugar (organic (raw))";
    expect(preprocessIngredients(input)).toEqual(["sugar", "organic (raw)"]);
  });

  it("should handle multiple delimiters", () => {
    const input = "sugar:salt,pepper;water|spice";
    expect(preprocessIngredients(input)).toEqual([
      "sugar",
      "salt",
      "pepper",
      "water",
      "spice",
    ]);
  });

  it("should handle whitespace variations", () => {
    const input = "salt\tpepper\n\rwater";
    expect(preprocessIngredients(input)).toEqual(["salt", "pepper", "water"]);
  });

  it("should handle edge cases in duplicates", () => {
    const testCases = [
      {
        input: "organic sugar, sugar, raw sugar",
        expected: ["organic sugar", "sugar", "raw sugar"],
      },
      {
        input: "sugar, sugarcane, sugar extract",
        expected: ["sugar", "sugarcane", "sugar extract"],
      },
      {
        input: "water, mineral water, sparkling water",
        expected: ["water", "mineral water", "sparkling water"],
      },
    ];

    testCases.forEach(({ input, expected }) => {
      expect(preprocessIngredients(input)).toEqual(expected);
    });
  });

  it("should handle invalid inputs", () => {
    const invalidInputs = [undefined, null, 123, {}, [], new Date()];
    invalidInputs.forEach((input) => {
      expect(preprocessIngredients(input as string)).toEqual([]);
    });
  });

  it("should handle ingredients with multiple words", () => {
    const input = "red bell pepper, extra virgin olive oil, sea salt";
    expect(preprocessIngredients(input)).toEqual([
      "red bell pepper",
      "extra virgin olive oil",
      "sea salt",
    ]);
  });
});
