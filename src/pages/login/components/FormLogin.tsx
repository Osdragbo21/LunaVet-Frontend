import React from 'react';
import { User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

// Importamos los componentes base de UI reutilizables
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

// Nota: Asumiendo que Label también lo moviste a ui/. Si no, puedes usar una etiqueta <label> nativa.
// import { Label } from '../../../components/ui/Label';

export const FormLogin = ({ loginData }: { loginData: any }) => {
    const {
        username, setUsername,
        password, setPassword,
        showPassword, togglePassword,
        isLoading, handleLogin
    } = loginData;

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
                            placeholder="ej: admin.vet"
                            className="pl-11"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] block text-left">Contraseña</label>
                        <a href="#" className="text-sm font-medium text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-colors">
                            ¿La olvidaste?
                        </a>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                            <Lock size={20} />
                        </div>
                        <Input 
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center text-left">
                    <input
                        id="remember-me"
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 accent-[#3B82F6] cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-[#64748B] dark:text-[#94A3B8] cursor-pointer">
                        Mantener sesión iniciada
                    </label>
                </div>

                <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2" disabled={isLoading}>
                    {isLoading ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Iniciar Sesión</span>
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </Button>

                </form>
            </div>
        </div>
    );
};