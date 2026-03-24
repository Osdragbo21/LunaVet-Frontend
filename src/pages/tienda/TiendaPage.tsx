import React from 'react';

// Hooks
import { useTienda } from './hooks/useTienda';

// Secciones
import { Header } from './sections/Header';
import { HeroBanner } from './sections/HeroBanner';
import { BenefitsSection } from './sections/BenefitsSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { ProductsGrid } from './sections/ProductsGrid';
import { Footer } from './sections/Footer';

export const TiendaPage = () => {
    const { isDarkMode, toggleTheme, cartCount } = useTienda();

    return (
        <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300 min-h-screen flex flex-col">
            
            <Header 
            isDarkMode={isDarkMode} 
            toggleTheme={toggleTheme} 
            cartCount={cartCount} 
            />

            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
            <HeroBanner />
            <BenefitsSection />
            <CategoriesSection />
            <ProductsGrid />
            </main>
            
            <Footer />
        </div>
        </div>
    );
};
