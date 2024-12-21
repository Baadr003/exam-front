import React from 'react';
import { Navigate } from 'react-router-dom';
import { checkSession } from '../utils/authUtils';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = checkSession();
    return isAuthenticated ? children : <Navigate to="/" replace />;
};