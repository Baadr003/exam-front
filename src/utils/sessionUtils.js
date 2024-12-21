export const checkAuthStatus = () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const parsed = JSON.parse(authData);
      return {
        isAuthenticated: parsed.isAuthenticated,
        userId: parsed.userId
      };
    }
    return { isAuthenticated: false, userId: null };
  };
  
  export const initializeAuth = (setIsAuthenticated, setUserId) => {
    const { isAuthenticated, userId } = checkAuthStatus();
    setIsAuthenticated(isAuthenticated);
    setUserId(userId);
  };