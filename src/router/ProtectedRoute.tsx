import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Hook auxiliar para leer la sesión actual desde localStorage
const useAuth = () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;

    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error("Error al leer el usuario del localStorage");
        }
    }

    return {
        isAuthenticated: !!token && !!user,
        user
    };
};

// ==========================================
// 🔓 GUARDIA 1: Rutas Públicas (Login, Registro)
// ==========================================
export const PublicRoute = () => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated && user) {
        const rolNombre = String(user.rol?.nombre || '').toLowerCase();
        
        if (rolNombre === 'cliente') {
            return <Navigate to="/tienda" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return <Outlet />; 
};

// ==========================================
// 🔒 GUARDIA 2: Rutas Privadas (Dashboard, Tienda)
// ==========================================
interface ProtectedRouteProps {
    allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    // 1. Si no tiene sesión, pa' fuera (al login)
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Normalizamos el rol a minúsculas
    const userRole = String(user.rol?.nombre || '').toLowerCase();
    
    // Normalizamos la lista de roles permitidos
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    
    // Agregamos alias por si en la BD se guardó diferente
    if (normalizedAllowed.includes('administrador')) normalizedAllowed.push('admin');
    if (normalizedAllowed.includes('empleado')) normalizedAllowed.push('veterinario');

    // 3. Verificamos si el rol actual está en la lista de permitidos
    if (!normalizedAllowed.includes(userRole)) {
        
        // Si el usuario es cliente, a su tienda
        if (userRole === 'cliente') {
            if (location.pathname === '/tienda') return <Outlet />;
            return <Navigate to="/tienda" replace />;
        }
        
        // ¡SOLUCIÓN DE LA PANTALLA BLANCA!
        // Si no tiene permisos y ya está intentando cargar el dashboard, no lo rebotamos al dashboard de nuevo.
        // Significa que su rol en la BD es algo raro. Le cerramos sesión y lo mandamos al login.
        if (location.pathname === '/dashboard') {
            console.error(`Bloqueo de seguridad: El rol '${user.rol?.nombre}' no tiene acceso al Dashboard.`);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }
        
        return <Navigate to="/dashboard" replace />;
    }

    // 4. Todo en orden, puede pasar
    return <Outlet />; 
};