// src/pages/MainPage.js
import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, AppBar, Toolbar, Button, Typography, Dialog, TextField, CircularProgress, Box } from '@mui/material';
import PollutionMap from '../components/Map';
import PollutionTabs from '../components/PollutionTabs';
import UserProfile from '../components/UserProfile';
import CustomNotification from '../components/CustomNotification';
import { api } from '../services/api';
import { authService } from '../services/authService';
import { WebSocketService } from '../services/websocketService';
import { ALL_CITIES } from '../utils/constants';
import { checkSession } from '../utils/authUtils';
import EmailVerificationDialog from '../components/EmailVerificationDialog';

const MainPage = ({ isAuthenticated: globalIsAuthenticated, setIsAuthenticated: setGlobalIsAuthenticated, userId: globalUserId, setUserId: setGlobalUserId }) => {
  const [citiesData, setCitiesData] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentData, setCurrentData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [historyData, setHistoryData] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    aqi: null
  });
  const [verificationDialog, setVerificationDialog] = useState({
    open: false,
    email: ''
  });

  // Combined session and WebSocket management
  useEffect(() => {
    const { isAuthenticated, userId } = checkSession();
    let wsService = null;

    if (isAuthenticated && userId) {
      setGlobalIsAuthenticated(true);
      setGlobalUserId(userId);
      
      wsService = new WebSocketService(userId);
      wsService.connect((data) => {
        if (data.type === 'ALERT') {
          setNotification({
            open: true,
            message: data.message,
            aqi: data.aqi,
            severity: data.priority?.color || 'warning'
          });
        }
      });

      // Check session validity periodically
      const sessionCheckInterval = setInterval(() => {
        const currentSession = checkSession();
        if (!currentSession.isAuthenticated) {
          handleLogout();
        }
      }, 60000); // Check every minute

      return () => {
        clearInterval(sessionCheckInterval);
        if (wsService) {
          wsService.disconnect();
        }
      };
    }
  }, [setGlobalIsAuthenticated, setGlobalUserId]);

  useEffect(() => {
    const fetchAllCitiesData = async () => {
      setIsLoading(true);
      try {
        const responses = await Promise.all(
          ALL_CITIES.map(city => 
            api.get(`/pollution/current?lat=${city.lat}&lon=${city.lon}`, {
              headers: {
                'Content-Type': 'application/json',
              }
            })
          )
        );
    
        
        console.log('API Responses:', responses); // Debug
  
        const data = responses.map((response, index) => ({
          ...response.data,
          cityName: ALL_CITIES[index].name
        }));
        
        console.log('Processed Data:', data); // Debug
        setCitiesData(data);
      } catch (error) {
        console.error('Error fetching cities data:', error);
        setNotification({
          open: true,
          message: 'Erreur lors du chargement des données',
          aqi: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllCitiesData();
  }, []);

  useEffect(() => {
    const fetchCityData = async () => {
      if (!selectedCity) return;
      
      setIsLoading(true);
      try {
        console.log('Fetching data for city:', selectedCity); // Debug
  
        const [current, forecast] = await Promise.all([
          api.get(`/pollution/current?lat=${selectedCity.coord.lat}&lon=${selectedCity.coord.lon}`),
          api.get(`/pollution/forecast?lat=${selectedCity.coord.lat}&lon=${selectedCity.coord.lon}`)
        ]);
  
        const end = Math.floor(Date.now() / 1000);
        const start = end - (24 * 60 * 60);
        
        const history = await api.get(
          `/pollution/history?lat=${selectedCity.coord.lat}&lon=${selectedCity.coord.lon}&start=${start}&end=${end}`
        );
  
        console.log('City Data:', { current, forecast, history }); // Debug
  
        setCurrentData(current.data);
        setForecastData(forecast.data);
        setHistoryData(history.data);
      } catch (error) {
        console.error('Error fetching city data:', error);
        setNotification({
          open: true,
          message: 'Erreur lors du chargement des données de la ville',
          aqi: 0
        });
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchCityData();
  }, [selectedCity]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
  };

  // Enhanced login handler with session management
  const handleLogin = async () => {
    try {
      const response = await authService.login(loginData);
      if (response.success) {
        setGlobalIsAuthenticated(true);
        setGlobalUserId(response.userId);
        setOpenLogin(false);
        setError('');
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Erreur de connexion');
    }
  };

  const handleRegister = async () => {
    try {
      const response = await authService.register(registerData);
      if (response.success) {
        setOpenRegister(false);
        setVerificationDialog({
          open: true,
          email: registerData.email
        });
        setError('');
        setNotification({
          open: true,
          message: 'Inscription réussie ! Veuillez vérifier votre email.',
          severity: 'success'
        });
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Erreur lors de l\'inscription');
    }
  };

  // Enhanced logout with cleanup
  const handleLogout = () => {
    authService.logout();
    setGlobalIsAuthenticated(false);
    setGlobalUserId(null);
    setShowProfile(false);
    setSelectedCity(null);
    setCurrentData(null);
    setForecastData(null);
    setHistoryData(null);
    setNotification({
      open: true,
      message: 'Déconnexion réussie',
      severity: 'info'
    });
  };

  // Session check for protected features
  const handleProfileClick = () => {
    const { isAuthenticated } = checkSession();
    if (!isAuthenticated) {
      setNotification({
        open: true,
        message: 'Session expirée. Veuillez vous reconnecter.',
        severity: 'warning'
      });
      setGlobalIsAuthenticated(false);
      setOpenLogin(true);
      return;
    }
    setShowProfile(true);
  };

  // Ajout de la gestion des notifications
  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleBackToMap = () => {
    setShowProfile(false);
  };

  const handleVerifyEmail = async (email, code) => {
    try {
      await authService.verifyEmail(email, code);
      setVerificationDialog({ open: false, email: '' });
      setNotification({
        open: true,
        message: 'Email vérifié avec succès',
        severity: 'success'
      });
      setOpenLogin(true);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResendCode = async (email) => {
    try {
      await authService.resendVerificationCode(email);
      setNotification({
        open: true,
        message: 'Nouveau code envoyé',
        severity: 'info'
      });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#00fff5' }}>
            {showProfile ? 'User Profile' : 'Pollution Map'}
          </Typography>
          {globalIsAuthenticated ? (
            <>
              {showProfile ? (
                <Button 
                  onClick={handleBackToMap}
                  sx={{ 
                    color: '#00fff5',
                    borderColor: '#00fff5',
                    mr: 2
                  }}
                  variant="outlined"
                >
                  Back to Map
                </Button>
              ) : (
                <Button 
                  onClick={handleProfileClick}
                  sx={{ 
                    color: '#00fff5',
                    borderColor: '#00fff5',
                    mr: 2
                  }}
                  variant="outlined"
                >
                  Profile
                </Button>
              )}
              <Button 
                onClick={handleLogout}
                sx={{ 
                  color: '#ff4444',
                  borderColor: '#ff4444'
                }}
                variant="outlined"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => setOpenLogin(true)}
                sx={{ 
                  color: '#00fff5',
                  borderColor: '#00fff5',
                  mr: 2
                }}
                variant="outlined"
              >
                Login
              </Button>
              
              <Button 
                onClick={() => setOpenRegister(true)}
                sx={{ 
                  color: '#7928ca',
                  borderColor: '#7928ca'
                }}
                variant="outlined"
              >
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <CustomNotification
        open={notification.open}
        message={notification.message}
        aqi={notification.aqi}
        onClose={handleNotificationClose}
      />

      <Dialog open={openLogin} onClose={() => setOpenLogin(false)}>
        <Paper sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Login</Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={loginData.username}
            onChange={(e) => setLoginData({...loginData, username: e.target.value})}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={loginData.password}
            onChange={(e) => setLoginData({...loginData, password: e.target.value})}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Paper>
      </Dialog>

      <Dialog open={openRegister} onClose={() => setOpenRegister(false)}>
        <Paper sx={{ p: 3, minWidth: 300 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Register</Typography>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={registerData.username}
            onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={registerData.email}
            onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={registerData.password}
            onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={handleRegister}
          >
            Register
          </Button>
        </Paper>
      </Dialog>

      {showProfile ? (
  <UserProfile userId={globalUserId} />
) : (
  <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper elevation={3}>
          {isLoading ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <PollutionMap 
              pollutionData={citiesData}
              onCitySelect={handleCitySelect}
            />
          )}
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <PollutionTabs
          cityName={selectedCity?.cityName}
          current={currentData}
          forecast={forecastData}
          history={historyData}
          isAuthenticated={globalIsAuthenticated}
          isLoading={isLoading}
        />
      </Grid>
    </Grid>
  </Container>
)}

      <EmailVerificationDialog
        open={verificationDialog.open}
        email={verificationDialog.email}
        onClose={() => setVerificationDialog({ open: false, email: '' })}
        onVerify={handleVerifyEmail}
        onResendCode={handleResendCode}
      />
    </>
  );
};

export default MainPage;