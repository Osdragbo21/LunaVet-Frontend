import { createBrowserRouter } from "react-router-dom";

// Importamos las vistas
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TiendaPage } from "../pages/tienda/TiendaPage";
import { RegistroPage } from "../pages/registro/RegistroPage";

// Importamos los Guardianes de Rutas
import { ProtectedRoute, PublicRoute } from "./ProtectedRoute";

export const appRouter = createBrowserRouter([
    // 🌍 RUTA LIBRE: El Landing Page es para todos
    {
        path: "/",
        element: <HomePage />,
    },

    // 🔓 RUTAS PÚBLICAS: Solo para usuarios NO logueados
    // (Si alguien con sesión intenta entrar a /login, PublicRoute lo saca a su panel)
    {
        element: <PublicRoute />,
        children: [
            {
                path: "/login",
                element: <LoginPage />,
            },
            {
                path: "/registro",
                element: <RegistroPage />,
            },
        ]
    },

    // 🔒 RUTAS PRIVADAS: ZONA DE STAFF (Administradores y Empleados)
    // (Si no están logueados o son clientes, ProtectedRoute los expulsa)
    {
        element: <ProtectedRoute allowedRoles={['Administrador', 'Empleado']} />,
        children: [
            {
                path: "/dashboard",
                element: <DashboardPage />,
            }
        ]
    },

    // 🔒 RUTAS PRIVADAS: ZONA DE CLIENTES
    // (Solo clientes pueden ver su panel de compras/tienda)
    {
        element: <ProtectedRoute allowedRoles={['Cliente']} />,
        children: [
            {
                path: "/tienda",
                element: <TiendaPage />,
            }
        ]
    },
]);