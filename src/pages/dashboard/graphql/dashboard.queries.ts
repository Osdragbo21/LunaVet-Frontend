import { gql } from '@apollo/client';

export const GET_ADMIN_DASHBOARD_METRICS = gql`
    query GetAdminDashboardMetrics {
        getAdminDashboardMetrics {
        totalPacientesActivos
        citasHoy
        productosStockBajo
        ingresosMes
        graficaCitas {
            label
            value
        }
        graficaEspecies {
            label
            value
        }
        }
    }
`;