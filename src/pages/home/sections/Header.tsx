import React, { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { ThemeToggle } from '../components/ThemeToggle';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full z-50 bg-[#FFFFFF]/80 dark:bg-[#1E293B]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          <div className="flex items-center gap-3 cursor-pointer">
            <img 
              src="/Logo_LunaVet.png" 
              alt="LunaVet Logo" 
              className="w-10 h-10 object-contain drop-shadow-sm"
              onError={(e: any) => { e.target.onerror = null; e.target.src = "[https://cdn-icons-png.flaticon.com/512/1864/1864509.png](https://cdn-icons-png.flaticon.com/512/1864/1864509.png)"; }}
            />
            <span className="font-bold text-2xl tracking-tight">LunaVet</span>
          </div>

          <div className="hidden lg:flex items-center space-x-8">
            <a href="#inicio" className="text-sm font-medium hover:text-[#3B82F6] transition-colors">Inicio</a>
            <a href="#conocenos" className="text-sm font-medium hover:text-[#3B82F6] transition-colors">Conócenos</a>
            <a href="#servicios" className="text-sm font-medium hover:text-[#3B82F6] transition-colors">Servicios</a>
            <a href="#contacto" className="text-sm font-medium hover:text-[#3B82F6] transition-colors">Contacto</a>
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-[12px] font-medium transition-all shadow-md flex items-center gap-2"
            >
              Portal Vet <ArrowRight size={16} />
            </button>
          </div>

          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};