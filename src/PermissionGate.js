import React from 'react';
import { usePermissions } from './PermissionContext';
import { CircularProgress } from '@mui/joy';

export const PermissionGate = ({ children, fallback = null }) => {
    const { ready } = usePermissions();

    if (!ready) {
        return fallback || (
            <div className="flex justify-center items-center h-full">
                <CircularProgress />
            </div>
        );
    }

    return children;
};