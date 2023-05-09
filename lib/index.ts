const API_BASE_URL = 'https://api.vegancheck.me/v0';

const VeganCheck = {
  getProductByBarcode: async (barcode: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/product/${barcode}`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw { response: { status: response.status } };
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  checkIngredientsList: async (ingredientsList: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients/${ingredientsList}`);

      if (!response.ok) {
        throw { response: { status: response.status } };
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getPetaCrueltyFreeBrands: async () => {
    try {
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

export default VeganCheck;
