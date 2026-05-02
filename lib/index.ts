import { z } from "zod";
import type {
  ProductResponse,
  IngredientsCheckResponseV1,
  PetaCrueltyFreeResponse,
} from "./types";
import {
  ProductResponseSchema,
  IngredientsCheckResponseV1Schema,
  PetaCrueltyFreeResponseSchema,
  VeganifyError,
  ValidationError,
  NotFoundError,
} from "./types";
import { preprocessIngredients, Cache } from "./utils";

/**
 * Configuration options for initialising a {@link Veganify} instance.
 */
interface VeganifyConfig {
  /**
   * Override the base URL of the Veganify API.
   * When omitted the value is derived from `staging`.
   */
  baseUrl?: string;
  /**
   * Cache time-to-live in milliseconds.
   * Pass `0` or a negative number to disable caching.
   * @default 1_800_000 (30 minutes)
   */
  cacheTTL?: number;
  /**
   * When `true`, requests are directed to the staging API.
   * Ignored when `baseUrl` is explicitly set.
   * @default false
   */
  staging?: boolean;
  /**
   * Request timeout in milliseconds. Requests that exceed this duration are
   * aborted and a {@link VeganifyError} with status 408 is thrown.
   * @default 10_000
   */
  timeout?: number;
  /**
   * Maximum number of entries each cache bucket may hold before the
   * least-recently-used entry is evicted.
   * @default 500
   */
  cacheMaxSize?: number;
}

/**
 * The main client for the Veganify API.
 *
 * @remarks
 * `Veganify` is a singleton — the first call to {@link Veganify.getInstance}
 * creates the instance and binds the configuration. Subsequent calls with a
 * different configuration are silently ignored and return the existing instance.
 * Use {@link Veganify.resetInstance} to tear down the singleton (e.g., between
 * tests or in server-side lifecycle hooks).
 */
class Veganify {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly productCache: Cache<ProductResponse>;
  private readonly ingredientsCache: Cache<IngredientsCheckResponseV1>;
  private readonly petaCache: Cache<PetaCrueltyFreeResponse>;
  private static instance?: Veganify;

  private constructor(config: VeganifyConfig = {}) {
    this.baseUrl =
      config.baseUrl ??
      (config.staging
        ? "https://staging.api.veganify.app"
        : "https://api.veganify.app");

    this.timeout = config.timeout ?? 10_000;

    const ttl = config.cacheTTL ?? 1_800_000; // 30 minutes default
    const maxSize = config.cacheMaxSize ?? 500;
    this.productCache = new Cache<ProductResponse>(ttl, maxSize);
    this.ingredientsCache = new Cache<IngredientsCheckResponseV1>(ttl, maxSize);
    this.petaCache = new Cache<PetaCrueltyFreeResponse>(ttl, maxSize);
  }

  /**
   * Returns the shared {@link Veganify} instance, creating it on the first call.
   *
   * @param config - Configuration applied only during the first call.
   *   Subsequent calls with a different `config` are ignored; use
   *   {@link Veganify.resetInstance} to apply new configuration.
   */
  static getInstance(config?: VeganifyConfig): Veganify {
    if (!Veganify.instance) {
      Veganify.instance = new Veganify(config);
    }
    return Veganify.instance;
  }

  /**
   * Destroys the current singleton so the next call to {@link Veganify.getInstance}
   * creates a fresh instance with new configuration.
   *
   * @remarks
   * Primarily intended for use in tests and server-side lifecycle code where
   * multiple independent configurations must be exercised in the same process.
   */
  static resetInstance(): void {
    Veganify.instance = undefined;
  }

  private async fetchWithValidation<T>(
    url: string,
    schema: z.ZodType<T>,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
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
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "TimeoutError")
      ) {
        throw new VeganifyError("Request timed out", 408, error);
      }
      if (error instanceof z.ZodError) {
        throw new ValidationError("Invalid response format", error);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Fetches product information by barcode from the Veganify API.
   *
   * @param barcode - A numeric barcode string (digits only).
   * @returns Parsed {@link ProductResponse} for the given barcode.
   * @throws {@link ValidationError} when `barcode` contains non-digit characters.
   * @throws {@link NotFoundError} when the API returns 404.
   * @throws {@link VeganifyError} for all other API or network errors.
   */
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

  /**
   * Checks a comma-separated list of ingredients against the Veganify
   * Ingredients API (v1).
   *
   * @param ingredientsList - A string containing ingredient names, separated
   *   by commas (and optionally other delimiters when `preprocessed` is `true`).
   * @param preprocessed - When `true` (default) the list is normalised via
   *   {@link preprocessIngredients} before the request is sent. Pass `false`
   *   to send the raw comma-split values.
   * @returns Parsed {@link IngredientsCheckResponseV1}.
   * @throws {@link ValidationError} when no valid ingredients can be extracted.
   * @throws {@link VeganifyError} for network or API errors.
   */
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

    const url = `${this.baseUrl}/v1/ingredients/${encodeURIComponent(ingredientsString)}`;
    const result = await this.fetchWithValidation(
      url,
      IngredientsCheckResponseV1Schema
    );

    this.ingredientsCache.set(cacheKey, result);
    return result;
  }

  /**
   * Fetches the full list of PETA-certified cruelty-free brands.
   *
   * @returns Parsed {@link PetaCrueltyFreeResponse}.
   * @throws {@link VeganifyError} for network or API errors.
   */
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

  /**
   * Clears all in-memory caches (products, ingredients, PETA brands).
   *
   * @remarks
   * Does not affect in-flight requests. Subsequent calls will hit the network
   * until the caches are repopulated.
   */
  clearCache(): void {
    this.productCache.clear();
    this.ingredientsCache.clear();
    this.petaCache.clear();
  }
}

export default Veganify;
export * from "./types";
export { preprocessIngredients };
