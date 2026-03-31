import { useState, useEffect } from 'react';

export const useDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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