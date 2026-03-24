import React from 'react';

export const CategoriesSection = () => {
    const categorias = [
        { nombre: "Alimentos", img: "https://cdn.shopify.com/s/files/1/0102/3742/files/Ganador_936ee4de-362b-4b41-894f-0fbad4ba9e04.jpg?v=1611158640" },
        { nombre: "Farmacia", img: "https://federacionveterinaria.com.ar/wp-content/uploads/2024/03/6803d5a3-686b-4c3e-b4d4-90b2d73ae466.jpg" },
        { nombre: "Accesorios", img: "https://i5.walmartimages.com/asr/64353295-9a4b-44ef-8e73-c7cf4e89fc05.f4bd7b00e29264b4ed6ee137c391558f.jpeg" },
        { nombre: "Higiene", img: "https://clinicavpro.es/wp-content/uploads/2022/10/vpro-imagen-blog-1080x675.jpg" },
        { nombre: "Juguetes", img: "https://images.squarespace-cdn.com/content/v1/57a2aeb1ff7c509ef76566c9/1736963454030-XRKUZEM7SJMO2UJUYD5Z/Juguetes-para-mascota.jpg?format=2500w" }
    ];

    return (
        <section>
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Explora por Categoría</h3>
        </div>
        <div className="flex overflow-x-auto pb-4 gap-6 hide-scrollbar">
            {categorias.map((cat, index) => (
            <div key={index} className="flex flex-col items-center gap-3 cursor-pointer group min-w-[80px] sm:min-w-[100px]">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#3B82F6] transition-all p-1">
                <img src={cat.img} alt={cat.nombre} className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] group-hover:text-[#3B82F6] dark:group-hover:text-[#3B82F6] transition-colors">{cat.nombre}</span>
            </div>
            ))}
        </div>
        </section>
    );
};
