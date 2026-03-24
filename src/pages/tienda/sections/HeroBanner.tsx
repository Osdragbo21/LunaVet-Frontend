import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const HeroBanner = () => {
    return (
        <div className="relative w-full h-48 sm:h-64 md:h-80 rounded-[24px] overflow-hidden group cursor-pointer shadow-sm border border-black/5 dark:border-white/5">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] dark:from-[#0F172A] dark:to-[#1E293B]"></div>
        
        {/* Partículas sutiles en el banner */}
        <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-1/4 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-4 right-1/3 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16">
            <div className="text-white max-w-lg z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/30 uppercase tracking-widest">
                Semana de la Salud
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 leading-tight text-white drop-shadow-md">
                Hasta 30% OFF <br/>en Desparasitantes
            </h2>
            <p className="hidden sm:block text-blue-100 mb-6">Protege a tu mascota con las mejores marcas. Cómpralo online y pasa a recogerlo a la clínica en 2 horas.</p>
            <button className="bg-white text-[#3B82F6] hover:bg-gray-50 px-6 py-2.5 rounded-full font-bold transition-all shadow-md">
                Ver Ofertas
            </button>
            </div>
            <div className="hidden md:block relative z-10 h-full w-1/3 flex items-center justify-center">
                <img src="https://veterinariasedavi.com/new/wp-content/uploads/2020/11/planes-salud-perro-clinica-veterinaria-sedavi.jpg" alt="Mascota" className="object-cover h-48 w-48 rounded-full border-4 border-white/20 shadow-2xl mix-blend-luminosity opacity-80" />
            </div>
        </div>
        
        {/* Controles del Carrusel (Estéticos) */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40">
            <ChevronLeft size={24} />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40">
            <ChevronRight size={24} />
        </button>
        </div>
    );
};
