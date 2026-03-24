import React from 'react';
import { Heart, Star } from 'lucide-react';

export const ProductsGrid = () => {
    const productos = [
        { 
        id: 1, 
        titulo: "Croquetas Royal Canin Adulto 8kg", 
        precio: 1250, 
        precioOriginal: 1450, 
        descuento: "14% OFF", 
        entrega: "Recoge hoy", 
        rating: 4.8,
        reviews: 124,
        img: "https://www.mascotasyaccesorios.mx/cdn/shop/files/Royal-Canin-Weigth-Control-1_800x.jpg?v=1695690677" 
        },
        { 
        id: 2, 
        titulo: "NexGard Spectra Desparasitante 15-30kg", 
        precio: 450, 
        precioOriginal: null, 
        descuento: null, 
        entrega: "Recoge en 2 horas", 
        rating: 4.9,
        reviews: 89,
        img: "https://mypets.mx/cdn/shop/files/M1NESPG_1200x.jpg?v=1705190983" 
        },
        { 
        id: 3, 
        titulo: "Cama Ortopédica para Perro Talla Grande", 
        precio: 899, 
        precioOriginal: 1100, 
        descuento: "18% OFF", 
        entrega: "Recoge hoy", 
        rating: 4.7,
        reviews: 42,
        img: "https://i5.walmartimages.com/asr/640d9734-f890-41a9-8b78-07f46aaaca1a.2ac5e9d4962fe3c9660aacaab7a14277.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF" 
        },
        { 
        id: 4, 
        titulo: "Shampoo Avena y Sábila Piel Sensible 500ml", 
        precio: 185, 
        precioOriginal: 220, 
        descuento: "15% OFF", 
        entrega: "Recoge en 2 horas", 
        rating: 4.6,
        reviews: 210,
        img: "https://m.media-amazon.com/images/I/61NihOx0W5L._AC_UF1000,1000_QL80_.jpg" 
        }
    ];

    return (
        <section>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            Inspirado en lo último que compraste
            </h3>
            <a href="#" className="text-sm font-medium text-[#3B82F6] hover:underline hidden sm:block">Ver todos</a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((prod) => (
            <div key={prod.id} className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[16px] border border-black/5 dark:border-white/5 overflow-hidden hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_30px_-10px_rgba(255,255,255,0.05)] transition-all duration-300 group flex flex-col">
                {/* Imagen y Favorito */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
                <img src={prod.img} alt={prod.titulo} className="h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-lg" />
                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 dark:bg-[#0F172A]/80 text-gray-400 hover:text-rose-500 transition-colors backdrop-blur-sm">
                    <Heart size={18} />
                </button>
                {prod.descuento && (
                    <span className="absolute bottom-3 left-3 bg-[#3B82F6] text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    {prod.descuento}
                    </span>
                )}
                </div>
                
                {/* Detalles del Producto */}
                <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-1 mb-2 text-yellow-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] ml-1">{prod.rating} ({prod.reviews})</span>
                </div>
                
                <h4 className="text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] leading-tight mb-3 line-clamp-2 flex-1 group-hover:text-[#3B82F6] transition-colors">
                    {prod.titulo}
                </h4>
                
                <div className="mt-auto">
                    {prod.precioOriginal && (
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] line-through block mb-0.5">
                        ${prod.precioOriginal}
                    </span>
                    )}
                    <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-bold text-[#0F172A] dark:text-white leading-none">${prod.precio}</span>
                    </div>
                    
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-4">
                    {prod.entrega}
                    </span>
                    
                    <button className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#3B82F6] hover:text-white text-[#3B82F6] border border-[#3B82F6]/30 px-4 py-2.5 rounded-[10px] font-bold text-sm transition-all duration-200">
                    Agregar al carrito
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
        </section>
    );
};
