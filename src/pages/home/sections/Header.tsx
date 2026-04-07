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
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/Logo_LunaVet.png" 
              alt="LunaVet Logo" 
              className="w-10 h-10 object-contain drop-shadow-sm"
              onError={(e: any) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1864/1864509.png"; }}
            />
            <span className="font-bold text-2xl tracking-tight text-[#0F172A] dark:text-white">LunaVet</span>
          </div>

          {/* Menú Desktop */}
          <div className="hidden lg:flex items-center space-x-8">
            <a href="#inicio" className="text-sm font-medium hover:text-[#3B82F6] transition-colors text-[#0F172A] dark:text-[#F8FAFC]">Inicio</a>
            <a href="#conocenos" className="text-sm font-medium hover:text-[#3B82F6] transition-colors text-[#0F172A] dark:text-[#F8FAFC]">Conócenos</a>
            <a href="#servicios" className="text-sm font-medium hover:text-[#3B82F6] transition-colors text-[#0F172A] dark:text-[#F8FAFC]">Servicios</a>
            <a href="#contacto" className="text-sm font-medium hover:text-[#3B82F6] transition-colors text-[#0F172A] dark:text-[#F8FAFC]">Contacto</a>
          </div>

          {/* Acciones Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <button 
              onClick={() => navigate('/login')} 
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-[12px] font-medium transition-all shadow-md flex items-center gap-2"
            >
              Portal Vet <ArrowRight size={16} />
            </button>
          </div>

          {/* Toggle Móvil */}
          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-[#0F172A] dark:text-[#F8FAFC]">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFFFF] dark:bg-[#1E293B] border-t border-black/5 dark:border-white/5 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <a href="#inicio" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5">Inicio</a>
            <a href="#conocenos" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5">Conócenos</a>
            <a href="#servicios" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5">Servicios</a>
            <a href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5">Contacto</a>
            
            <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/5">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }} 
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-3.5 rounded-[12px] font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                Portal Vet <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};