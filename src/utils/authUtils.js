export const checkSession = () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
        const parsed = JSON.parse(authData);
        return {
            isAuthenticated: parsed.isAuthenticated,
            userId: parsed.userId,
            username: parsed.username
        };
    }
    return { isAuthenticated: false, userId: null, username: null };
};

export const initSession = (setIsAuthenticated, setUserId) => {
    const { isAuthenticated, userId } = checkSession();
    setIsAuthenticated(isAuthenticated);
    setUserId(userId);
    return { isAuthenticated, userId };
};

export const clearSession = () => {
    localStorage.removeItem('authData');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAuthenticated');
};