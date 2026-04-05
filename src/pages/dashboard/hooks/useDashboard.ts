import { useState, useEffect } from 'react';

export const useDashboard = () => {
  // Inicializamos leyendo el localStorage para recordar el tema
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('lunaVetTheme');
    return savedTheme === 'dark';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

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

  return {
    isDarkMode,
    toggleTheme,
    isSidebarOpen,
    setIsSidebarOpen,
    activeTab,
    setActiveTab
  };
};