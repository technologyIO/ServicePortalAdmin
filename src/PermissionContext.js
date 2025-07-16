import React, { createContext, useContext, useEffect, useState } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ready, setReady] = useState(false); // New ready state

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                
                // Check for cached permissions first
                const cachedPermissions = localStorage.getItem('permissions');
                if (cachedPermissions && user?.token) {
                    const parsed = JSON.parse(cachedPermissions);
                    if (parsed.roleId === user?.details?.role?.roleId) {
                        setPermissions(parsed.features);
                        setLoading(false);
                        setReady(true);
                        return;
                    }
                }

                if (user?.token && user?.details?.role?.roleId) {
                    const response = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/roles/by-roleid/${user.details.role.roleId}`
                    );
                    
                    if (!response.ok) {
                        throw new Error(`Failed to fetch permissions: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    // Cache the permissions
                    localStorage.setItem('permissions', JSON.stringify({
                        roleId: user.details.role.roleId,
                        features: data.features
                    }));
                    
                    setPermissions(data.features);
                } else {
                    setPermissions([]);
                }
            } catch (error) {
                console.error('Error fetching permissions:', error);
                setError(error.message);
                setPermissions([]);
            } finally {
                setLoading(false);
                setReady(true); // Mark as ready
            }
        };
        
        fetchPermissions();
    }, []);

    const hasPermission = (component, action = 'read') => {
        if (!ready) return false; // Don't allow access until ready
        if (error) return false;
        
        if (!permissions || permissions.length === 0) {
            return false;
        }
        
        const feature = permissions.find(f => f.component === component);
        return feature ? feature[action] : false;
    };

    return (
        <PermissionContext.Provider value={{ 
            hasPermission, 
            loading, 
            ready, // Expose ready state
            permissions,
            error 
        }}>
            {children}
        </PermissionContext.Provider>
    );
};

export const usePermissions = () => {
    const context = useContext(PermissionContext);
    if (context === undefined) {
        throw new Error('usePermissions must be used within a PermissionProvider');
    }
    return context;
};