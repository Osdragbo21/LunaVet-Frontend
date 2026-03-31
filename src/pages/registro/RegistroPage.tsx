import React, { useState, useEffect } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, MapPin, Phone, CheckCircle, Sun, Moon } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useRegistro } from './hooks/useRegistro';

export const RegistroPage = () => {
    // Estado para el modo oscuro
    const [isDarkMode, setIsDarkMode] = useState(false);

    const {
        formData, handleChange,
        showPassword, togglePassword,
        isLoading, errorMsg, successMsg,
        handleRegistro
    } = useRegistro();

    // Efecto para aplicar la clase 'dark' al HTML
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
            <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
                
                {/* Botón para alternar Modo Oscuro */}
                <button 
                    onClick={toggleTheme}
                    className="absolute top-6 right-6 sm:top-8 sm:right-8 p-3 rounded-xl bg-[#FFFFFF] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border border-black/10 dark:border-white/5 hover:text-[#3B82F6] dark:hover:text-[#3B82F6] shadow-sm transition-all duration-200 z-50"
                    aria-label="Alternar modo oscuro"
                >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Sistema de Partículas de Fondo General */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#3B82F6]/10 dark:bg-[#3B82F6]/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="w-full max-w-md z-10 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8 mb-8">
                    
                    {/* Título e Imagen */}
                    <div className="text-center mb-8">
                        <div className="relative mb-6">
                            <div className="absolute -inset-8 rounded-full blur-[40px] bg-[#3B82F6]/40 dark:bg-[#3B82F6]/60 animate-pulse"></div>
                            <img 
                                src="/Cat_c.png" 
                                alt="Imagen de Bienvenida" 
                                className="relative z-10 w-24 h-24 object-cover rounded-full drop-shadow-xl border-2 border-[#FFFFFF] dark:border-[#1E293B] mx-auto"
                                onError={(e: any) => { e.target.onerror = null; e.target.src = "https://i.pinimg.com/736x/80/cb/09/80cb09eb583ea2cd092576bde139c8eb.jpg"; }}
                            />
                        </div>
                        <h1 className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">Únete a Luna Vet</h1>
                        <p className="text-[#64748B] dark:text-[#94A3B8] mt-2 font-medium">Crea tu cuenta para gestionar a tus mascotas.</p>
                    </div>

                    <div className="relative w-full">
                        {/* Sistema de Partículas alrededor del Formulario */}
                        <div className="absolute inset-0 pointer-events-none z-0">
                            <div className="absolute -top-8 -left-8 w-6 h-6 bg-[#3B82F6]/40 dark:bg-[#3B82F6]/60 rounded-full blur-md animate-pulse" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute top-1/4 -right-10 w-4 h-4 bg-[#3B82F6]/50 dark:bg-[#3B82F6]/70 rounded-full blur-sm animate-ping" style={{ animationDuration: '4s' }}></div>
                            <div className="absolute -bottom-10 left-1/3 w-8 h-8 bg-[#3B82F6]/30 dark:bg-[#3B82F6]/50 rounded-full blur-lg animate-pulse" style={{ animationDuration: '5s' }}></div>
                            <div className="absolute bottom-1/4 -left-12 w-3 h-3 bg-[#3B82F6]/60 dark:bg-[#3B82F6]/80 rounded-full blur-sm animate-bounce" style={{ animationDuration: '6s' }}></div>
                            <div className="absolute -top-4 right-1/4 w-5 h-5 bg-[#3B82F6]/40 dark:bg-[#3B82F6]/60 rounded-full blur-md animate-pulse" style={{ animationDuration: '2.5s' }}></div>
                        </div>
                        <div className="absolute -inset-3 rounded-[20px] blur-2xl bg-[#3B82F6]/25 dark:bg-[#3B82F6]/40 animate-pulse"></div>

                        <div className="relative bg-[#FFFFFF] dark:bg-[#1E293B] p-8 rounded-[20px] shadow-xl border border-black/5 dark:border-white/5">
                            
                            {successMsg ? (
                                <div className="py-8 text-center animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¡Cuenta Creada!</h3>
                                    <p className="text-[#64748B] dark:text-[#94A3B8]">Redirigiendo al inicio de sesión...</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRegistro} className="space-y-5">
                                    
                                    {errorMsg && (
                                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-[10px] text-sm font-bold text-center">
                                            {errorMsg}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Nombre Completo</label>
                                        <Input name="nombre_completo" type="text" value={formData.nombre_completo} onChange={handleChange} icon={User} placeholder="Ej. Juan Pérez" required className="bg-white dark:bg-[#0F172A]" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Teléfono</label>
                                            <Input name="telefono_principal" type="tel" value={formData.telefono_principal} onChange={handleChange} icon={Phone} placeholder="10 dígitos" required className="bg-white dark:bg-[#0F172A]" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Usuario</label>
                                            <Input name="username" type="text" value={formData.username} onChange={handleChange} icon={User} placeholder="usuario123" required className="bg-white dark:bg-[#0F172A]" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Dirección</label>
                                        <Input name="direccion" type="text" value={formData.direccion} onChange={handleChange} icon={MapPin} placeholder="Tu calle, colonia..." required className="bg-white dark:bg-[#0F172A]" />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Contraseña</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                                                <Lock size={20} />
                                            </div>
                                            <Input 
                                                name="passwordHash"
                                                type={showPassword ? "text" : "password"}
                                                value={formData.passwordHash}
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                                className="pl-11 pr-12 bg-white dark:bg-[#0F172A]"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#3B82F6] transition-colors">
                                                <button type="button" onClick={togglePassword}>
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 mt-4" disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <><span>Comenzar ahora</span> <ArrowRight size={18} /></>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </div>

                    {!successMsg && (
                        <div className="mt-8 text-center text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">
                            ¿Ya tienes una cuenta?{' '}
                            <a href="/login" className="text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-colors">
                                Inicia sesión aquí
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};