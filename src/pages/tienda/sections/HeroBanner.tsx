import React from 'react';

export const HeroBanner = () => {
  return (
    <div className="relative w-full h-48 sm:h-56 md:h-72 rounded-[24px] overflow-hidden shadow-sm border border-black/5 dark:border-white/5">
      {/* Fondo y Gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] dark:from-[#0F172A] dark:to-[#1E293B]"></div>
      
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-4 right-1/3 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 md:px-16">
        <div className="text-white max-w-2xl z-10">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] sm:text-xs font-bold mb-3 border border-white/30 uppercase tracking-widest shadow-sm">
            Tienda en Línea
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">
            Todo para consentir a tu <br className="hidden sm:block"/><span className="text-blue-200">mejor amigo.</span>
          </h2>
          <p className="hidden sm:block text-blue-100 text-base md:text-lg font-medium max-w-xl leading-relaxed">
            Explora nuestro catálogo de alimentos premium, accesorios clínicos, medicamentos y juguetes. Compra en línea y recoge cómodamente en clínica.
          </p>
        </div>

        {/* Nueva Imagen Decorativa */}
        <div className="hidden md:flex relative z-10 w-1/3 justify-end items-center pr-4">
          <div className="relative w-44 h-44 lg:w-56 lg:h-56">
            {/* Brillo de fondo */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse"></div>
            
            <img 
              src="https://clinicavesal.es/wp-content/uploads/2017/10/veterinario-consejos-gatos.jpg" 
              alt="Mascota feliz" 
              className="relative z-10 w-full h-full object-cover rounded-full border-[6px] border-white/10 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};