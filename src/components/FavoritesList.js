import React, { useEffect, useState } from 'react';
import { Box, Typography, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { favoriteService } from '../services/favoriteService'; // Fix import path
import { getAQILevel } from '../utils/aqiUtils';

const FavoritesList = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      console.log('Loading favorites...');
      const data = await favoriteService.getFavorites();
      console.log('Loaded favorites:', data);
      setFavorites(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (cityId) => {
    try {
      await favoriteService.removeFavorite(cityId);
      await loadFavorites(); // Reload after removal
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography>Chargement des favoris...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography color="error">Erreur: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 3, color: '#00fff5' }}>
        Villes Favorites
      </Typography>
      {favorites.length === 0 ? (
        <Typography sx={{ color: '#fff' }}>Aucune ville favorite</Typography>
      ) : (
        <List sx={{ bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
          {favorites.map((city, index) => (
            <React.Fragment key={city.id || index}>
              <ListItem
                sx={{
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.05)'
                  }
                }}
                secondaryAction={
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveFavorite(city.id)}
                    sx={{ 
                      color: '#ff4444',
                      '&:hover': {
                        bgcolor: 'rgba(255,68,68,0.1)'
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={city.cityName}
                  secondary={`AQI: ${city.currentAqi || 'N/A'}`}
                  sx={{
                    '& .MuiListItemText-primary': { 
                      color: '#fff',
                      fontWeight: 500 
                    },
                    '& .MuiListItemText-secondary': { 
                      color: getAQILevel(city.currentAqi)?.color || '#fff',
                      fontWeight: city.currentAqi ? 600 : 400
                    }
                  }}
                />
              </ListItem>
              {index < favorites.length - 1 && (
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
              )}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );
};

export default FavoritesList;