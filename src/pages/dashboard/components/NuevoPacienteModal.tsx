import React, { useState } from 'react';
import { X, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

// 1. Importaciones de Apollo
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// 2. Definición de Consultas y Mutaciones
const GET_CLIENTES_DROPDOWN = gql`
    query GetClientesDropdown {
        clientes {
        id_cliente
        nombre_completo
        }
    }
`;

// Hemos regresado la petición del cliente ya que el backend solucionó el JOIN
const CREATE_PACIENTE = gql`
    mutation CreatePaciente($input: CreatePacienteInput!) {
        createPaciente(createPacienteInput: $input) {
        id_paciente
        nombre
        especie
        cliente {
            nombre_completo
        }
        }
    }
`;

// 3. Interfaces de TypeScript
interface ClienteDropdown {
    id_cliente: number;
    nombre_completo: string;
}

interface GetClientesResponse {
    clientes: ClienteDropdown[];
}

interface NuevoPacienteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NuevoPacienteModal: React.FC<NuevoPacienteModalProps> = ({ isOpen, onClose }) => {
  // 4. Estados del formulario
    const [formData, setFormData] = useState({
        cliente_id: '',
        nombre: '',
        fecha_nacimiento: '',
        especie: 'Perro',
        raza: '',
        genero: 'Macho',
        color: '',
        alergias: ''
    });

    // 5. Hooks de Apollo
    const { data: clientesData, loading: loadingClientes } = useQuery<GetClientesResponse>(GET_CLIENTES_DROPDOWN, {
        skip: !isOpen // Solo cargar clientes si el modal está abierto
    });

    const [createPaciente, { loading: saving, error: saveError }] = useMutation(CREATE_PACIENTE, {
        // Esto recarga automáticamente la tabla de atrás al guardar exitosamente
        refetchQueries: ['GetPacientes'] 
    });

    // 6. Manejadores de eventos
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
        await createPaciente({
            variables: {
            input: {
                ...formData,
                cliente_id: parseInt(formData.cliente_id),
                // Convertir fecha a ISO 8601 si existe
                fecha_nacimiento: formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento).toISOString() : null,
                alergias: formData.alergias.trim() !== '' ? formData.alergias : null
            }
            }
        });
        
        // Limpiar formulario y cerrar modal
        setFormData({
            cliente_id: '', nombre: '', fecha_nacimiento: '', especie: 'Perro', 
            raza: '', genero: 'Macho', color: '', alergias: ''
        });
        onClose();
        
        } catch (err) {
        console.error("Error al guardar el paciente:", err);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Header del Modal */}
            <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
            <div>
                <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Registrar Nuevo Paciente</h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Completa los datos clínicos de la mascota.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
                <X size={20} />
            </button>
            </div>

            {/* Cuerpo / Formulario */}
            <div className="p-6 overflow-y-auto">
            <form id="pacienteForm" onSubmit={handleSubmit} className="space-y-6">
                
                {saveError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-lg border border-rose-200 dark:border-rose-500/20">
                    Ocurrió un error al guardar: {saveError.message}
                </div>
                )}

                {/* Selección del Dueño */}
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
                    <option value="">Selecciona un cliente registrado...</option>
                    {clientesData?.clientes.map(cliente => (
                        <option key={cliente.id_cliente} value={cliente.id_cliente}>
                        {cliente.nombre_completo}
                        </option>
                    ))}
                    </select>
                    {loadingClientes && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                </div>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-2">Si es un cliente nuevo, primero debes registrarlo en el directorio de Clientes.</p>
                </div>

                {/* Grid de Datos del Paciente */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label>Nombre del Paciente</Label>
                    <Input 
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    icon={Tag} 
                    placeholder="Ej. Firulais" 
                    required 
                    />
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
                    <select 
                    name="especie"
                    value={formData.especie}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all appearance-none"
                    >
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
                    <Input 
                    name="raza"
                    value={formData.raza}
                    onChange={handleChange}
                    placeholder="Ej. Labrador, Siamés..." 
                    required 
                    />
                </div>

                <div className="space-y-2">
                    <Label>Género</Label>
                    <select 
                    name="genero"
                    value={formData.genero}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all appearance-none"
                    >
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <Label>Color / Rasgos</Label>
                    <Input 
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Ej. Blanco con manchas negras" 
                    required 
                    />
                </div>
                </div>

                {/* Campo Crítico: Alergias */}
                <div className="space-y-2">
                <Label className="flex items-center gap-2 text-rose-500">
                    <AlertTriangle size={16} /> Alergias Conocidas (Campo Médico Crítico)
                </Label>
                <Textarea 
                    name="alergias"
                    value={formData.alergias}
                    onChange={handleChange}
                    rows={3} 
                    placeholder="Describe si el paciente tiene alergias a la penicilina, alimentos u otros. Deja vacío si no presenta alergias."
                    className="border-rose-200 dark:border-rose-900/50 focus:ring-rose-500/50 focus:border-rose-500"
                />
                </div>

            </form>
            </div>

            {/* Footer del Modal (Botones) */}
            <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
            <Button variant="outline" onClick={onClose} disabled={saving} className="!w-full sm:!w-auto">
                Cancelar
            </Button>
            <Button type="submit" form="pacienteForm" disabled={saving} variant="primary" className="!w-full sm:!w-auto flex items-center justify-center gap-2">
                {saving ? (
                <>
                    <Loader2 size={18} className="animate-spin" /> Guardando...
                </>
                ) : (
                "Guardar Paciente"
                )}
            </Button>
            </div>

        </div>
        </div>
    );
};