import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ButtonThemeProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
}

export const ButtonTheme: React.FC<ButtonThemeProps> = ({ isDarkMode, toggleTheme }) => (
    <button 
        onClick={toggleTheme}
        className="absolute top-8 right-8 p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-black/10 dark:border-white/5 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] shadow-sm transition-all duration-200 z-10"
        aria-label="Alternar modo oscuro"
    >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
);


