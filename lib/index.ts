import {
  ProductResponse,
  IngredientsCheckResponse,
  PetaCrueltyFreeResponse,
  ErrorResponse,
} from "./interfaces.js";
import fetch from "node-fetch";

const PRODUCTION_API_BASE_URL = "https://api.veganify.app/v0";
const STAGING_API_BASE_URL = "https://staging.api.veganify.app/v0";

const getApiBaseUrl = (staging?: boolean): string => {
  return staging ? STAGING_API_BASE_URL : PRODUCTION_API_BASE_URL;
};

const Veganify = {
  getProductByBarcode: async (
    barcode: string,
    staging?: boolean
  ): Promise<ProductResponse | ErrorResponse> => {
    const API_BASE_URL = getApiBaseUrl(staging);
    const response = await fetch(`${API_BASE_URL}/product/${barcode}`, {
      method: "POST",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as ProductResponse | ErrorResponse;
  },

  checkIngredientsList: async (
    ingredientsList: string,
    staging?: boolean
  ): Promise<IngredientsCheckResponse> => {
    const API_BASE_URL = getApiBaseUrl(staging);
    const response = await fetch(
      `${API_BASE_URL}/ingredients/${ingredientsList}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as IngredientsCheckResponse;
  },

  getPetaCrueltyFreeBrands: async (
    staging?: boolean
  ): Promise<PetaCrueltyFreeResponse> => {
    const API_BASE_URL = getApiBaseUrl(staging);
    const response = await fetch(`${API_BASE_URL}/peta/crueltyfree`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as PetaCrueltyFreeResponse;
  },
};

export default Veganify;
