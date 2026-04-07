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

// Componentes Modales
import { CartPanel } from './components/CartPanel';
import { MisMascotasModal } from './components/MisMascotasModal';
import { MisPedidosModal } from './components/MisPedidosModal';
import { MiPerfilModal } from './components/MiPerfilModal';

export const TiendaPage = () => {
  const { 
    isDarkMode, toggleTheme, 
    cart, isCartOpen, setIsCartOpen, 
    addToCart, removeFromCart, updateQuantity, 
    cartTotal, cartCount, 
    checkout, isCheckingOut, checkoutError,
    successOrder, setSuccessOrder,
    isMascotasOpen, setIsMascotasOpen,
    isPedidosOpen, setIsPedidosOpen,
    isPerfilOpen, setIsPerfilOpen,
    searchTerm, setSearchTerm,           // Nuevos estados
    activeCategory, setActiveCategory    // Nuevos estados
  } = useTienda();

  return (
    <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-[#F8FAFC] dark:bg-[#0F172A] text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-300 min-h-screen flex flex-col">
        
        <Header 
          isDarkMode={isDarkMode} 
          toggleTheme={toggleTheme} 
          cartCount={cartCount} 
          onOpenCart={() => setIsCartOpen(true)}
          onOpenMascotas={() => setIsMascotasOpen(true)}
          onOpenPedidos={() => setIsPedidosOpen(true)}
          onOpenPerfil={() => setIsPerfilOpen(true)}
          searchTerm={searchTerm}              // Pasamos buscador
          setSearchTerm={setSearchTerm}        // Pasamos buscador
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
          <HeroBanner />
          <BenefitsSection />
          
          <CategoriesSection 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
          />
          
          <ProductsGrid 
            addToCart={addToCart} 
            searchTerm={searchTerm} 
            activeCategory={activeCategory} 
          />
        </main>
        
        <Footer />

        {/* Modales del Portal del Cliente */}
        <CartPanel 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          total={cartTotal}
          checkout={checkout}
          isCheckingOut={isCheckingOut}
          checkoutError={checkoutError}
          successOrder={successOrder}
          setSuccessOrder={setSuccessOrder}
        />

        <MisMascotasModal isOpen={isMascotasOpen} onClose={() => setIsMascotasOpen(false)} />
        <MisPedidosModal isOpen={isPedidosOpen} onClose={() => setIsPedidosOpen(false)} />
        <MiPerfilModal isOpen={isPerfilOpen} onClose={() => setIsPerfilOpen(false)} />
      </div>
    </div>
  );
};