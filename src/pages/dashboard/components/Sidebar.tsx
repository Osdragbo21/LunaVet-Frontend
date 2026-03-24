import React from 'react';
import { 
    X, LayoutDashboard, Users, Calendar, 
    ShoppingBag, CreditCard, Settings, LogOut, ChevronRight 
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
    
    const menuItems = [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'pacientes', icon: Users, label: 'Pacientes' },
        { id: 'agenda', icon: Calendar, label: 'Agenda Médica' },
        { id: 'inventario', icon: ShoppingBag, label: 'Inventario' },
        { id: 'facturacion', icon: CreditCard, label: 'Facturación' },
        { id: 'ajustes', icon: Settings, label: 'Ajustes' },
    ];

    return (
        <>
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-[#FFFFFF] dark:bg-[#1E293B] border-r border-black/5 dark:border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:block
        `}>
            {/* Logo */}
            <div className="h-20 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3">
                <img 
                src="/Logo_LunaVet.png" 
                alt="LunaVet Logo" 
                className="w-8 h-8 object-contain"
                onError={(e: any) => { e.target.onerror = null; e.target.src = "[https://cdn-icons-png.flaticon.com/512/1864/1864509.png](https://cdn-icons-png.flaticon.com/512/1864/1864509.png)"; }}
                />
                <span className="font-bold text-xl tracking-tight text-[#0F172A] dark:text-white">LunaVet</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-[#64748B] dark:text-[#94A3B8]">
                <X size={20} />
            </button>
            </div>

            {/* Navegación */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            <p className="px-3 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-4">Menú Principal</p>
            {menuItems.map((item) => (
                <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-medium transition-all duration-200
                    ${activeTab === item.id 
                    ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20' 
                    : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
                    }
                `}
                >
                <item.icon size={20} className={activeTab === item.id ? 'text-[#3B82F6]' : ''} />
                {item.label}
                {activeTab === item.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
            ))}
            </div>

            {/* Usuario / Bottom */}
            <div className="p-4 border-t border-black/5 dark:border-white/5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
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
