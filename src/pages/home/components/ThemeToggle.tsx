import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
    isDarkMode: boolean;
    toggleTheme: () => void;
    }

    export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, toggleTheme }) => {
    return (
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
};


