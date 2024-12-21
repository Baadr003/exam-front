// src/services/favoriteService.js
import { api } from './api';

export const favoriteService = {
  getFavorites: async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }
    
    try {
      const response = await api.get(`/favorites?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting favorites:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('userId');
        localStorage.removeItem('isAuthenticated');
      }
      throw error;
    }
  },

  addFavorite: async (city) => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await api.post(`/favorites?userId=${userId}`, {
        cityName: city.cityName,
        latitude: city.coord.lat,
        longitude: city.coord.lon
      });
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('userId');
        localStorage.removeItem('isAuthenticated');
      }
      throw error;
    }
  },

  removeFavorite: async (cityId) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !cityId) {
      throw new Error('Missing required parameters');
    }

    try {
      await api.delete(`/api/favorites/${cityId}`, {
        params: { userId }
      });
      return true;
    } catch (error) {
      console.error('Remove favorite error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw new Error(error.response?.data?.error || 'Failed to remove favorite');
    }
}
};