import { z } from "zod";

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

export const SourceDetailsSchema = z.object({
  processed: z.boolean(),
  api: z.string(),
  baseuri: z.string(),
});

export const ProductResponseSchema = z.object({
  status: z.number(),
  product: ProductDetailsSchema,
  sources: SourceDetailsSchema,
});

export const DataDetailsV1Schema = z.object({
  vegan: z.boolean(),
  surely_vegan: z.array(z.string()),
  not_vegan: z.array(z.string()),
  maybe_not_vegan: z.array(z.string()),
  unknown: z.array(z.string()),
});

export const IngredientsCheckResponseV1Schema = z.object({
  code: z.string(),
  status: z.string(),
  message: z.string(),
  data: DataDetailsV1Schema,
});

export const PetaCrueltyFreeResponseSchema = z.object({
  LAST_UPDATE: z.string(),
  ENTRIES: z.string(),
  PETA_DOES_NOT_TEST: z.array(z.string()),
});

export type ProductDetails = z.infer<typeof ProductDetailsSchema>;
export type SourceDetails = z.infer<typeof SourceDetailsSchema>;
export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type DataDetailsV1 = z.infer<typeof DataDetailsV1Schema>;
export type IngredientsCheckResponseV1 = z.infer<
  typeof IngredientsCheckResponseV1Schema
>;
export type PetaCrueltyFreeResponse = z.infer<
  typeof PetaCrueltyFreeResponseSchema
>;

// Custom error classes
export class VeganifyError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public cause?: unknown,
  ) {
    super(message);
    this.name = "VeganifyError";
  }
}

export class ValidationError extends VeganifyError {
  constructor(message: string, cause?: unknown) {
    super(message, 400, cause);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends VeganifyError {
  constructor(message: string) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}
