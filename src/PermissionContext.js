// src/context/PermissionContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                
                // Check if user exists and has nested roleId
                if (user?.details?.role?.roleId) {
                    console.log("Fetching permissions for roleId:", user.details.role.roleId);
                    
                    const response = await fetch(`${process.env.REACT_APP_BASE_URL}/roles/by-roleid/${user.details.role.roleId}`);
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch permissions: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    console.log("Received permissions:", data.features);
                    setPermissions(data.features);
                } else {
                    console.warn("User or roleId not found in user object");
                    setPermissions([]);
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
                setError(error.message);
                setPermissions([]); // Set empty array to prevent blocking UI
            } finally {
                setLoading(false);
            }
        };
        
        fetchPermissions();
    }, []);

    const hasPermission = (component, action = 'read') => {
        if (loading) return false; // Wait while loading
        if (error) return false; // Deny if there was an error
        
        if (!permissions || permissions.length === 0) {
            console.warn("No permissions loaded for component:", component);
            return false;
        }
        
        const feature = permissions.find(f => f.component === component);
        
        if (!feature) {
            console.warn(`Permission not found for component: ${component}`);
            return false;
        }
        
        const hasAccess = feature[action];
        console.log(`Permission check: ${component} - ${action} - ${hasAccess}`);
        return hasAccess;
    };

    return (
        <PermissionContext.Provider value={{ 
            hasPermission, 
            loading, 
            permissions,
            error 
        }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => useContext(PermissionContext);