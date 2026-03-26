import React, { useState } from 'react';
import { X, User, Lock, Phone, MapPin, Loader2, ShieldCheck, Contact } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Mutación combinada proporcionada por el Backend
const REGISTER_NEW_CLIENTE = gql`
    mutation RegisterNewCliente($input: RegisterClienteInput!) {
            registerNewCliente(input: $input) {
            id_cliente
            nombre_completo
            usuario {
                username
                activo
            }
            }
    }
`;

interface NuevoClienteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NuevoClienteModal: React.FC<NuevoClienteModalProps> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        username: '',
        password_hash: '',
        nombre_completo: '',
        telefono_principal: '',
        direccion: ''
    });

    const [registerCliente, { loading: saving, error: saveError }] = useMutation(REGISTER_NEW_CLIENTE, {
        // Recargamos la tabla de clientes para que el nuevo aparezca de inmediato
        refetchQueries: ['GetClientesDirectorio']
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        await registerCliente({
            variables: {
            input: {
                username: formData.username.trim(),
                password_hash: formData.password_hash,
                nombre_completo: formData.nombre_completo,
                telefono_principal: formData.telefono_principal,
                direccion: formData.direccion
            }
            }
        });
        
        // Limpiamos y cerramos
        setFormData({
            username: '', password_hash: '', nombre_completo: '', telefono_principal: '', direccion: ''
        });
        onClose();
        
        } catch (err) {
        console.error("Error al registrar cliente:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Registrar Nuevo Cliente</h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Crea las credenciales web y el perfil del propietario.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                <X size={20} />
            </button>
            </div>

            {/* Body / Formulario */}
            <div className="p-6 overflow-y-auto">
            <form id="clienteForm" onSubmit={handleSubmit} className="space-y-8">
                
                {saveError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg border border-rose-200 dark:border-rose-500/20">
                    Ocurrió un error: {saveError.message}
                </div>
                )}

                {/* SECCIÓN 1: Credenciales Web */}
                <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-[20px] border border-blue-100 dark:border-blue-500/10 space-y-4">
                <div className="flex items-center gap-2 text-[#3B82F6] font-bold mb-2">
                    <ShieldCheck size={20} />
                    <h3>Credenciales de Acceso (Portal Web)</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Nombre de Usuario</Label>
                    <Input 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        icon={User} 
                        placeholder="Ej. carlos.mendoza" 
                        required 
                        className="bg-white dark:bg-[#0F172A]"
                    />
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">El cliente usará esto para iniciar sesión.</p>
                    </div>
                    <div className="space-y-2">
                    <Label>Contraseña Temporal</Label>
                    <Input 
                        name="password_hash"
                        type="text"
                        value={formData.password_hash}
                        onChange={handleChange}
                        icon={Lock} 
                        placeholder="Contraseña inicial" 
                        required 
                        className="bg-white dark:bg-[#0F172A]"
                    />
                    </div>
                </div>
                </div>

                {/* SECCIÓN 2: Datos Personales */}
                <div className="space-y-4">
                <div className="flex items-center gap-2 text-[#0F172A] dark:text-white font-bold mb-2">
                    <Contact size={20} className="text-[#64748B]" />
                    <h3>Datos Personales y Contacto</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                    <Label>Nombre Completo</Label>
                    <Input 
                        name="nombre_completo"
                        value={formData.nombre_completo}
                        onChange={handleChange}
                        icon={User} 
                        placeholder="Ej. Carlos Mendoza Rodríguez" 
                        required 
                    />
                    </div>
                    
                    <div className="space-y-2">
                    <Label>Teléfono Principal</Label>
                    <Input 
                        name="telefono_principal"
                        type="tel"
                        value={formData.telefono_principal}
                        onChange={handleChange}
                        icon={Phone} 
                        placeholder="Ej. 555 123 4567" 
                        required 
                    />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                    <Label>Dirección Completa</Label>
                    <div className="relative">
                        <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                        <MapPin size={20} />
                        </div>
                        <Textarea 
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        rows={2} 
                        placeholder="Calle, Número, Colonia, Código Postal..."
                        className="pl-11"
                        required
                        />
                    </div>
                    </div>
                </div>
                </div>

            </form>
            </div>

            {/* Footer / Botones */}
            <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
            <Button variant="outline" onClick={onClose} disabled={saving} className="!w-full sm:!w-auto">
                Cancelar
            </Button>
            <Button type="submit" form="clienteForm" disabled={saving} variant="primary" className="!w-full sm:!w-auto flex items-center justify-center gap-2">
                {saving ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> Registrando...
                </>
                ) : (
                "Registrar Cliente"
                )}
            </Button>
            </div>

        </div>
        </div>
    );
};