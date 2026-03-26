import React, { useState } from 'react';
import { Search, Filter, Plus, MoreVertical, Users, Phone, MapPin, ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

// Importaciones directas de Apollo (Bypass para Vite)
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// 1. Definimos la Query proporcionada por el Backend
const GET_CLIENTES_DIRECTORIO = gql`
    query GetClientesDirectorio {
            clientes {
            id_cliente
            nombre_completo
            telefono_principal
            direccion
            usuario {
                username
                activo
            }
            pacientes {
                nombre
                especie
            }
            }
    }
`;

// 2. Interfaces de TypeScript para la respuesta
interface PacienteBasico {
    nombre: string;
    especie: string;
}

interface UsuarioBasico {
    username: string;
    activo: boolean;
}

interface Cliente {
    id_cliente: number;
    nombre_completo: string;
    telefono_principal: string;
    direccion: string;
    usuario: UsuarioBasico;
    pacientes: PacienteBasico[];
}

interface GetClientesResponse {
    clientes: Cliente[];
}

export const ClientesView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

    // Ejecutamos la consulta
    const { data, loading, error } = useQuery<GetClientesResponse>(GET_CLIENTES_DIRECTORIO);

    // Generador de colores para el avatar
    const getAvatarColor = (nombre: string) => {
        const colors = ['bg-indigo-100 text-indigo-600', 'bg-teal-100 text-teal-600', 'bg-fuchsia-100 text-fuchsia-600', 'bg-orange-100 text-orange-600', 'bg-cyan-100 text-cyan-600'];
        const index = nombre.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Filtrado dinámico en memoria
    const clientesFiltrados = data?.clientes.filter((cliente) => {
        const busqueda = searchTerm.toLowerCase();
        return (
        cliente.nombre_completo.toLowerCase().includes(busqueda) ||
        cliente.telefono_principal.includes(busqueda) ||
        cliente.usuario.username.toLowerCase().includes(busqueda)
        );
    }) || [];

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Users className="text-[#3B82F6]" size={28}/> 
                Directorio de Clientes
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Gestiona a los propietarios, sus credenciales y mascotas vinculadas.</p>
            </div>
            <Button variant="primary" className="!px-5 !py-2.5 shadow-md">
            <Plus size={18} /> Nuevo Cliente
            </Button>
        </div>

        {/* Buscador */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
            <Input 
                icon={Search}
                type="text" 
                placeholder="Buscar por nombre, teléfono o nombre de usuario..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]"
            />
            </div>
            <Button variant="outline" className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8]">
            <Filter size={18} /> Filtros
            </Button>
        </div>

        {/* Estados de Carga y Error */}
        {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#3B82F6]">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-medium text-[#64748B] dark:text-[#94A3B8]">Cargando directorio de clientes...</p>
            </div>
        )}

        {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold">
            Error de conexión: {error.message}
            </div>
        )}

        {/* Tabla de Clientes */}
        {!loading && !error && (
            <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
            <div className="overflow-x-auto overflow-y-visible pb-24 -mb-24">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                    <tr>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Propietario</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Contacto</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Credenciales Web</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Mascotas</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((cliente) => (
                        <tr key={cliente.id_cliente} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        
                        {/* PROPIETARIO */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(cliente.nombre_completo)}`}>
                                {cliente.nombre_completo.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-[#0F172A] dark:text-white text-base">{cliente.nombre_completo}</p>
                                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 mt-0.5">
                                <MapPin size={12} /> {cliente.direccion.length > 25 ? cliente.direccion.substring(0, 25) + '...' : cliente.direccion}
                                </p>
                            </div>
                            </div>
                        </td>

                        {/* CONTACTO */}
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-[#0F172A] dark:text-white font-medium">
                            <Phone size={14} className="text-[#64748B]" /> 
                            {cliente.telefono_principal}
                            </div>
                        </td>

                        {/* CREDENCIALES / USUARIO */}
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                            <span className="font-medium text-[#3B82F6]">@{cliente.usuario.username}</span>
                            {cliente.usuario.activo ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                <ShieldCheck size={12} /> Cuenta Activa
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                                <ShieldAlert size={12} /> Suspendida
                                </span>
                            )}
                            </div>
                        </td>

                        {/* MASCOTAS VINCULADAS */}
                        <td className="px-6 py-4">
                            {cliente.pacientes.length > 0 ? (
                            <div className="flex -space-x-2 overflow-hidden">
                                {cliente.pacientes.map((mascota, i) => (
                                <div key={i} title={`${mascota.nombre} (${mascota.especie})`} className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 flex items-center justify-center text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                                    {mascota.nombre.charAt(0)}
                                </div>
                                ))}
                            </div>
                            ) : (
                            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#0F172A] px-2.5 py-1 rounded-full border border-black/5 dark:border-white/5">
                                Sin mascotas
                            </span>
                            )}
                        </td>

                        {/* ACCIONES */}
                        <td className="px-6 py-4 text-right relative">
                            <button className="text-[#3B82F6] font-medium text-sm hover:underline mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver Perfil
                            </button>
                            <button 
                            onClick={() => setMenuAbierto(menuAbierto === cliente.id_cliente ? null : cliente.id_cliente)}
                            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                            >
                            <MoreVertical size={18} />
                            </button>

                            {/* Menú Desplegable (Placeholder para futuras acciones) */}
                            {menuAbierto === cliente.id_cliente && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                                <div className="absolute right-8 top-10 w-40 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-lg border border-black/5 py-2 z-20">
                                <button className="w-full text-left px-4 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5">Editar Cliente</button>
                                <button className="w-full text-left px-4 py-2 text-sm text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5">Añadir Mascota</button>
                                </div>
                            </>
                            )}
                        </td>
                        </tr>
                    ))
                    ) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-[#64748B] dark:text-[#94A3B8] text-base">No se encontraron clientes que coincidan con la búsqueda.</p>
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            </div>
        )}
        </div>
    );
};