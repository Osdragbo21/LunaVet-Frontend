import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, ShoppingCart, Sun, Moon, MapPin, ChevronDown, Menu, 
  User, PawPrint, Package, Settings, LogOut 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  cartCount: number;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleTheme, cartCount }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 1. LÓGICA PARA LEER EL NOMBRE DINÁMICO
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  // Mostramos el username o un texto por defecto
  const nombreUsuario = user?.username || 'Cliente';

  // 2. LÓGICA PARA CERRAR SESIÓN
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 3. CERRAR EL MENÚ AL HACER CLIC AFUERA
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#3B82F6] dark:bg-[#1E293B] shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo y Menú Móvil */}
          <div className="flex items-center gap-3 shrink-0">
            <button className="lg:hidden text-white p-1">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              {/* LOGO CON COLORES ORIGINALES (Sin invert ni brightness) */}
              <img 
                src="/Logo_LunaVet.png" 
                alt="LunaVet Logo" 
                className="w-10 h-10 object-contain drop-shadow-md"
                onError={(e: any) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1864/1864509.png"; }}
              />
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
            
            {/* NUEVO: MENÚ DESPLEGABLE DEL USUARIO */}
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <div 
                className="flex flex-col items-start cursor-pointer text-white/90 hover:text-white"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-[10px] uppercase tracking-wide opacity-80">Bienvenido</span>
                <span className="text-sm font-bold flex items-center gap-1">
                  {nombreUsuario} <ChevronDown size={14} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                </span>
              </div>

              {/* Contenido del Dropdown */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[16px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 mb-1">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">Mi Cuenta</p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Gestión de perfil</p>
                  </div>
                  
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <User size={16} className="text-[#64748B]" /> Mi Perfil
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <PawPrint size={16} className="text-[#64748B]" /> Mis Mascotas
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <Package size={16} className="text-[#64748B]" /> Mis Pedidos
                  </button>
                  <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <Settings size={16} className="text-[#64748B]" /> Ajustes
                  </button>
                  
                  <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                  
                  {/* BOTÓN REAL DE CERRAR SESIÓN */}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              )}
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