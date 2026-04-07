import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoLoginProps {
    isMobile: boolean;
}

export const LogoLogin: React.FC<LogoLoginProps> = ({ isMobile }) => {
    const navigate = useNavigate();

    if (isMobile) {
        return (
            <div onClick={() => navigate('/')} className="flex items-center gap-3 mb-10 lg:hidden justify-center w-full cursor-pointer hover:opacity-80 transition-opacity">
                <img 
                    src="/Logo_LunaVet.png" 
                    alt="Logo LunaVet" 
                    className="w-12 h-12 object-contain drop-shadow-md"
                    onError={(e: any) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1864/1864509.png"; }}
                />
                <h1 className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">LunaVet</h1>
            </div>
        );
    }

    return (
        <div onClick={() => navigate('/')} className="relative z-10 flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity w-fit">
            <img 
                src="/Logo_LunaVet.png" 
                alt="Logo LunaVet" 
                className="w-12 h-12 object-contain drop-shadow-md"
                onError={(e: any) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/1864/1864509.png"; }}
            />
            <h1 className="text-2xl font-bold tracking-tight text-white">LunaVet</h1>
        </div>
    );
};