import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight, Info, Phone, Mail, X } from 'lucide-react';

import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const FormLogin = ({ loginData }: { loginData: any }) => {
    const {
        username, setUsername,
        passwordHash, setPasswordHash,
        showPassword, togglePassword,
        isLoading, handleLogin,
        errorMsg 
    } = loginData;

    // Estado para la ventanita de soporte
    const [showSupport, setShowSupport] = useState(false);

    return (
        <div className="relative w-full">

            {/* Sistema de Partículas */}
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute -top-8 -left-8 w-6 h-6 bg-[#3B82F6]/40 dark:bg-[#3B82F6]/60 rounded-full blur-md animate-pulse" style={{ animationDuration: '3s' }}></div>
                <div className="absolute top-1/4 -right-10 w-4 h-4 bg-[#3B82F6]/50 dark:bg-[#3B82F6]/70 rounded-full blur-sm animate-ping" style={{ animationDuration: '4s' }}></div>
                <div className="absolute -bottom-10 left-1/3 w-8 h-8 bg-[#3B82F6]/30 dark:bg-[#3B82F6]/50 rounded-full blur-lg animate-pulse" style={{ animationDuration: '5s' }}></div>
                <div className="absolute bottom-1/4 -left-12 w-3 h-3 bg-[#3B82F6]/60 dark:bg-[#3B82F6]/80 rounded-full blur-sm animate-bounce" style={{ animationDuration: '6s' }}></div>
                <div className="absolute -top-4 right-1/4 w-5 h-5 bg-[#3B82F6]/40 dark:bg-[#3B82F6]/60 rounded-full blur-md animate-pulse" style={{ animationDuration: '2.5s' }}></div>
            </div>
            <div className="absolute -inset-3 rounded-[20px] blur-2xl bg-[#3B82F6]/25 dark:bg-[#3B82F6]/40 animate-pulse"></div>
            
            <div className="relative bg-[#FFFFFF] dark:bg-[#1E293B] p-8 rounded-[12px] border border-black/10 dark:border-white/5 shadow-sm transition-colors duration-300 w-full">
                
                <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Alerta de Error de Autenticación */}
                {errorMsg && (
                    <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-[10px] text-sm font-bold text-center">
                        {errorMsg}
                    </div>
                )}

                <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] block text-left">Usuario</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                            <User size={20} />
                        </div>
                        <Input 
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="ej: juan.perez11"
                            className="pl-11"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] block text-left">Contraseña</label>
                        <button type="button" onClick={() => setShowSupport(!showSupport)} className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-colors">
                            ¿La olvidaste?
                        </button>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                            <Lock size={20} />
                        </div>
                        <Input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={passwordHash}
                            onChange={(e) => setPasswordHash(e.target.value)}
                            placeholder="••••••••"
                            className="pl-11 pr-12"
                            required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] dark:text-[#94A3B8] hover:text-[#3B82F6] transition-colors">
                            <button type="button" onClick={togglePassword} aria-label="Mostrar contraseña">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info de Soporte Técnico */}
                {showSupport && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl relative animate-in fade-in zoom-in duration-200 text-left">
                        <button type="button" onClick={() => setShowSupport(false)} className="absolute top-2 right-2 text-blue-400 hover:text-blue-600"><X size={16}/></button>
                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5 mb-2"><Info size={16}/> Recuperación de Cuenta</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-200 mb-3">Contacta a soporte técnico para solicitar el restablecimiento de tu contraseña.</p>
                        <div className="space-y-1.5">
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2"><Phone size={14}/> +52 (71) 2270-0602</p>
                            <p className="text-xs font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2"><Mail size={14}/> soporte@lunavet.com</p>
                        </div>
                    </div>
                )}

                <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 mt-2" disabled={isLoading}>
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Iniciar Sesión</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>

                {/* Enlace para crear cuenta */}
                <div className="pt-2 text-center text-sm text-[#64748B] dark:text-[#94A3B8]">
                    ¿No tienes cuenta?{' '}
                    <a 
                        href="/registro" 
                        className="font-bold text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-colors"
                    >
                        Crear cuenta
                    </a>
                </div>

                </form>
            </div>
        </div>
    );
};