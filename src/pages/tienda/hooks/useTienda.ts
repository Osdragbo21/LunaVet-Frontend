import { useState, useEffect } from 'react';

export const useTienda = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [cartCount, setCartCount] = useState(2); // Simulación de 2 items

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
        cartCount,
        setCartCount
    };
};
