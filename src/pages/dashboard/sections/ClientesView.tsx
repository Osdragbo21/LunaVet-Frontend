import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, MoreVertical, Users, Phone, MapPin, 
  ShieldCheck, ShieldAlert, Loader2, Edit2, Ban, CheckCircle, 
  Trash2, X, Activity, Info, Calendar as CalendarIcon, PawPrint, 
  Tag, User, AlertTriangle // <-- ¡AQUÍ FALTABA IMPORTAR EL ÍCONO DE ALERTA!
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

// Importaciones directas de Apollo 
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Importamos modales
import { NuevoClienteModal } from '../components/NuevoClienteModal';
import { NuevoPacienteModal } from '../components/NuevoPacienteModal';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_CLIENTES_DIRECTORIO = gql`
  query GetClientesDirectorio {
    clientes {
      id_cliente
      nombre_completo
      telefono_principal
      direccion
      usuario {
        id_usuario
        username
        activo
      }
      pacientes {
        id_paciente
        nombre
        especie
        raza
        fecha_nacimiento
        genero
        color
        alergias
      }
    }
  }
`;

const UPDATE_CLIENTE = gql`
  mutation UpdateCliente($input: UpdateClienteInput!) {
    updateCliente(updateClienteInput: $input) {
      id_cliente
      nombre_completo
      telefono_principal
      direccion
    }
  }
`;

const TOGGLE_ESTADO_USUARIO = gql`
  mutation ToggleEstadoUsuario($id_usuario: Int!, $activo: Boolean!) {
    toggleEstadoUsuario(id_usuario: $id_usuario, activo: $activo) {
      id_usuario
      username
      activo
    }
  }
`;

// Mutaciones para interactuar con las mascotas desde esta vista
const UPDATE_PACIENTE = gql`
  mutation UpdatePaciente($input: UpdatePacienteInput!) {
    updatePaciente(updatePacienteInput: $input) {
      id_paciente
      nombre
    }
  }
`;

const DELETE_PACIENTE = gql`
    mutation DeletePaciente($id: Int!) {
        removePaciente(id: $id)
    }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface PacienteDetalle {
    id_paciente: number;
    nombre: string;
    especie: string;
    raza: string;
    fecha_nacimiento: string;
    genero: string;
    color: string;
    alergias: string | null;
}

interface UsuarioBasico {
    id_usuario: number;
    username: string;
    activo: boolean;
}

interface Cliente {
    id_cliente: number;
    nombre_completo: string;
    telefono_principal: string;
    direccion: string;
    usuario: UsuarioBasico;
    pacientes: PacienteDetalle[];
}

interface GetClientesResponse {
    clientes: Cliente[];
}

// ==========================================
// 3. FUNCIONES AUXILIARES GLOBALES
// ==========================================
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

// ==========================================
// 4. COMPONENTES MODALES AUXILIARES
// ==========================================

// --- MODAL DE FICHA DE MASCOTA ---
const ModalFichaMascota = ({ 
    isOpen, 
    mascota, 
    onClose, 
    onEdit, 
    onDelete 
    }: { 
    isOpen: boolean; 
    mascota: PacienteDetalle | null; 
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
    }) => {
    const [menuAbierto, setMenuAbierto] = useState(false);

    if (!isOpen || !mascota) return null;

    const avatarColor = getAvatarColor(mascota.nombre);
    const tieneAlergias = mascota.alergias && mascota.alergias.trim().toLowerCase() !== 'ninguna';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-sm overflow-visible flex flex-col animate-in zoom-in-95 duration-200 relative">
            
            {/* Top Header con menú de 3 puntos */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <div className="relative">
                <button 
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="p-1.5 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md rounded-full text-[#64748B] dark:text-white hover:bg-black/10 transition-colors shadow-sm"
                >
                <MoreVertical size={20} />
                </button>
                {menuAbierto && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(false)}></div>
                    <div className="absolute right-0 top-10 w-36 bg-[#FFFFFF] dark:bg-[#0F172A] rounded-[12px] shadow-lg border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <button 
                        onClick={() => { onEdit(); setMenuAbierto(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                        <Edit2 size={16} /> Editar
                    </button>
                    <button 
                        onClick={() => { onDelete(); setMenuAbierto(false); }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Eliminar
                    </button>
                    </div>
                </>
                )}
            </div>
            <button onClick={onClose} className="p-1.5 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-md rounded-full text-[#64748B] dark:text-white hover:bg-rose-500 hover:text-white transition-colors shadow-sm">
                <X size={20} />
            </button>
            </div>

            {/* Ficha Visual */}
            <div className="pt-12 px-6 pb-6 text-center border-b border-black/5 dark:border-white/5">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center font-bold text-4xl mb-4 shadow-inner ${avatarColor}`}>
                {mascota.nombre.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white">{mascota.nombre}</h2>
            <p className="text-sm font-medium text-[#3B82F6]">{mascota.especie} • {mascota.raza}</p>
            </div>

            <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase mb-1 flex items-center gap-1"><CalendarIcon size={12}/> Edad</p>
                <p className="font-semibold text-[#0F172A] dark:text-white">{calcularEdad(mascota.fecha_nacimiento)}</p>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase mb-1 flex items-center gap-1"><Info size={12}/> Género</p>
                <p className="font-semibold text-[#0F172A] dark:text-white">{mascota.genero}</p>
                </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase mb-1 flex items-center gap-1"><Activity size={12}/> Alergias Clínicas</p>
                {tieneAlergias ? (
                <p className="font-bold text-rose-500">{mascota.alergias}</p>
                ) : (
                <p className="font-semibold text-[#0F172A] dark:text-white">Ninguna registrada</p>
                )}
            </div>
            </div>

            <div className="px-6 py-4 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-b-[24px] flex justify-center">
            <Button 
                variant="outline" 
                className="w-full text-sm !py-2.5"
                onClick={() => console.log("Redirigiendo a expediente clínico...")}
            >
                Abrir Expediente Completo
            </Button>
            </div>
        </div>
        </div>
    );
};

// --- MODAL DE EDITAR PACIENTE (MASCOTA) ---
const ModalEditarPaciente = ({ isOpen, mascota, onClose }: { isOpen: boolean, mascota: PacienteDetalle | null, onClose: () => void }) => {
    const [formData, setFormData] = useState({ 
        nombre: '', especie: '', raza: '', alergias: '', 
        fecha_nacimiento: '', genero: '', color: '' 
    });

    useEffect(() => {
        if (mascota) {
        setFormData({
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza,
            fecha_nacimiento: mascota.fecha_nacimiento ? mascota.fecha_nacimiento.substring(0, 10) : '',
            genero: mascota.genero || 'Macho',
            color: mascota.color || '',
            alergias: mascota.alergias || ''
        });
        }
    }, [mascota]);

    const [updatePaciente, { loading, error }] = useMutation(UPDATE_PACIENTE, {
        refetchQueries: ['GetClientesDirectorio']
    });

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mascota) return;
        try {
        await updatePaciente({
            variables: {
            input: {
                id_paciente: mascota.id_paciente,
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

    if (!isOpen || !mascota) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Editar Mascota</h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Modificando a: {mascota.nombre}</p>
            </div>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 transition-colors">
                <X size={20} />
            </button>
            </div>

            <div className="p-6 overflow-y-auto">
            <form id="editMascotaForm" onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{error.message}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Nombre del Paciente</Label>
                    <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={Tag} required />
                </div>
                <div className="space-y-2">
                    <Label>Fecha de Nacimiento</Label>
                    <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full px-4 py-3 pl-11 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all" />
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
                <Textarea name="alergias" value={formData.alergias} onChange={handleChange} rows={2} className="border-rose-200 focus:ring-rose-500/50 focus:border-rose-500" />
                </div>
            </form>
            </div>

            <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
            <Button variant="outline" onClick={onClose} disabled={loading} className="!w-full sm:!w-auto">Cancelar</Button>
            <Button type="submit" form="editMascotaForm" variant="primary" disabled={loading} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
            </Button>
            </div>
        </div>
        </div>
    );
};

// --- MODAL DE ELIMINAR PACIENTE (MASCOTA) ---
const ModalEliminarPaciente = ({ isOpen, mascota, onClose }: { isOpen: boolean, mascota: PacienteDetalle | null, onClose: () => void }) => {
    const [deletePaciente, { loading, error }] = useMutation(DELETE_PACIENTE, {
        refetchQueries: ['GetClientesDirectorio'] 
    });

    const handleDelete = async () => {
        if (!mascota) return;
        try {
        await deletePaciente({ variables: { id: mascota.id_paciente } });
        onClose();
        } catch (err) {
        console.error(err);
        }
    };

    if (!isOpen || !mascota) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
            <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar a {mascota.nombre}?</h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] mb-6">
            Esta acción borrará permanentemente a la mascota del directorio de este cliente.
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

// --- MODAL PERFIL DEL CLIENTE ---
const ModalPerfilCliente = ({ isOpen, cliente, onClose }: { isOpen: boolean, cliente: Cliente | null, onClose: () => void }) => {
    if (!isOpen || !cliente) return null;

    const avatarColor = getAvatarColor(cliente.nombre_completo);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Header de Perfil */}
            <div className="relative h-32 bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A]">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm">
                <X size={20} />
            </button>
            </div>
            
            <div className="px-8 pb-8 pt-0 relative flex flex-col">
            {/* Avatar superpuesto */}
            <div className={`w-24 h-24 rounded-full border-4 border-[#FFFFFF] dark:border-[#1E293B] flex items-center justify-center font-bold text-4xl shadow-md absolute -top-12 left-8 ${avatarColor}`}>
                {cliente.nombre_completo.charAt(0).toUpperCase()}
            </div>
            
            <div className="mt-14 flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-black/5 dark:border-white/5 pb-6">
                <div>
                <h2 className="text-3xl font-extrabold text-[#0F172A] dark:text-white mb-1">{cliente.nombre_completo}</h2>
                <p className="text-[#3B82F6] font-medium flex items-center gap-1">
                    <User size={16} /> @{cliente.usuario.username}
                </p>
                </div>
                <div>
                {cliente.usuario.activo ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm border border-emerald-500/20">
                    <ShieldCheck size={16} /> Cliente Activo
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-sm border border-rose-500/20">
                    <ShieldAlert size={16} /> Cuenta Suspendida
                    </span>
                )}
                </div>
            </div>

            {/* Información de Contacto */}
            <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-xl border border-black/5 dark:border-white/5">
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Phone size={14} /> Teléfono Principal</p>
                <p className="font-medium text-[#0F172A] dark:text-white text-lg">{cliente.telefono_principal}</p>
                </div>
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-xl border border-black/5 dark:border-white/5">
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={14} /> Dirección Registrada</p>
                <p className="font-medium text-[#0F172A] dark:text-white leading-tight">{cliente.direccion}</p>
                </div>
            </div>

            {/* Mascotas del Cliente */}
            <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-4 flex items-center gap-2">
                <PawPrint size={20} className="text-[#3B82F6]" /> Mascotas Vinculadas ({cliente.pacientes.length})
                </h3>
                
                {cliente.pacientes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cliente.pacientes.map((mascota) => (
                    <div key={mascota.id_paciente} className="flex items-center gap-4 p-3 bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-xl shadow-sm">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${getAvatarColor(mascota.nombre)}`}>
                        {mascota.nombre.charAt(0)}
                        </div>
                        <div>
                        <p className="font-bold text-[#0F172A] dark:text-white leading-none mb-1">{mascota.nombre}</p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{mascota.especie} • {mascota.raza}</p>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="p-8 text-center bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-dashed border-black/10 dark:border-white/10">
                    <p className="text-[#64748B] dark:text-[#94A3B8]">Este cliente aún no tiene mascotas registradas.</p>
                </div>
                )}
            </div>

            </div>
        </div>
        </div>
    );
};

// --- MODAL DE EDITAR CLIENTE CON FUNCIONALIDAD REAL ---
const ModalEditarCliente = ({ isOpen, cliente, onClose }: { isOpen: boolean, cliente: Cliente | null, onClose: () => void }) => {
    const [formData, setFormData] = useState({ nombre_completo: '', telefono_principal: '', direccion: '' });

    useEffect(() => {
        if (cliente) {
        setFormData({
            nombre_completo: cliente.nombre_completo,
            telefono_principal: cliente.telefono_principal,
            direccion: cliente.direccion
        });
        }
    }, [cliente]);

    const [updateCliente, { loading, error }] = useMutation(UPDATE_CLIENTE, {
        refetchQueries: ['GetClientesDirectorio']
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cliente) return;
        try {
        await updateCliente({
            variables: {
            input: { id_cliente: cliente.id_cliente, ...formData }
            }
        });
        onClose();
        } catch (err) {
        console.error(err);
        }
    };

    if (!isOpen || !cliente) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Editar Cliente</h2>
            <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500"><X size={20} /></button>
            </div>
            <div className="p-6">
            <form id="editClienteForm" onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm mb-4">{error.message}</div>}
                <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <Input name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="telefono_principal" value={formData.telefono_principal} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                <Label>Dirección</Label>
                <Input name="direccion" value={formData.direccion} onChange={handleChange} required />
                </div>
                <p className="text-xs text-amber-600 font-medium pt-2">Nota: El nombre de usuario no se puede cambiar por seguridad.</p>
            </form>
            </div>
            <div className="px-6 py-4 border-t border-black/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
            <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" form="editClienteForm" variant="primary" disabled={loading} className="flex items-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
            </Button>
            </div>
        </div>
        </div>
    );
};

// --- MODAL CAMBIAR ESTADO DE CUENTA CON FUNCIONALIDAD REAL ---
const ModalEstadoCuenta = ({ isOpen, cliente, onClose }: { isOpen: boolean, cliente: Cliente | null, onClose: () => void }) => {
    const [toggleEstado, { loading, error }] = useMutation(TOGGLE_ESTADO_USUARIO, {
        refetchQueries: ['GetClientesDirectorio']
    });

    if (!isOpen || !cliente) return null;
    const esActivo = cliente.usuario.activo;

    const handleToggle = async () => {
        try {
        await toggleEstado({
            variables: { id_usuario: cliente.usuario.id_usuario, activo: !esActivo }
        });
        onClose();
        } catch (err) {
        console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${esActivo ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
            {esActivo ? <Ban size={32} /> : <CheckCircle size={32} />}
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">
            {esActivo ? '¿Suspender Cuenta?' : '¿Activar Cuenta?'}
            </h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] mb-6">
            {esActivo 
                ? `Si suspendes la cuenta, ${cliente.nombre_completo} no podrá acceder al Portal Web ni hacer pedidos.`
                : `Al activar la cuenta, ${cliente.nombre_completo} recuperará su acceso al Portal Web.`}
            </p>
            {error && <p className="text-rose-500 text-sm mb-4">{error.message}</p>}
            <div className="flex gap-3 w-full">
            <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">Cancelar</Button>
            <Button onClick={handleToggle} disabled={loading} className={`w-1/2 flex items-center justify-center gap-2 ${esActivo ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : (esActivo ? 'Sí, Suspender' : 'Sí, Activar')}
            </Button>
            </div>
        </div>
        </div>
    );
};

// ==========================================
// 5. VISTA PRINCIPAL
// ==========================================
export const ClientesView = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
    
    // NUEVO: Estados para Filtros
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);

    // Estados para Modales
    const [isModalNewOpen, setIsModalNewOpen] = useState(false);
    const [mascotaViendoFicha, setMascotaViendoFicha] = useState<PacienteDetalle | null>(null);
    const [mascotaAEditar, setMascotaAEditar] = useState<PacienteDetalle | null>(null);
    const [mascotaAEliminar, setMascotaAEliminar] = useState<PacienteDetalle | null>(null);

    const [clienteViendoPerfil, setClienteViendoPerfil] = useState<Cliente | null>(null);
    const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
    const [clienteACambiarEstado, setClienteACambiarEstado] = useState<Cliente | null>(null);
    const [clienteParaNuevaMascota, setClienteParaNuevaMascota] = useState<Cliente | null>(null);

    const { data, loading, error } = useQuery<GetClientesResponse>(GET_CLIENTES_DIRECTORIO);

    const clientesFiltrados = data?.clientes.filter((cliente) => {
        const busqueda = searchTerm.toLowerCase();
        
        // 1. Filtro de Búsqueda
        const coincideBusqueda = 
        cliente.nombre_completo.toLowerCase().includes(busqueda) ||
        cliente.telefono_principal.includes(busqueda) ||
        cliente.usuario.username.toLowerCase().includes(busqueda);
        
        // 2. Filtros Dinámicos del Botón
        let coincideFiltro = true;
        if (filtroActivo === 'con-mascotas') coincideFiltro = cliente.pacientes.length > 0;
        if (filtroActivo === 'sin-mascotas') coincideFiltro = cliente.pacientes.length === 0;
        if (filtroActivo === 'activos') coincideFiltro = cliente.usuario.activo === true;
        if (filtroActivo === 'suspendidos') coincideFiltro = cliente.usuario.activo === false;

        return coincideBusqueda && coincideFiltro;
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
            <Button variant="primary" className="!px-5 !py-2.5 shadow-md" onClick={() => setIsModalNewOpen(true)}>
            <Plus size={18} /> Nuevo Cliente
            </Button>
        </div>

        {/* Buscador y Botón de Filtros */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
            <Input 
                icon={Search}
                type="text" 
                placeholder="Buscar por nombre, teléfono o usuario..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]"
            />
            </div>
            
            {/* Menú de Filtros Funcional */}
            <div className="relative">
            <Button 
                variant="outline" 
                className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8] relative"
                onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}
            >
                <Filter size={18} /> Filtros
                {filtroActivo !== 'todos' && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6] border border-white dark:border-[#1E293B]"></span>
                )}
            </Button>
            
            {menuFiltrosAbierto && (
                <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuFiltrosAbierto(false)}></div>
                <div className="absolute right-0 top-14 w-52 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                    <button onClick={() => { setFiltroActivo('todos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'todos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Todos los Clientes</button>
                    
                    <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                    
                    <button onClick={() => { setFiltroActivo('con-mascotas'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'con-mascotas' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Con Mascotas</button>
                    <button onClick={() => { setFiltroActivo('sin-mascotas'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'sin-mascotas' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Sin Mascotas</button>
                    
                    <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                    
                    <button onClick={() => { setFiltroActivo('activos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${filtroActivo === 'activos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    <ShieldCheck size={14} className={filtroActivo === 'activos' ? 'text-[#3B82F6]' : 'text-emerald-500'}/> Cuentas Activas
                    </button>
                    <button onClick={() => { setFiltroActivo('suspendidos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${filtroActivo === 'suspendidos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                    <ShieldAlert size={14} className={filtroActivo === 'suspendidos' ? 'text-[#3B82F6]' : 'text-rose-500'}/> Cuentas Suspendidas
                    </button>
                </div>
                </>
            )}
            </div>
        </div>

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
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Mascotas (Fichas)</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {clientesFiltrados.length > 0 ? (
                    clientesFiltrados.map((cliente) => (
                        <tr key={cliente.id_cliente} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        
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

                        <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-[#0F172A] dark:text-white font-medium">
                            <Phone size={14} className="text-[#64748B]" /> 
                            {cliente.telefono_principal}
                            </div>
                        </td>

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

                        {/* COLUMNA DE MASCOTAS INTERACTIVA */}
                        <td className="px-6 py-4">
                            {cliente.pacientes.length > 0 ? (
                            <div className="flex -space-x-2 overflow-hidden">
                                {cliente.pacientes.map((mascota) => (
                                <button 
                                    key={mascota.id_paciente} 
                                    onClick={() => setMascotaViendoFicha(mascota)}
                                    title={`Ver ficha de ${mascota.nombre}`} 
                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 flex items-center justify-center text-xs font-bold text-[#64748B] dark:text-[#94A3B8] hover:-translate-y-1 hover:shadow-md transition-all cursor-pointer hover:text-[#3B82F6] hover:border-[#3B82F6]"
                                >
                                    {mascota.nombre.charAt(0)}
                                </button>
                                ))}
                            </div>
                            ) : (
                            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#0F172A] px-2.5 py-1 rounded-full border border-black/5 dark:border-white/5">
                                Sin mascotas
                            </span>
                            )}
                        </td>

                        {/* COLUMNA ACCIONES */}
                        <td className="px-6 py-4 text-right relative">
                            <button 
                            onClick={() => setClienteViendoPerfil(cliente)}
                            className="text-[#3B82F6] font-medium text-sm hover:underline mr-4 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                            Ver Perfil
                            </button>
                            <button 
                            onClick={() => setMenuAbierto(menuAbierto === cliente.id_cliente ? null : cliente.id_cliente)}
                            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                            >
                            <MoreVertical size={18} />
                            </button>

                            {/* Menú Desplegable Real */}
                            {menuAbierto === cliente.id_cliente && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                                <div className="absolute right-8 top-10 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                                
                                <button 
                                    onClick={() => { setClienteAEditar(cliente); setMenuAbierto(null); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Edit2 size={16} /> Editar Cliente
                                </button>

                                <button 
                                    onClick={() => { setClienteParaNuevaMascota(cliente); setMenuAbierto(null); }}
                                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                    <PawPrint size={16} /> Añadir Mascota
                                </button>

                                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                                <button 
                                    onClick={() => { setClienteACambiarEstado(cliente); setMenuAbierto(null); }}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${cliente.usuario.activo ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                >
                                    {cliente.usuario.activo ? <Ban size={16} /> : <CheckCircle size={16} />}
                                    {cliente.usuario.activo ? 'Suspender Cuenta' : 'Activar Cuenta'}
                                </button>
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

        {/* Renderizado de Modales de Cliente */}
        <NuevoClienteModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
        
        <ModalPerfilCliente
            isOpen={!!clienteViendoPerfil}
            cliente={clienteViendoPerfil}
            onClose={() => setClienteViendoPerfil(null)}
        />

        <ModalEditarCliente 
            isOpen={!!clienteAEditar} 
            cliente={clienteAEditar} 
            onClose={() => setClienteAEditar(null)} 
        />
        
        <ModalEstadoCuenta 
            isOpen={!!clienteACambiarEstado} 
            cliente={clienteACambiarEstado} 
            onClose={() => setClienteACambiarEstado(null)} 
        />
        
        {/* Renderizado de Modales de Mascota */}
        <NuevoPacienteModal 
            isOpen={!!clienteParaNuevaMascota} 
            onClose={() => setClienteParaNuevaMascota(null)} 
            defaultClienteId={clienteParaNuevaMascota?.id_cliente} 
        />

        <ModalFichaMascota 
            isOpen={!!mascotaViendoFicha} 
            mascota={mascotaViendoFicha} 
            onClose={() => setMascotaViendoFicha(null)}
            onEdit={() => {
            setMascotaAEditar(mascotaViendoFicha);
            setMascotaViendoFicha(null);
            }}
            onDelete={() => {
            setMascotaAEliminar(mascotaViendoFicha);
            setMascotaViendoFicha(null);
            }}
        />

        <ModalEditarPaciente
            isOpen={!!mascotaAEditar}
            mascota={mascotaAEditar}
            onClose={() => setMascotaAEditar(null)}
        />

        <ModalEliminarPaciente
            isOpen={!!mascotaAEliminar}
            mascota={mascotaAEliminar}
            onClose={() => setMascotaAEliminar(null)}
        />

        </div>
    );
};