import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    console.log("ProtectedRoute: current state", { user: user?.email_id || !!user, loading });

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen font-bold text-gray-400 animate-pulse">Checking access...</div>;
    }

    if (!user) {
        console.warn("ProtectedRoute: No user found, redirecting to login...");
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
