import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import MainPage from './pages/MainPage';
import UserProfile from './components/UserProfile';
import TestAlerts from './pages/TestAlerts';
import { checkSession, initSession } from './utils/authUtils';
import { theme } from './theme';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = checkSession();
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    initSession(setIsAuthenticated, setUserId);

    const handleStorageChange = () => {
      initSession(setIsAuthenticated, setUserId);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainPage 
                isAuthenticated={isAuthenticated} 
                setIsAuthenticated={setIsAuthenticated}
                userId={userId}
                setUserId={setUserId}
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <UserProfile userId={userId} />
              </ProtectedRoute>
            } 
          />
          <Route path="/test" element={<TestAlerts />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;