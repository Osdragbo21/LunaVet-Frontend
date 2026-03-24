import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const WelcomeBanner = () => {
    return (
        <div className="relative bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] p-8 border border-black/5 dark:border-white/5 shadow-sm overflow-hidden flex items-center justify-between">
        
        {/* Partículas de fondo */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
            <div className="absolute top-4 left-1/4 w-32 h-32 bg-[#3B82F6]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-4 right-1/3 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s'}}></div>
        </div>

        <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 text-[#3B82F6] font-bold text-sm mb-2 tracking-wide uppercase">
            <span className="w-8 h-[2px] bg-[#3B82F6] rounded-full"></span>
            Panel de Control
            </div>
            <h1 className="text-3xl font-extrabold mb-3 text-[#0F172A] dark:text-white">
            Bienvenido, Dr. Osvaldo
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] mb-6">
            Gestiona los expedientes médicos de tus pacientes, revisa tu agenda del día y mantén el control del inventario desde un solo lugar.
            </p>
            
            <div className="inline-block">
            <Button variant="primary" className="!py-3 !px-6">
                Nueva Consulta <ChevronRight size={18} />
            </Button>
            </div>
        </div>

        {/* Personaje / Doctora con Aura (En desktop) */}
        <div className="hidden lg:block relative z-10">
            <div className="relative w-40 h-40 xl:w-48 xl:h-48">
                <div className="absolute -inset-6 rounded-full blur-2xl bg-[#3B82F6]/30 dark:bg-[#3B82F6]/40 animate-pulse"></div>
                <img 
                src="Osa_pin.jpg" 
                alt="Doctora LunaVet" 
                className="relative z-10 w-full h-full object-cover rounded-full border-4 border-white dark:border-[#1E293B] shadow-xl"
            />
            </div>
        </div>
        </div>
    );
};
