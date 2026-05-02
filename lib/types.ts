import { z } from "zod";

/** Schema for product details returned by the Veganify product endpoint. */
export const ProductDetailsSchema = z.object({
  productname: z.string(),
  genericname: z.string().optional(),
  vegan: z.union([z.boolean(), z.literal("n/a")]).optional(),
  vegetarian: z.union([z.boolean(), z.literal("n/a")]).optional(),
  animaltestfree: z.union([z.boolean(), z.literal("n/a")]).optional(),
  palmoil: z.union([z.boolean(), z.literal("n/a")]).optional(),
  nutriscore: z.string().optional(),
  grade: z.string().optional(),
});

/** Schema for the data source metadata in a product response. */
export const SourceDetailsSchema = z.object({
  processed: z.boolean(),
  api: z.string(),
  baseuri: z.string(),
});

/** Schema for the full product response envelope. */
export const ProductResponseSchema = z.object({
  status: z.number(),
  product: ProductDetailsSchema,
  sources: SourceDetailsSchema,
});

/** Schema for the per-ingredient vegan classification data in v1 responses. */
export const DataDetailsV1Schema = z.object({
  vegan: z.boolean(),
  surely_vegan: z.array(z.string()),
  not_vegan: z.array(z.string()),
  maybe_not_vegan: z.array(z.string()),
  unknown: z.array(z.string()),
});

/** Schema for the full v1 ingredients check response envelope. */
export const IngredientsCheckResponseV1Schema = z.object({
  code: z.string(),
  status: z.string(),
  message: z.string(),
  data: DataDetailsV1Schema,
});

/** Schema for the PETA cruelty-free brand list response. */
export const PetaCrueltyFreeResponseSchema = z.object({
  LAST_UPDATE: z.string(),
  ENTRIES: z.string(),
  PETA_DOES_NOT_TEST: z.array(z.string()),
});

/** Inferred type for product details. */
export type ProductDetails = z.infer<typeof ProductDetailsSchema>;
/** Inferred type for data source metadata. */
export type SourceDetails = z.infer<typeof SourceDetailsSchema>;
/** Inferred type for the full product response. */
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
/** Inferred type for per-ingredient vegan classification data. */
export type DataDetailsV1 = z.infer<typeof DataDetailsV1Schema>;
/** Inferred type for the full v1 ingredients check response. */
export type IngredientsCheckResponseV1 = z.infer<
  typeof IngredientsCheckResponseV1Schema
>;
/** Inferred type for the PETA cruelty-free brand list response. */
export type PetaCrueltyFreeResponse = z.infer<
  typeof PetaCrueltyFreeResponseSchema
>;

// Custom error classes

/**
 * Base error class for all errors thrown by the Veganify API client.
 *
 * @param message  Human-readable error description.
 * @param statusCode  HTTP status code associated with the error, if any.
 * @param cause  The underlying error or value that triggered this error.
 *   Forwarded to the native `Error` constructor so `error.cause` is set.
 */
export class VeganifyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "VeganifyError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the request payload or the API response fails schema validation.
 * Maps to HTTP 400.
 *
 * @param message  Human-readable description of the validation failure.
 * @param cause  The underlying {@link z.ZodError} or other triggering value.
 */
export class ValidationError extends VeganifyError {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
    this.name = "ValidationError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when the requested resource does not exist.
 * Maps to HTTP 404.
 *
 * @param message  Human-readable description of what was not found.
 */
export class NotFoundError extends VeganifyError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
