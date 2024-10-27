import {
  ProductResponse,
  IngredientsCheckResponse,
  PetaCrueltyFreeResponse,
  ErrorResponse,
  IngredientsCheckResponseV1,
} from "./interfaces";

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
    try {
      const API_BASE_URL = getApiBaseUrl(staging);
      const response = await fetch(`${API_BASE_URL}/product/${barcode}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw { response: { status: response.status } };
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  checkIngredientsList: async (
    ingredientsList: string,
    staging?: boolean
  ): Promise<IngredientsCheckResponse> => {
    try {
      const API_BASE_URL = getApiBaseUrl(staging);
      const response = await fetch(
        `${API_BASE_URL}/ingredients/${ingredientsList}`
      );

      if (!response.ok) {
        throw { response: { status: response.status } };
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  checkIngredientsListV1: async (
    ingredientsList: string,
    staging?: boolean
  ): Promise<IngredientsCheckResponseV1> => {
    try {
      const API_BASE_URL = staging
        ? STAGING_API_BASE_URL
        : PRODUCTION_API_BASE_URL;
      const V1_API_BASE_URL = API_BASE_URL.replace("/v0", "/v1");

      const response = await fetch(
        `${V1_API_BASE_URL}/ingredients/${ingredientsList}`
      );
      if (!response.ok) {
        throw { response: { status: response.status } };
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getPetaCrueltyFreeBrands: async (
    staging?: boolean
  ): Promise<PetaCrueltyFreeResponse> => {
    try {
      const API_BASE_URL = getApiBaseUrl(staging);
      const response = await fetch(`${API_BASE_URL}/peta/crueltyfree`);

      if (!response.ok) {
        throw { response: { status: response.status } };
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export default Veganify;
