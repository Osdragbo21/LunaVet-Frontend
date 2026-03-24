import React from 'react';

export const CharacterLogin = () => (
    <div className="relative mb-6">
        <div className="absolute -inset-8 rounded-full blur-[40px] bg-[#3B82F6]/40 dark:bg-[#3B82F6]/60 animate-pulse"></div>
        <img 
            src="/Cat_c.png" 
            alt="Imagen de Bienvenida" 
            className="relative z-10 w-24 h-24 object-cover rounded-full drop-shadow-xl border-2 border-[#FFFFFF] dark:border-[#1E293B]"
            onError={(e: any) => { e.target.onerror = null; e.target.src = "[https://i.pinimg.com/736x/80/cb/09/80cb09eb583ea2cd092576bde139c8eb.jpg](https://i.pinimg.com/736x/80/cb/09/80cb09eb583ea2cd092576bde139c8eb.jpg)"; }}
        />
    </div>
);


