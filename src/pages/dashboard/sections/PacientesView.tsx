import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical, AlertTriangle, PawPrint, Loader2, Edit2, Trash2, X, Tag } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Importamos el Modal de Nuevo Paciente
import { NuevoPacienteModal } from '../components/NuevoPacienteModal';

// ==========================================
// 1. DEFINICIÓN DE QUERIES Y MUTACIONES
// ==========================================
// Añadimos id_cliente a la consulta para saber quién es el dueño actual
const GET_PACIENTES = gql`
    query GetPacientes {
            pacientes {
            id_paciente
            nombre
            especie
            raza
            fecha_nacimiento
            genero
            color
            alergias
            cliente {
                id_cliente
                nombre_completo
            }
            }
    }
`;

// Agregamos la query de clientes para el select de edición
const GET_CLIENTES_DROPDOWN = gql`
    query GetClientesDropdown {
            clientes {
            id_cliente
            nombre_completo
            }
    }
`;

const DELETE_PACIENTE = gql`
    mutation DeletePaciente($id: Int!) {
        removePaciente(id: $id)
    }
`;

const UPDATE_PACIENTE = gql`
    mutation UpdatePaciente($input: UpdatePacienteInput!) {
            updatePaciente(updatePacienteInput: $input) {
            id_paciente
            nombre
            especie
            raza
            fecha_nacimiento
            genero
            color
            alergias
            cliente {
                id_cliente
                nombre_completo
            }
            }
    }
`;

// ==========================================
// 2. INTERFACES TYPESCRIPT
// ==========================================
interface ClienteDropdown {
    id_cliente: number;
    nombre_completo: string;
}

interface GetClientesResponse {
    clientes: ClienteDropdown[];
}

interface Paciente {
    id_paciente: number;
    nombre: string;
    especie: string;
    raza: string;
    fecha_nacimiento: string;
    genero: string;
    color: string;
    alergias: string | null;
    cliente: {
        id_cliente: number;
        nombre_completo: string;
    };
}

interface GetPacientesResponse {
    pacientes: Paciente[];
}

// ==========================================
// 3. COMPONENTES MODALES AUXILIARES (Editar y Eliminar)
// ==========================================

// --- MODAL DE ELIMINAR ---
const ModalEliminar = ({ isOpen, paciente, onClose }: { isOpen: boolean, paciente: Paciente | null, onClose: () => void }) => {
    const [deletePaciente, { loading, error }] = useMutation(DELETE_PACIENTE, {
        refetchQueries: ['GetPacientes'] // Recargamos la tabla al terminar
    });

    const handleDelete = async () => {
        if (!paciente) return;
        try {
        await deletePaciente({ variables: { id: paciente.id_paciente } });
        onClose();
        } catch (err) {
        console.error(err);
        }
    };

    if (!isOpen || !paciente) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
            <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar a {paciente.nombre}?</h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] mb-6">
            Esta acción borrará permanentemente el expediente de este paciente. No podrás deshacer este cambio.
            </p>
            
            {error && <p className="text-rose-500 text-sm mb-4">Error: {error.message}</p>}

            <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">Cancelar</Button>
            <Button onClick={handleDelete} disabled={loading} className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Sí, Eliminar"}
            </Button>
            </div>
        </div>
        </div>
    );
};

// --- MODAL DE EDITAR ---
const ModalEditar = ({ isOpen, paciente, onClose }: { isOpen: boolean, paciente: Paciente | null, onClose: () => void }) => {
    const [formData, setFormData] = useState({ 
        cliente_id: '', // Agregamos el ID del dueño al estado
        nombre: '', especie: '', raza: '', alergias: '', 
        fecha_nacimiento: '', genero: '', color: '' 
    });

    // Obtenemos la lista de clientes disponibles
    const { data: clientesData, loading: loadingClientes } = useQuery<GetClientesResponse>(GET_CLIENTES_DROPDOWN, {
        skip: !isOpen
    });

    // Pre-llenar el formulario cuando se abre el modal con un paciente
    useEffect(() => {
        if (paciente) {
        setFormData({
            cliente_id: paciente.cliente?.id_cliente ? paciente.cliente.id_cliente.toString() : '',
            nombre: paciente.nombre,
            especie: paciente.especie,
            raza: paciente.raza,
            // Cortamos el ISO para quedarnos solo con YYYY-MM-DD
            fecha_nacimiento: paciente.fecha_nacimiento ? paciente.fecha_nacimiento.substring(0, 10) : '',
            genero: paciente.genero || 'Macho',
            color: paciente.color || '',
            alergias: paciente.alergias || ''
        });
        }
    }, [paciente]);

    const [updatePaciente, { loading, error }] = useMutation(UPDATE_PACIENTE, {
        refetchQueries: ['GetPacientes']
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!paciente) return;
        try {
        await updatePaciente({
            variables: {
            input: {
                id_paciente: paciente.id_paciente,
                cliente_id: parseInt(formData.cliente_id), // Enviamos el nuevo dueño
                nombre: formData.nombre,
                especie: formData.especie,
                raza: formData.raza,
                fecha_nacimiento: formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento).toISOString() : null,
                genero: formData.genero,
                color: formData.color,
                alergias: formData.alergias.trim() !== '' ? formData.alergias : null
            }
            }
        });
        onClose();
        } catch (err) {
        console.error(err);
        }
    };

    if (!isOpen || !paciente) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Editar Paciente</h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Modificando expediente de: {paciente.nombre}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 transition-colors">
                <X size={20} />
            </button>
            </div>

            <div className="p-6 overflow-y-auto">
            <form id="editForm" onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{error.message}</div>}
                
                {/* Selección de Cambio de Dueño */}
                <div className="p-4 bg-blue-50 dark:bg-blue-500/5 rounded-[16px] border border-blue-100 dark:border-blue-500/10">
                <Label className="mb-2 text-[#3B82F6]">Propietario de la Mascota</Label>
                <div className="relative">
                    <select 
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all appearance-none cursor-pointer"
                    >
                    <option value="">Selecciona un dueño...</option>
                    {clientesData?.clientes.map(cliente => (
                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre_completo}
                        </option>
                    ))}
                    </select>
                    {loadingClientes && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Nombre del Paciente</Label>
                    <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={Tag} required />
                </div>
                
                <div className="space-y-2">
                    <Label>Fecha de Nacimiento</Label>
                    <input 
                    type="date" 
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pl-11 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all" 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Especie</Label>
                    <select name="especie" value={formData.especie} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all appearance-none">
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Ave">Ave</option>
                    <option value="Reptil">Reptil</option>
                    <option value="Pequeño Mamífero">Pequeño Mamífero</option>
                    <option value="Otro">Otro</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Raza</Label>
                    <Input name="raza" value={formData.raza} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                    <Label>Género</Label>
                    <select name="genero" value={formData.genero} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all appearance-none">
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Color / Rasgos</Label>
                    <Input name="color" value={formData.color} onChange={handleChange} required />
                </div>
                </div>

                <div className="space-y-2">
                <Label className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle size={16} /> Alergias Conocidas
                </Label>
                <Textarea name="alergias" value={formData.alergias} onChange={handleChange} rows={3} placeholder="Describe si el paciente tiene alergias..." className="border-rose-200 focus:ring-rose-500/50 focus:border-rose-500" />
                </div>
            </form>
            </div>

            <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
            <Button variant="outline" onClick={onClose} disabled={loading} className="!w-full sm:!w-auto">Cancelar</Button>
            <Button type="submit" form="editForm" variant="primary" disabled={loading} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
            </Button>
            </div>
        </div>
        </div>
    );
};

// ==========================================
// 4. VISTA PRINCIPAL (PACIENTES VIEW)
// ==========================================
export const PacientesView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estados para controlar los Modales
    const [isModalNewOpen, setIsModalNewOpen] = useState(false);
    const [pacienteAEditar, setPacienteAEditar] = useState<Paciente | null>(null);
    const [pacienteAEliminar, setPacienteAEliminar] = useState<Paciente | null>(null);
    
    const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

    const { data, loading, error } = useQuery<GetPacientesResponse>(GET_PACIENTES);

    const calcularEdad = (fechaISO: string) => {
        if (!fechaISO) return 'Desconocida';
        const hoy = new Date();
        const nacimiento = new Date(fechaISO);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
        if (edad <= 0) {
        let meses = hoy.getMonth() - nacimiento.getMonth();
        if (meses <= 0) meses += 12;
        return `${meses} meses`;
        }
        return `${edad} años`;
    };

    const getAvatarColor = (nombre: string) => {
        const colors = ['bg-amber-100 text-amber-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-rose-100 text-rose-600'];
        const index = nombre.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const pacientesFiltrados = data?.pacientes.filter((paciente) => {
        const busqueda = searchTerm.toLowerCase();
        return (
        paciente.nombre.toLowerCase().includes(busqueda) ||
        paciente.especie.toLowerCase().includes(busqueda) ||
        paciente.cliente.nombre_completo.toLowerCase().includes(busqueda)
        );
    }) || [];

    return (
        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <PawPrint className="text-[#3B82F6]" size={28}/> 
                Directorio de Pacientes
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Gestiona los expedientes médicos e historiales clínicos.</p>
            </div>
            <Button variant="primary" className="!px-5 !py-2.5 shadow-md" onClick={() => setIsModalNewOpen(true)}>
            <Plus size={18} /> Nuevo Paciente
            </Button>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
            <Input 
                icon={Search}
                type="text" 
                placeholder="Buscar por nombre de mascota, especie o dueño..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]"
            />
            </div>
            <Button variant="outline" className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8]">
            <Filter size={18} /> Filtros
            </Button>
        </div>

        {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-[#3B82F6]">
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className="font-medium text-[#64748B] dark:text-[#94A3B8]">Descargando expedientes de pacientes...</p>
            </div>
        )}

        {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold">
            Error de conexión: {error.message}
            </div>
        )}

        {!loading && !error && (
            <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
            <div className="overflow-x-auto overflow-y-visible pb-24 -mb-24">
                <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                    <tr>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Paciente</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Especie / Raza</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Dueño</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Alergias</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {pacientesFiltrados.length > 0 ? (
                    pacientesFiltrados.map((paciente) => {
                        const tieneAlergias = paciente.alergias && paciente.alergias.trim().toLowerCase() !== 'ninguna';
                        return (
                        <tr key={paciente.id_paciente} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                            <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(paciente.nombre)}`}>
                                {paciente.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                <p className="font-bold text-[#0F172A] dark:text-white text-base">{paciente.nombre}</p>
                                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{calcularEdad(paciente.fecha_nacimiento)}</p>
                                </div>
                            </div>
                            </td>
                            <td className="px-6 py-4">
                            <p className="font-medium text-[#0F172A] dark:text-white">{paciente.especie}</p>
                            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{paciente.raza}</p>
                            </td>
                            <td className="px-6 py-4">
                            <span className="font-medium text-[#64748B] dark:text-[#94A3B8]">{paciente.cliente.nombre_completo}</span>
                            </td>
                            <td className="px-6 py-4">
                            {tieneAlergias ? (
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
                                <AlertTriangle size={14} /> {paciente.alergias}
                                </div>
                            ) : (
                                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#0F172A] px-2.5 py-1 rounded-full border border-black/5 dark:border-white/5">
                                Ninguna
                                </span>
                            )}
                            </td>
                            <td className="px-6 py-4 text-right relative">
                            <button className="text-[#3B82F6] font-medium text-sm hover:underline mr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver Expediente
                            </button>
                            
                            {/* Botón de Acciones */}
                            <button 
                                onClick={() => setMenuAbierto(menuAbierto === paciente.id_paciente ? null : paciente.id_paciente)}
                                className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                            >
                                <MoreVertical size={18} />
                            </button>

                            {/* Menú Desplegable */}
                            {menuAbierto === paciente.id_paciente && (
                                <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                                <div className="absolute right-8 top-10 w-36 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                                    
                                    {/* DISPARADOR EDITAR */}
                                    <button 
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                        setPacienteAEditar(paciente);
                                        setMenuAbierto(null);
                                    }}
                                    >
                                    <Edit2 size={16} /> Editar
                                    </button>
                                    
                                    {/* DISPARADOR ELIMINAR */}
                                    <button 
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                                    onClick={() => {
                                        setPacienteAEliminar(paciente);
                                        setMenuAbierto(null);
                                    }}
                                    >
                                    <Trash2 size={16} /> Eliminar
                                    </button>

                                </div>
                                </>
                            )}
                            </td>
                        </tr>
                        );
                    })
                    ) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-[#64748B] dark:text-[#94A3B8] text-base">No se encontraron pacientes que coincidan con la búsqueda.</p>
                        </td>
                    </tr>
                    )}
                </tbody>
                </table>
            </div>
            </div>
        )}

        {/* Renderizado Condicional de Modales */}
        <NuevoPacienteModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
        <ModalEditar isOpen={!!pacienteAEditar} paciente={pacienteAEditar} onClose={() => setPacienteAEditar(null)} />
        <ModalEliminar isOpen={!!pacienteAEliminar} paciente={pacienteAEliminar} onClose={() => setPacienteAEliminar(null)} />
        
        </div>
    );
};