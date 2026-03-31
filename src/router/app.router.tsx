import { createBrowserRouter } from "react-router-dom";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { TiendaPage } from "../pages/tienda/TiendaPage"
import { RegistroPage } from "../pages/registro/RegistroPage";

export const appRouter = createBrowserRouter([
    {
        path: "/",
        element: <HomePage />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/dashboard",
        element: <DashboardPage />,
    },
    {
        path: "/tienda",
        element: <TiendaPage />,
    },
        {
        path: "/registro",
        element: <RegistroPage />,
    },
]);