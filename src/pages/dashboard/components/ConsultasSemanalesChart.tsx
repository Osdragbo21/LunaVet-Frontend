import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, Stethoscope, ShoppingCart, 
  ShieldCheck, ArrowUpRight, Sparkles 
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

// Definimos la interfaz para las props, aceptando una función de navegación
interface WelcomeBannerProps {
  onNavigate: (tabId: string) => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onNavigate }) => {
  const [greeting, setGreeting] = useState('Bienvenido');
  
  // 1. Obtener datos reales del usuario de localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const nombreReal = user?.username ? user.username.split('.')[0] : 'Osvaldo';
  const esAdmin = user?.rol?.nombre === 'Administrador';

  // 2. Lógica de saludo dinámico según la hora
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  return (
    <div className="relative bg-white dark:bg-[#1E293B] rounded-[32px] p-8 sm:p-10 border border-black/5 dark:border-white/5 shadow-xl shadow-blue-500/5 overflow-hidden group">
      
      {/* Fondos Decorativos y Partículas */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s'}}></div>
          
          {/* Patrón sutil de puntos */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs mb-6 tracking-widest uppercase border border-blue-100 dark:border-blue-500/20 shadow-sm">
            <Sparkles size={14} className="animate-spin-slow" /> Sistema ERP LunaVet v1.0
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-black mb-4 text-[#0F172A] dark:text-white leading-tight tracking-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-300 capitalize">{nombreReal}</span>
          </h1>
          
          <p className="text-base sm:text-lg text-[#64748B] dark:text-[#94A3B8] mb-8 max-w-2xl font-medium leading-relaxed">
            Tu centro de control médico y administrativo está listo. Gestiona <span className="text-[#0F172A] dark:text-white font-bold">expedientes con gabinete</span>, procesa <span className="text-[#0F172A] dark:text-white font-bold">ventas POS</span> y mantén el <span className="text-[#0F172A] dark:text-white font-bold">Kardex</span> bajo control total.
          </p>
          
          {/* Botones de Acción Rápida Actualizados */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <Button 
              variant="primary" 
              className="!rounded-2xl !py-3.5 !px-8 shadow-lg shadow-blue-600/20 group/btn"
              onClick={() => onNavigate('consultas')} // Navegar a Consultas
            >
              <Stethoscope size={20} className="group-hover/btn:rotate-12 transition-transform" />
              <span>Nueva Consulta</span>
              <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              variant="outline" 
              className="!rounded-2xl !py-3.5 !px-8 bg-white/50 dark:bg-white/5 backdrop-blur-md group/btn2"
              onClick={() => onNavigate('nueva-venta')} // Navegar a Caja POS
            >
              <ShoppingCart size={20} className="text-[#64748B] dark:text-[#94A3B8]" />
              <span>Caja POS</span>
              <ArrowUpRight size={18} className="opacity-0 group-hover/btn2:opacity-100 group-hover/btn2:translate-x-0.5 group-hover/btn2:-translate-y-0.5 transition-all text-[#3B82F6]" />
            </Button>

            {esAdmin && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 cursor-help" title="Sistema de Auditoría Activo">
                <ShieldCheck size={18} className="text-amber-600" />
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-tighter">Seguridad ON</span>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Ilustración Limpia */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64">
              {/* Efecto de Glitch/Aura animada */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-2xl animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/20 dark:border-white/10 animate-spin-slow"></div>
              
              <div className="relative z-10 w-full h-full overflow-hidden rounded-full border-8 border-white dark:border-[#1E293B] shadow-2xl">
                <img 
                  src="/Cat_c.png" 
                  alt="Avatar LunaVet" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e: any) => { e.target.onerror = null; e.target.src = "https://img.freepik.com/foto-gratis/lindo-perrito-abrazando-al-veterinario-joven_23-2148993883.jpg"; }}
                />
              </div>
              {/* Badges de gamificación eliminados aquí */}
          </div>
        </div>

      </div>
    </div>
  );
};