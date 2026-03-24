import React from 'react';
import { Search, ShoppingCart, Sun, Moon, MapPin, ChevronRight, Menu } from 'lucide-react';

interface HeaderProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, cartCount }) => {
    return (
        <header className="sticky top-0 z-50 bg-[#3B82F6] dark:bg-[#1E293B] shadow-md transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo y Menú Móvil */}
            <div className="flex items-center gap-3 shrink-0">
                <button className="lg:hidden text-white p-1">
                <Menu size={24} />
                </button>
                <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <img 
                    src="/Logo_LunaVet.png" 
                    alt="LunaVet Logo" 
                    className="w-7 h-7 object-contain"
                    onError={(e: any) => { e.target.onerror = null; e.target.src = "[https://cdn-icons-png.flaticon.com/512/1864/1864509.png](https://cdn-icons-png.flaticon.com/512/1864/1864509.png)"; }}
                    />
                </div>
                <span className="hidden sm:block font-bold text-2xl tracking-tight text-white">LunaVet</span>
                </div>
            </div>

            {/* Buscador Potente */}
            <div className="flex-1 max-w-2xl hidden sm:flex relative">
                <input 
                type="text" 
                placeholder="Busca alimentos, medicamentos o accesorios..." 
                className="w-full py-2.5 pl-4 pr-12 rounded-full text-sm text-[#0F172A] bg-white border-none focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] shadow-inner"
                />
                <button className="absolute right-0 top-0 h-full px-4 text-[#64748B] hover:text-[#3B82F6] transition-colors rounded-r-full bg-transparent flex items-center justify-center">
                <Search size={18} />
                </button>
            </div>

            {/* Botón Buscar Móvil */}
            <button className="sm:hidden text-white p-2">
                <Search size={24} />
            </button>

            {/* Acciones de Usuario */}
            <div className="flex items-center gap-4 shrink-0">
                <button onClick={toggleTheme} className="text-white/90 hover:text-white transition-colors p-1">
                {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                
                <div className="hidden lg:flex flex-col items-start cursor-pointer text-white/90 hover:text-white">
                <span className="text-[10px] uppercase tracking-wide opacity-80">Bienvenido</span>
                <span className="text-sm font-bold flex items-center gap-1">Carlos M. <ChevronRight size={14}/></span>
                </div>

                <button className="relative text-white/90 hover:text-white transition-colors p-1 flex items-center gap-1">
                <div className="relative">
                    <ShoppingCart size={24} />
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#3B82F6] dark:border-[#1E293B]">
                    {cartCount}
                    </span>
                </div>
                </button>
            </div>
            </div>
            
            {/* Sub Navbar (Links Rápidos) */}
            <div className="hidden sm:flex items-center justify-between h-10 text-white/80 text-sm">
            <div className="flex items-center gap-6">
                <button className="flex items-center gap-1 hover:text-white transition-colors">
                <MapPin size={14} /> Recoger en: Clínica Matriz
                </button>
                <div className="h-3 w-px bg-white/20"></div>
                <a href="#" className="hover:text-white transition-colors font-medium">Mis Mascotas</a>
                <a href="#" className="hover:text-white transition-colors font-medium">Agendar Cita</a>
                <a href="#" className="hover:text-white transition-colors font-medium">Historial Médico</a>
            </div>
            <div className="flex items-center gap-4">
                <a href="#" className="hover:text-white transition-colors">Mis Pedidos</a>
                <a href="#" className="hover:text-white transition-colors">Soporte</a>
            </div>
            </div>
        </div>
        </header>
    );
};
