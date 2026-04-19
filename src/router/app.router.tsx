import { createBrowserRouter } from "react-router-dom";

// Importamos las vistas
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TiendaPage } from "../pages/tienda/TiendaPage";
import { RegistroPage } from "../pages/registro/RegistroPage";

// NUEVA VISTA: Panel Clínico para Operativos (Empleados)
import { PortalOperativoPage } from "../pages/PortalOperativo/PortalOperativoPage";

// Importamos los Guardianes de Rutas
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";

export const appRouter = createBrowserRouter([
    // 🌍 RUTA LIBRE: Landing Page
    {
        path: "/",
        element: <HomePage />,
    },

    // 🔓 RUTAS PÚBLICAS: Solo para usuarios NO logueados
    {
        element: <PublicRoute />,
        children: [
            { path: "/login", element: <LoginPage /> },
            { path: "/registro", element: <RegistroPage /> },
        ]
    },

    // 🔒 ZONA ADMINISTRADOR (Solo Administrador, le quitamos 'Empleado')
    {
        element: <ProtectedRoute allowedRoles={['Administrador', 'Admin']} />,
        children: [
            { path: "/dashboard", element: <DashboardPage /> }
        ]
    },

    // 🔒 ZONA TRABAJADOR / DOCTOR (Aquí pertenece el empleado)
    {
        element: <ProtectedRoute allowedRoles={['Empleado', 'Veterinario', 'Trabajador']} />,
        children: [
            { path: "/panel-clinico", element: <PortalOperativoPage /> }
        ]
    },

    // 🔒 ZONA CLIENTE
    {
        element: <ProtectedRoute allowedRoles={['Cliente']} />,
        children: [
            { path: "/tienda", element: <TiendaPage /> }
        ]
    }
]);