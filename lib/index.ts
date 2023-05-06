import axios from 'axios';

const API_BASE_URL = 'https://api.vegancheck.me/v0';

const VeganCheck = {
  getProductByBarcode: async (barcode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/product/${barcode}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkIngredientsList: async (ingredientsList) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ingredients/${ingredientsList}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPetaCrueltyFreeBrands: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/peta/crueltyfree`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default VeganCheck;
