import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, LayoutDashboard, ShoppingCart, Stethoscope, Shield, Contact,
  PlusCircle, Package, History, BarChart2, Calendar, Scissors, 
  Users, PawPrint, Briefcase, UserCircle, Boxes, Truck, LogOut, 
  ChevronRight, ChevronDown, Activity, Pill, Syringe
} from 'lucide-react';

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab 
}) => {
  const navigate = useNavigate();

  // Estado para controlar qué submenús están abiertos (Acordeón: uno a la vez)
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuId: string) => {
    // Al abrir uno nuevo, los demás se cierran automáticamente.
    setOpenMenus(prev => ({
      [menuId]: !prev[menuId]
    }));
  };

  // Función para cerrar sesión de forma segura
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  // Jerarquía actualizada: Incluye Farmacia, Vacunas y Especialidades
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Principal' },
    {
      id: 'ventas-group', icon: ShoppingCart, label: 'Ventas',
      subItems: [
        { id: 'nueva-venta', label: 'Nueva Venta', icon: PlusCircle },
        { id: 'pedidos', label: 'Pedidos (Estatus)', icon: Package },
        { id: 'historial-ventas', label: 'Historial de Ventas', icon: History },
        { id: 'metricas-ventas', label: 'Estadísticas de Ventas', icon: BarChart2 },
      ]
    },
    {
      id: 'servicios-group', icon: Stethoscope, label: 'Servicios',
      subItems: [
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'consultas', label: 'Consulta', icon: Stethoscope },
        { id: 'hospitalizacion', label: 'Hospitalización', icon: Activity },
        { id: 'medicamentos', label: 'Farmacia / Medicamentos', icon: Pill },
        { id: 'vacunas', label: 'Catálogo Vacunas', icon: Syringe },
        { id: 'estetica', label: 'Estética', icon: Scissors },
      ]
    },
    {
      id: 'directorios-group', icon: Contact, label: 'Directorios',
      subItems: [
        { id: 'pacientes', label: 'Pacientes', icon: PawPrint },
        { id: 'clientes', label: 'Clientes (Dueños)', icon: Users },
        { id: 'empleados', label: 'Trabajadores', icon: Briefcase },
        { id: 'usuarios', label: 'Usuarios', icon: UserCircle },
      ]
    },
    {
      id: 'admin-group', icon: Shield, label: 'Administración',
      subItems: [
        { id: 'inventario', label: 'Inventario', icon: Boxes },
        { id: 'proveedores', label: 'Proveedores', icon: Truck },
      ]
    }
  ];

  return (
    <>
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#FFFFFF] dark:bg-[#1E293B] border-r border-black/5 dark:border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block
      `}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/Logo_LunaVet.png" 
              alt="LunaVet Logo" 
              className="w-9 h-9 object-contain"
              onError={(e: any) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1864/1864509.png"; }}
            />
            <span className="font-bold text-2xl tracking-tight text-[#0F172A] dark:text-white">LunaVet</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-[#64748B] dark:text-[#94A3B8]">
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <p className="px-4 text-[11px] font-extrabold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-4">Menú Principal</p>
          
          {menuItems.map((item) => {
            if (!item.subItems) {
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] font-medium transition-all duration-200 mb-1
                    ${activeTab === item.id 
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20' 
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                    }
                  `}
                >
                  <item.icon size={20} className={activeTab === item.id ? 'text-[#3B82F6]' : ''} />
                  {item.label}
                </button>
              );
            }

            const isOpen = !!openMenus[item.id];
            const isChildActive = item.subItems.some(sub => sub.id === activeTab);

            return (
              <div key={item.id} className="mb-2">
                {/* Botón Padre */}
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-[12px] font-medium transition-all duration-200
                    ${isChildActive && !isOpen ? 'text-[#3B82F6]' : 'text-[#0F172A] dark:text-[#F8FAFC]'}
                    hover:bg-black/5 dark:hover:bg-white/5
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={isChildActive && !isOpen ? 'text-[#3B82F6]' : 'text-[#64748B] dark:text-[#94A3B8]'} />
                    {item.label}
                  </div>
                  {isOpen ? <ChevronDown size={16} className="text-[#64748B]" /> : <ChevronRight size={16} className="text-[#64748B]" />}
                </button>

                {/* Sub-elementos desplegables */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="flex flex-col gap-1 pl-11 pr-2 border-l-2 border-black/5 dark:border-white/5 ml-6">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() => setActiveTab(subItem.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm font-medium transition-all duration-200
                          ${activeTab === subItem.id 
                            ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20' 
                            : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                          }
                        `}
                      >
                        <subItem.icon size={16} className={activeTab === subItem.id ? 'text-[#3B82F6]' : 'opacity-70'} />
                        {subItem.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Usuario / Bottom */}
        <div className="p-5 border-t border-black/5 dark:border-white/5 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* OVERLAY PARA MÓVIL */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};