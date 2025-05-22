// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from './PermissionContext';
import { toast } from 'react-hot-toast';

const ProtectedRoute = ({
    component: Component,
    requiredPermission = 'read',
    componentName,
    ...props
}) => {
    const { hasPermission, loading, error } = usePermissions();

    if (loading) {
        return <div>Loading permissions...</div>;
    }

    if (error) {
        toast.error("Error loading permissions");
        return <Navigate to="/user" replace />;
    }

    if (!hasPermission(componentName, requiredPermission)) {
        toast.dismiss();
        toast.error(`You don't have permission to access ${componentName} page`);
        return <Navigate to="/user" replace />;
    }

    return <Component {...props} />;
};

export default ProtectedRoute;