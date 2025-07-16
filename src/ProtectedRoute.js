// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from './PermissionContext';
import { CircularProgress } from '@mui/joy';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({
    component: Component,
    requiredPermission = 'read',
    componentName,
    ...props
}) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const { hasPermission, loading: permissionsLoading, error, ready } = usePermissions();

    // If token is missing, redirect to login
    if (!user?.token) {
        return <Navigate to="/login" replace />;
    }

    // If permissions are not ready yet, show loader
    if (!ready || permissionsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <CircularProgress />
            </div>
        );
    }

    // If error while loading permissions
    if (error) {
        toast.dismiss();
        toast.error("Error loading permissions");
        return <Navigate to="/user" replace />;
    }

    // If permission check fails
    if (!hasPermission(componentName, requiredPermission)) {
        toast.dismiss();
        toast.error(`You don't have permission to access ${componentName} page`);
        return <Navigate to="/user" replace />;
    }

    return <Component {...props} />;
};

export default ProtectedRoute;
