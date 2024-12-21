import { api } from './api';

export const favoriteService = {
  getFavorites: async () => {
    const authData = localStorage.getItem('authData');
    if (!authData) {
      throw new Error('User not authenticated');
    }
    const userId = JSON.parse(authData).userId;
    
    try {
      console.log('Getting favorites for userId:', userId);
      const response = await api.get(`/favorites?userId=${userId}`);
      console.log('Favorites response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error getting favorites:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authData');
      }
      throw error;
    }
  },

  addFavorite: async (city) => {
    const authData = localStorage.getItem('authData');
    if (!authData) {
      throw new Error('User not authenticated');
    }
    const userId = JSON.parse(authData).userId;

    try {
      console.log('Adding favorite:', { city, userId });
      const response = await api.post(`/favorites?userId=${userId}`, {
        cityName: city.cityName,
        latitude: city.coord.lat,
        longitude: city.coord.lon
      });
      console.log('Add favorite response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authData');
      }
      throw error;
    }
  },

  removeFavorite: async (cityId) => {
    const authData = localStorage.getItem('authData');
    if (!authData) {
      throw new Error('User not authenticated');
    }
    const userId = JSON.parse(authData).userId;

    try {
      console.log('Removing favorite:', { cityId, userId });
      const response = await api.delete(`/favorites/${cityId}?userId=${userId}`);
      console.log('Remove favorite response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error removing favorite:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authData');
      }
      throw error;
    }
  }
};

export default favoriteService;