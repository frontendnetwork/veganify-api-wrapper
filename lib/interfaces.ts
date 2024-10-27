export interface ErrorResponse {
  status: number;
  error: string;
}

export interface ProductResponse {
  status: number;
  product: ProductDetails;
  sources: SourceDetails;
}

export interface ProductDetails {
  productname: string;
  genericname?: string;
  vegan: boolean | "n/a" | undefined;
  vegetarian: boolean | "n/a" | undefined;
  animaltestfree: boolean | "n/a" | undefined;
  palmoil: boolean | "n/a" | undefined;
  nutriscore?: string;
  grade?: string;
}

export interface SourceDetails {
  processed: boolean;
  api: string;
  baseuri: string;
}

export interface IngredientsCheckResponse {
  code: string;
  status: string;
  message: string;
  data: DataDetails;
}

export interface IngredientsCheckResponseV1 {
  code: string;
  status: string;
  message: string;
  data: DataDetailsV1;
}

export interface DataDetailsV1 {
  vegan: boolean;
  surely_vegan: string[];
  not_vegan: string[];
  maybe_not_vegan: string[];
  unknown: string[];
}

export interface DataDetails {
  vegan: boolean;
  surely_vegan: string[];
  not_vegan: string[];
  maybe_vegan: string[];
}

export interface PetaCrueltyFreeResponse {
  LAST_UPDATE: string;
  ENTRIES: string;
  PETA_DOES_NOT_TEST: string[];
}
