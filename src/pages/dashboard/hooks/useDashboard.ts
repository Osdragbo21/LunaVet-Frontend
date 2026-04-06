import { useState, useEffect } from 'react';

export const useDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('lunaVetTheme');
    return savedTheme === 'dark';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

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
  // ESTA ES LA MAGIA: Escuchamos el clic desde el WelcomeBanner
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