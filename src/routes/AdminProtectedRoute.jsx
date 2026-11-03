import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
    const adminToken = localStorage.getItem('sheconnect_admin_token');
    const adminUser = localStorage.getItem('sheconnect_admin_user');

    if (!adminToken || !adminUser) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminProtectedRoute;

