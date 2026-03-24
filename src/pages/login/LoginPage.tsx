import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

import { useLogin } from './hooks/useLogin';
import { ButtonTheme } from './components/ButtonTheme';
import { LogoLogin } from './components/LogoLogin';
import { CharacterLogin } from './components/CharacterLogin';
import { FormLogin } from './components/FormLogin';
import { AuthLink } from './components/AuthLink';

export const LoginPage = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const loginData = useLogin();

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleTheme = () => setIsDarkMode(!isDarkMode);

    return (
        <div className={`min-h-screen font-sans ${isDarkMode ? 'dark' : ''}`}>
            <div className="flex min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors duration-300">
                
                {/* Panel Izquierdo (Oculto en móviles) */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] text-white p-12 flex-col justify-between overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#3B82F6]/50 rounded-full blur-3xl"></div>

                    <LogoLogin isMobile={false} />

                    <div className="relative z-10 max-w-lg">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-sm font-medium mb-6 backdrop-blur-sm">
                            <ShieldCheck size={16} />
                            Acceso Seguro
                        </div>
                        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
                            Lleva tu clínica al <br />
                            <span className="text-blue-200">siguiente nivel.</span>
                        </h2>
                        <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                            El sistema integral diseñado exclusivamente para el cuidado, administración y bienestar de tus pacientes y tu negocio.
                        </p>
                    </div>

                    <div className="relative z-10 flex items-center gap-4 text-blue-200 text-sm">
                        <p>© 2026 Desarrollado por <strong>JOZ Team</strong></p>
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                        <p>V 1.0.0</p>
                    </div>
                </div>

                {/* Panel Derecho: Formulario de Login */}
                <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
                    
                    <ButtonTheme isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

                    <div className="w-full max-w-md flex flex-col items-center">
                        
                        <LogoLogin isMobile={true} />

                        <div className="text-center mb-8 flex flex-col items-center">
                            <CharacterLogin />
                            <h2 className="text-3xl font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-2 flex items-center justify-center gap-2">
                                ¡Hola de nuevo! 👋
                            </h2>
                            <p className="text-[#64748B] dark:text-[#94A3B8]">
                                Ingresa tus credenciales para acceder al sistema.
                            </p>
                        </div>

                        <FormLogin loginData={loginData} />

                        <AuthLink text="¿Problemas para acceder? Contacta a" href="#" align="center" />

                    </div>
                </div>

            </div>
        </div>
    );
};
