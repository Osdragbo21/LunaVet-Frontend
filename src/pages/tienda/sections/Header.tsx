import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Sun, Moon, ChevronRight, Menu, User, PawPrint, Package, LogOut, Calendar as CalendarIcon, MapPin, Search, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
  cartCount: number;
  onOpenCart: () => void; 
  onOpenMascotas: () => void;
  onOpenPedidos: () => void;
  onOpenPerfil: () => void;
  onOpenAgendarCita: () => void; 
  onOpenCitas: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  isDarkMode, toggleTheme, cartCount, onOpenCart, 
  onOpenMascotas, onOpenPedidos, onOpenPerfil, onOpenAgendarCita, onOpenCitas,
  searchTerm, setSearchTerm 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const nombreCliente = currentUser?.username || 'Invitado';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#3B82F6] dark:bg-[#1E293B] shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* ==========================================
              LADO IZQUIERDO: Menú Hamburguesa y Logo
              ========================================== */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors flex items-center">
                <Menu size={26} />
              </button>

              {isMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-xl shadow-xl border border-black/5 dark:border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 mb-1">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">Módulos</p>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Servicios de la clínica</p>
                  </div>
                  <button onClick={() => { onOpenMascotas(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <PawPrint size={18} className="text-[#3B82F6]" /> Mis Mascotas
                  </button>
                  <button onClick={() => { onOpenPedidos(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <Package size={18} className="text-[#3B82F6]" /> Mis Pedidos
                  </button>
                  <button onClick={() => { onOpenCitas(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <CalendarClock size={18} className="text-[#3B82F6]" /> Mis Citas
                  </button>
                  <button onClick={() => { onOpenAgendarCita(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
                    <CalendarIcon size={18} className="text-[#3B82F6]" /> Agendar Cita
                  </button>
                  <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                  <div className="px-4 py-3 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2">
                    <MapPin size={16} className="text-emerald-500" /> Recoger en Clínica Matriz
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 cursor-pointer ml-1 sm:ml-0" onClick={() => navigate('/')}>
              <img src="/Logo_LunaVet.png" alt="LunaVet Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md" onError={(e: any) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1864/1864509.png"; }} />
              <span className="hidden md:block font-bold text-2xl tracking-tight text-white drop-shadow-sm">LunaVet</span>
            </div>
          </div>

          {/* ==========================================
              CENTRO: Buscador Dinámico
              ========================================== */}
          <div className="flex-1 max-w-xl flex relative mx-2">
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar productos..." 
              className="w-full py-2 pl-4 pr-10 rounded-full text-sm text-[#0F172A] bg-white border-none focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] shadow-inner"
            />
            <div className="absolute right-3 top-0 h-full text-[#64748B] flex items-center justify-center pointer-events-none">
              <Search size={18} />
            </div>
          </div>

          {/* ==========================================
              LADO DERECHO: Tema, Perfil y Carrito
              ========================================== */}
          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            <button onClick={toggleTheme} className="text-white/90 hover:text-white p-1.5 sm:p-2 hidden sm:block">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <div className="hidden lg:flex flex-col items-start cursor-pointer text-white/90 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <span className="text-[10px] uppercase tracking-wide opacity-80 font-bold">Bienvenido</span>
                <span className="text-sm font-bold flex items-center gap-1">{nombreCliente} <ChevronRight size={14} className={isDropdownOpen ? 'rotate-90' : ''}/></span>
              </div>
              <button className="lg:hidden text-white/90 hover:text-white p-1.5" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <User size={22} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-xl shadow-xl border border-black/5 dark:border-white/10 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-3 border-b border-black/5 dark:border-white/5 mb-1">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white">Mi Cuenta</p>
                  </div>
                  <button onClick={() => { onOpenPerfil(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-black/5 flex items-center gap-3 transition-colors">
                    <User size={16} className="text-[#64748B]" /> Mi Perfil
                  </button>
                  <button onClick={() => { onOpenCitas(); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-white hover:bg-black/5 flex items-center gap-3 transition-colors">
                    <CalendarClock size={16} className="text-[#64748B]" /> Mis Citas
                  </button>
                  <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors">
                    <LogOut size={16} /> Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-white/20 hidden sm:block mx-1"></div>

            <button onClick={onOpenCart} className="relative text-white/90 hover:text-white p-1.5 sm:p-2 flex items-center gap-1 group">
              <div className="relative">
                <ShoppingCart size={24} className="group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#3B82F6]">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};