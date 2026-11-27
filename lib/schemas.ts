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
