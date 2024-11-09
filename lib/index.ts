import { z } from "zod";
import {
  ProductResponse,
  IngredientsCheckResponseV1,
  PetaCrueltyFreeResponse,
  ProductResponseSchema,
  IngredientsCheckResponseV1Schema,
  PetaCrueltyFreeResponseSchema,
  VeganifyError,
  ValidationError,
  NotFoundError,
} from "./types";
import { preprocessIngredients, Cache } from "./utils";

interface VeganifyConfig {
  baseUrl?: string;
  cacheTTL?: number;
  staging?: boolean;
}

class Veganify {
  private readonly baseUrl: string;
  private readonly productCache: Cache<ProductResponse>;
  private readonly ingredientsCache: Cache<IngredientsCheckResponseV1>;
  private readonly petaCache: Cache<PetaCrueltyFreeResponse>;
  private static instance: Veganify;

  private constructor(config: VeganifyConfig = {}) {
    this.baseUrl = config.staging
      ? "https://staging.api.veganify.app"
      : "https://api.veganify.app";

    const ttl = config.cacheTTL ?? 1800000; // 30 minutes default
    this.productCache = new Cache<ProductResponse>(ttl);
    this.ingredientsCache = new Cache<IngredientsCheckResponseV1>(ttl);
    this.petaCache = new Cache<PetaCrueltyFreeResponse>(ttl);
  }

  static getInstance(config?: VeganifyConfig): Veganify {
    if (!Veganify.instance) {
      Veganify.instance = new Veganify(config);
    }
    return Veganify.instance;
  }

  private async fetchWithValidation<T>(
    url: string,
    schema: z.ZodType<T>,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          ...options.headers,
        },
      });

      if (!response.ok) {
        switch (response.status) {
          case 404:
            throw new NotFoundError("Resource not found");
          case 400:
            throw new ValidationError("Invalid request");
          default:
            throw new VeganifyError(
              `HTTP error ${response.status}`,
              response.status
            );
        }
      }

      const data = await response.json();
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError("Invalid response format", error);
      }
      throw error;
    }
  }

  async getProductByBarcode(barcode: string): Promise<ProductResponse> {
    if (!/^\d+$/.test(barcode)) {
      throw new ValidationError("Invalid barcode format");
    }

    const cacheKey = `product:${barcode}`;
    const cached = this.productCache.get(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/v0/product/${barcode}`;
    const result = await this.fetchWithValidation(url, ProductResponseSchema, {
      method: "POST",
    });

    this.productCache.set(cacheKey, result);
    return result;
  }

  async checkIngredientsListV1(
    ingredientsList: string,
    preprocessed: boolean = true
  ): Promise<IngredientsCheckResponseV1> {
    const ingredients = preprocessed
      ? preprocessIngredients(ingredientsList)
      : ingredientsList.split(",");
    if (ingredients.length === 0) {
      throw new ValidationError("No valid ingredients provided");
    }

    const ingredientsString = ingredients.join(",");
    const cacheKey = `ingredients:${ingredientsString}`;
    const cached = this.ingredientsCache.get(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/v1/ingredients/${ingredientsString}`;
    const result = await this.fetchWithValidation(
      url,
      IngredientsCheckResponseV1Schema
    );

    this.ingredientsCache.set(cacheKey, result);
    return result;
  }

  async getPetaCrueltyFreeBrands(): Promise<PetaCrueltyFreeResponse> {
    const cacheKey = "peta:crueltyfree";
    const cached = this.petaCache.get(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/v0/peta/crueltyfree`;
    const result = await this.fetchWithValidation(
      url,
      PetaCrueltyFreeResponseSchema
    );

    this.petaCache.set(cacheKey, result);
    return result;
  }

  clearCache(): void {
    this.productCache.clear();
    this.ingredientsCache.clear();
    this.petaCache.clear();
  }
}

export default Veganify;
export * from "./types";
export { preprocessIngredients };
