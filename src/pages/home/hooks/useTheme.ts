import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Leemos el valor guardado al iniciar
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('lunaVetTheme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lunaVetTheme', 'dark'); // Guardamos preferencia
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lunaVetTheme', 'light'); // Guardamos preferencia
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return { isDarkMode, toggleTheme };
};