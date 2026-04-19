import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader2 } from 'lucide-react';

// 1. Importamos el Hook y Sidebar propios de este módulo
import { usePortalOperativo } from './hooks/usePortalOperativo';
import { SidebarOperativo } from './components/SidebarOperativo';

// 2. RECICLAMOS el TopHeader genérico
import { TopHeader } from '../dashboard/components/TopHeader';

// 3. Importamos la vista de Inicio exclusiva del doctor
// Nota: Ajusta la ruta a './components/InicioOperativoView' si lo guardaste ahí
import { InicioOperativoView } from './sections/InicioOperativoView';

// 4. RECICLAMOS las Vistas ya construidas en el dashboard
import { AgendaView } from '../dashboard/sections/AgendaView';
import { ConsultasView } from '../dashboard/sections/ConsultasView';
import { HospitalizacionView } from '../dashboard/sections/HospitalizacionView';
import { PacientesView } from '../dashboard/sections/PacientesView';
import { ClientesView } from '../dashboard/sections/ClientesView';
import { MedicamentosView } from '../dashboard/sections/MedicamentosView';
import { VacunasView } from '../dashboard/sections/VacunasView';
import { NuevaVentaView } from '../dashboard/sections/NuevaVentaView';
// NUEVOS MÓDULOS IMPORTADOS
import { HistorialVentasView } from '../dashboard/sections/HistorialVentasView';
import { PedidosView } from '../dashboard/sections/PedidosView';

export const PortalOperativoPage = () => {
  const navigate = useNavigate();
  const [rolUsuario, setRolUsuario] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);

  // Instanciamos nuestro Hook de UI
  const { 
    isDarkMode, toggleTheme, 
    isSidebarOpen, setIsSidebarOpen, 
    activeTab, setActiveTab 
  } = usePortalOperativo();

  useEffect(() => {
    // Verificación RBAC (Control de Acceso Basado en Roles)
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        // Ajusta la propiedad según tu JSON (ej. user.rol.id_rol o user.rol_id)
        const id = Number(user?.rol?.id_rol || user?.rol?.id || user?.rol_id || 3);
        setRolUsuario(id);
      } else {
        navigate('/login');
      }
      setCargando(false);
    };
    
    checkAuth();
  }, [navigate]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <Loader2 className="animate-spin text-[#3B82F6]" size={40} />
      </div>
    );
  }

  // RESTRICCIÓN DE NIVEL 3 (CLIENTE)
  if (rolUsuario === 3) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A]">
        <ShieldAlert size={64} className="text-rose-500 mb-4 opacity-50" />
        <h2 className="text-2xl font-black text-[#0F172A] dark:text-white">Acceso Restringido</h2>
        <p className="text-[#64748B] text-center max-w-md mt-2">
          Tu nivel de acceso no permite visualizar el Portal Clínico. Contacta al administrador.
        </p>
      </div>
    );
  }

  // RENDERIZADO DEL PORTAL
  return (
    <div className={`flex h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A] ${isDarkMode ? 'dark' : ''}`}>
      
      {/* 1. MENÚ LATERAL (Restringido) */}
      <SidebarOperativo 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* Cabecera Superior (Reutilizada) */}
        <TopHeader 
          setIsSidebarOpen={setIsSidebarOpen} 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
        />

        {/* Contenedor de las Vistas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 scroll-smooth">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-full flex flex-col">
            
            {/* Renderizado de Vistas según la pestaña activa */}
            {activeTab === 'general' && <InicioOperativoView />}
            
            {/* Clínica y Consultas */}
            {activeTab === 'agenda' && <AgendaView />}
            {activeTab === 'consultas' && <ConsultasView />}
            {activeTab === 'hospitalizacion' && <HospitalizacionView />}
            
            {/* Recepción y Directorios */}
            {activeTab === 'pacientes' && <PacientesView />}
            {activeTab === 'clientes' && <ClientesView />}
            
            {/* Farmacia y Catálogos */}
            {activeTab === 'medicamentos' && <MedicamentosView />}
            {activeTab === 'vacunas' && <VacunasView />}
            
            {/* Caja y Ventas (Con los nuevos módulos agregados) */}
            {activeTab === 'nueva-venta' && <NuevaVentaView />}
            {activeTab === 'historial-ventas' && <HistorialVentasView />}
            {activeTab === 'pedidos' && <PedidosView />}

          </div>
        </div>
      </main>
    </div>
  );
};