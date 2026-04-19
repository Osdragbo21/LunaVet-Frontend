import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Hook auxiliar para leer la sesión actual desde localStorage de forma segura
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
        // FORZAMOS LA CONVERSIÓN A NÚMERO para evitar errores de "2" vs 2
        const rolId = Number(user.rol?.id_rol || user.rol?.id || user.rol_id);
        const rolNombre = String(user.rol?.nombre || '').toLowerCase();
        
        // RBAC: Redirección automática al iniciar sesión según su Nivel
        if (rolId === 3 || rolNombre === 'cliente') {
            return <Navigate to="/tienda" replace />;
        } else if (rolId === 2 || ['empleado', 'veterinario', 'trabajador', 'medico', 'recepcionista'].includes(rolNombre)) {
            return <Navigate to="/panel-clinico" replace />;
        } else {
            return <Navigate to="/dashboard" replace />; // Admin (1) por defecto
        }
    }

    return <Outlet />; 
};

// ==========================================
// 🔒 GUARDIA 2: Rutas Privadas (Dashboard, Tienda, Panel)
// ==========================================
interface ProtectedRouteProps {
    allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // NORMALIZACIÓN DE DATOS (El secreto para que no falle)
    const rolId = Number(user.rol?.id_rol || user.rol?.id || user.rol_id);
    const userRole = String(user.rol?.nombre || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());
    
    let hasAccess = false;

    // 1. Verificamos si es ADMINISTRADOR (Nivel 1)
    if (normalizedAllowed.includes('administrador') || normalizedAllowed.includes('admin')) {
        if (rolId === 1 || userRole === 'administrador' || userRole === 'admin') hasAccess = true;
    }
    
    // 2. Verificamos si es TRABAJADOR OPERATIVO (Nivel 2)
    if (normalizedAllowed.includes('empleado') || normalizedAllowed.includes('trabajador') || normalizedAllowed.includes('veterinario')) {
        if (rolId === 2 || ['empleado', 'veterinario', 'trabajador', 'medico', 'recepcionista'].includes(userRole)) hasAccess = true;
    }

    // 3. Verificamos si es CLIENTE (Nivel 3)
    if (normalizedAllowed.includes('cliente')) {
        if (rolId === 3 || userRole === 'cliente') hasAccess = true;
    }

    // SI NO TIENE ACCESO A LA RUTA SOLICITADA -> EXPULSIÓN SEGURA
    if (!hasAccess) {
        
        // Si es Cliente, lo regresamos a su Tienda
        if (rolId === 3 || userRole === 'cliente') {
            if (location.pathname.startsWith('/tienda')) return <Outlet />;
            return <Navigate to="/tienda" replace />;
        }
        
        // Si es Trabajador, lo regresamos a su Panel Clínico
        if (rolId === 2 || ['empleado', 'veterinario', 'trabajador', 'medico', 'recepcionista'].includes(userRole)) {
            // Usamos startsWith para evitar bucles infinitos de redirección
            if (location.pathname.startsWith('/panel-clinico')) return <Outlet />;
            return <Navigate to="/panel-clinico" replace />;
        }

        // Si es Admin, lo regresamos a su Dashboard
        if (rolId === 1 || userRole === 'administrador') {
            if (location.pathname.startsWith('/dashboard')) return <Outlet />;
            return <Navigate to="/dashboard" replace />;
        }

        // Si llega aquí, los datos están corruptos. Destruimos la sesión.
        console.error(`Bloqueo de seguridad RBAC: Rol desconocido (ID: ${rolId}, Nombre: ${userRole}).`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};