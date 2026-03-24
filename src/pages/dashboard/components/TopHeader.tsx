import React from 'react';
import { Menu, Search, Sun, Moon, Bell } from 'lucide-react';
import { Input } from '../../../components/ui/Input';

interface TopHeaderProps {
    setIsSidebarOpen: (isOpen: boolean) => void;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ setIsSidebarOpen, isDarkMode, toggleTheme }) => {
    return (
        <header className="h-20 bg-[#FFFFFF]/80 dark:bg-[#1E293B]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 z-30">
        <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-[#64748B] dark:text-[#94A3B8]">
            <Menu size={24} />
            </button>
            
            {/* Buscador usando nuestro componente UI */}
            <div className="hidden sm:block w-64 md:w-80">
            <Input 
                icon={Search} 
                type="text" 
                placeholder="Buscar paciente o cliente..." 
                className="py-2"
            />
            </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-[#1E293B]"></span>
            </button>
            
            <div className="h-8 w-px bg-black/10 dark:bg-white/10 mx-1"></div>
            
            <div className="flex items-center gap-3 cursor-pointer">
            <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Dr. Osvaldo S.</p>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Veterinario Titular</p>
            </div>
            <img src="Osa_pin.jpg" alt="Perfil" className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0F172A] shadow-sm"/>
            </div>
        </div>
        </header>
    );
};
