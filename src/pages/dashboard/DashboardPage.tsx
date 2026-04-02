import React from 'react';
import { useQuery } from '@apollo/client/react';
import { Loader2 } from 'lucide-react';

import { useDashboard } from './hooks/useDashboard';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { WelcomeBanner } from './sections/WelcomeBanner';
import { MetricsGrid } from './sections/MetricsGrid';
import { ChartsSection } from './sections/ChartsSection';

// Importamos TODAS nuestras vistas del directorio
import { PacientesView } from './sections/PacientesView';
import { ClientesView } from './sections/ClientesView';
import { AgendaView } from './sections/AgendaView';
import { UsuariosView } from './sections/UsuariosView';
import { EmpleadosView } from './sections/EmpleadosView';
import { InventarioView } from './sections/InventarioView';
import { ProveedoresView } from './sections/ProveedoresView';
import { NuevaVentaView } from './sections/NuevaVentaView';
import { HistorialVentasView } from './sections/HistorialVentasView';
import { PedidosView } from './sections/PedidosView';
import { EstadisticasVentasView } from './sections/EstadisticasVentasView';
import { ConsultasView } from './sections/ConsultasView';

import { GET_ADMIN_DASHBOARD_METRICS } from './graphql/dashboard.queries';

// ==========================================
// INTERFACES PARA TYPESCRIPT
// ==========================================
interface ChartItem {
    label: string;
    value: number;
}

interface DashboardMetrics {
    totalPacientesActivos: number;
    citasHoy: number;
    productosStockBajo: number;
    ingresosMes: number;
    graficaCitas: ChartItem[];
    graficaEspecies: ChartItem[];
}

interface QueryResponse {
    getAdminDashboardMetrics: DashboardMetrics;
}
// ==========================================

export const DashboardPage = () => {
    const { isDarkMode, toggleTheme, isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab } = useDashboard();

    // EJECUTAMOS LA PETICIÓN DE MÉTRICAS GLOBALES
    const { data, loading, error } = useQuery<QueryResponse>(GET_ADMIN_DASHBOARD_METRICS);

    return (
        <div className={`min-h-screen font-sans flex ${isDarkMode ? 'dark' : ''}`}>
        <div className="flex w-full min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300">
            
            {/* BARRA LATERAL (SIDEBAR) */}
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            
            {/* ENCABEZADO SUPERIOR */}
            <TopHeader setIsSidebarOpen={setIsSidebarOpen} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto space-y-6">
                
                {/* VISTA 1: DASHBOARD PRINCIPAL */}
                {activeTab === 'dashboard' && (
                    <>
                    <WelcomeBanner />
                    
                    {loading && (
                        <div className="h-64 flex flex-col items-center justify-center text-[#3B82F6]">
                        <Loader2 size={48} className="animate-spin mb-4" />
                        <p className="font-medium text-[#64748B] dark:text-[#94A3B8]">Conectando con la base de datos...</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold">
                        Error al cargar las métricas: {error.message}
                        </div>
                    )}

                    {!loading && !error && data && data.getAdminDashboardMetrics && (
                        <>
                        <MetricsGrid metrics={data.getAdminDashboardMetrics} />
                        <ChartsSection 
                            graficaCitas={data.getAdminDashboardMetrics.graficaCitas} 
                            graficaEspecies={data.getAdminDashboardMetrics.graficaEspecies}
                        />
                        </>
                    )}
                    </>
                )}

                {/* VISTAS DE DIRECTORIOS */}
                {activeTab === 'pacientes' && <PacientesView />}
                {activeTab === 'clientes' && <ClientesView />}
                {activeTab === 'empleados' && <EmpleadosView />}
                {activeTab === 'usuarios' && <UsuariosView />}
                
                {/* VISTAS DE SERVICIOS MÉDICOS */}
                {activeTab === 'agenda' && <AgendaView />}
                {activeTab === 'consultas' && <ConsultasView />}

                {/* VISTAS DE ADMINISTRACIÓN */}
                {activeTab === 'inventario' && <InventarioView />}
                {activeTab === 'proveedores' && <ProveedoresView />}

                {/* VISTAS DE VENTAS / POS */}
                {activeTab === 'nueva-venta' && <NuevaVentaView />}
                {activeTab === 'historial-ventas' && <HistorialVentasView />}
                {activeTab === 'pedidos' && <PedidosView />}
                {activeTab === 'metricas-ventas' && <EstadisticasVentasView />}

                </div>
            </div>
            </main>
        </div>
        </div>
    );
};