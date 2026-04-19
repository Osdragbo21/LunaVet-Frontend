import { useState, useEffect } from 'react';

export const usePortalOperativo = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('lunaVetTheme');
    return savedTheme === 'dark';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // La vista por defecto para el personal ahora es el Inicio/Dashboard
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lunaVetTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lunaVetTheme', 'light');
    }
  }, [isDarkMode]);

  // ========================================================
  // ESTA ES LA MAGIA: Escuchamos el clic desde el InicioOperativoView
  // ========================================================
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      if (e.detail) setActiveTab(e.detail);
    };

    window.addEventListener('lunavet:switch-tab', handleSwitchTab);
    return () => window.removeEventListener('lunavet:switch-tab', handleSwitchTab);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return {
    isDarkMode, toggleTheme,
    isSidebarOpen, setIsSidebarOpen,
    activeTab, setActiveTab
  };
};