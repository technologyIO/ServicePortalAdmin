import React, { createContext, useContext, useEffect, useState } from 'react';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
    const [permissions, setPermissions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        const fetchPermissions = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));

                if (user?.token && user?.details?.role?.roleId) {
                    console.log('🔄 Fetching fresh permissions for role:', user.details.role.roleId);
                    
                    // 🔧 FIX 1: Always fetch fresh permissions for debugging
                    // Remove this later once you confirm it works
                    const response = await fetch(
                        `${process.env.REACT_APP_BASE_URL}/roles/by-roleid/${user.details.role.roleId}`
                    );

                    if (!response.ok) {
                        throw new Error(`Failed to fetch permissions: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('✅ Fresh permissions fetched:', data.features);
                    console.log('🔍 Total permissions count:', data.features.length);

                    // 🔧 FIX 2: Check for the specific components
                    const discountPermission = data.features.find(p => p.component === "CMC/NCMC Discount");
                    const servicePermission = data.features.find(p => p.component === "OnCall Service Charge");
                    
                    console.log('🎯 CMC/NCMC Discount permission:', discountPermission);
                    console.log('🎯 OnCall Service Charge permission:', servicePermission);

                    // Cache the permissions with timestamp for debugging
                    localStorage.setItem('permissions', JSON.stringify({
                        roleId: user.details.role.roleId,
                        features: data.features,
                        timestamp: Date.now()
                    }));

                    setPermissions(data.features);
                } else {
                    console.log('❌ No user token or roleId found');
                    setPermissions([]);
                }
            } catch (error) {
                console.error('❌ Error fetching permissions:', error);
                setError(error.message);
                setPermissions([]);
            } finally {
                setLoading(false);
                setReady(true);
            }
        };

        fetchPermissions();
    }, []);

    const hasPermission = (componentName, action = "read") => {
        if (!permissions || !Array.isArray(permissions)) {
            console.log('⚠️ No permissions available yet for:', componentName);
            return false;
        }

        // 🔧 FIX 3: Enhanced debugging for problematic components
        if (componentName === "CMC/NCMC Discount" || componentName === "OnCall Service Charge") {
            console.log(`🔍 Checking permission for: "${componentName}"`);
            console.log('📋 Available permissions count:', permissions.length);
            console.log('📋 All component names:', permissions.map(p => p.component));
        }

        const permission = permissions.find(p => p.component === componentName);
        const hasAccess = permission ? permission[action] : false;
        
        if (componentName === "CMC/NCMC Discount" || componentName === "OnCall Service Charge") {
            console.log(`✅ Permission result for "${componentName}": ${hasAccess}`, permission);
        }
        
        return hasAccess;
    };

    return (
        <PermissionContext.Provider value={{
            hasPermission,
            loading,
            ready,
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
