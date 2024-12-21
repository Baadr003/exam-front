import { favoriteService } from '../api';
import axios from 'axios';

// src/services/__tests__/api.test.js

jest.mock('axios');

describe('Favorite Service Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'fake-token');
    axios.create.mockReturnValue(axios);
  });

  test('addFavorite should successfully add a city', async () => {
    const mockCity = {
      cityName: 'Paris',
      coord: {
        lat: 48.8566,
        lon: 2.3522
      }
    };

    const mockResponse = {
      data: {
        id: 1,
        cityName: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
        currentAqi: 50
      }
    };

    axios.post.mockResolvedValueOnce(mockResponse);

    const result = await favoriteService.addFavorite(mockCity);
    
    expect(axios.post).toHaveBeenCalledWith('/favorites', {
      cityName: mockCity.cityName,
      latitude: mockCity.coord.lat,
      longitude: mockCity.coord.lon
    });
    expect(result).toEqual(mockResponse.data);
  });

  test('getFavorites should return list of favorite cities', async () => {
    const mockFavorites = [
      {
        id: 1,
        cityName: 'Paris',
        currentAqi: 50
      }
    ];

    axios.get.mockResolvedValueOnce({ data: mockFavorites });

    const result = await favoriteService.getFavorites();
    
    expect(axios.get).toHaveBeenCalledWith('/favorites');
    expect(result).toEqual(mockFavorites);
  });

  test('removeFavorite should successfully remove a city', async () => {
    const cityId = 1;
    const mockResponse = {
      data: { message: 'City removed successfully' }
    };

    axios.delete.mockResolvedValueOnce(mockResponse);

    const result = await favoriteService.removeFavorite(cityId);
    
    expect(axios.delete).toHaveBeenCalledWith(`/favorites/${cityId}`);
    expect(result).toEqual(mockResponse.data);
  });
});