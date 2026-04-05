import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';

interface TopHeaderProps {
  setIsSidebarOpen: (isOpen: boolean) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ setIsSidebarOpen, isDarkMode, toggleTheme }) => {
  // 1. Obtener usuario real de localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const nombreUsuario = user?.username ? `@${user.username}` : 'Usuario';
  const rolUsuario = user?.rol?.nombre || 'Personal Clínico';
  const inicial = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

  return (
    <header className="h-20 bg-[#FFFFFF]/80 dark:bg-[#1E293B]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30">
      
      <div className="flex items-center gap-4">
        {/* Botón menú móvil */}
        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#64748B] dark:text-[#94A3B8]">
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Botón de Tema Oscuro/Claro */}
        <button onClick={toggleTheme} className="p-2 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="h-8 w-px bg-black/10 dark:bg-white/10 mx-1"></div>
        
        {/* Identidad del Usuario */}
        <div className="flex items-center gap-3 cursor-default">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">{nombreUsuario}</p>
            <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-black tracking-wider">{rolUsuario}</p>
          </div>
          <div className="w-10 h-10 bg-[#3B82F6] rounded-full border-2 border-white dark:border-[#0F172A] shadow-sm flex items-center justify-center text-white font-bold text-lg">
            {inicial}
          </div>
        </div>

      </div>
    </header>
  );
};