import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, FileText, Loader2, User, PawPrint } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// QUERIES PARA LLENAR LOS DROPDOWNS
const GET_DATOS_FORMULARIO = gql`
  query GetDatosNuevaCita {
    pacientes {
      id_paciente
      nombre
      especie
      cliente {
        nombre_completo
      }
    }
    empleados {
      id_empleado
      nombre
      puesto
    }
  }
`;

const CREATE_CITA = gql`
  mutation CreateCita($input: CreateCitaInput!) {
    createCita(createCitaInput: $input) {
      id_cita
      fecha_hora
      estado
    }
  }
`;

// ==========================================
// INTERFACES DE TYPESCRIPT PARA LA QUERY
// ==========================================
interface PacienteDropdown {
  id_paciente: number;
  nombre: string;
  especie: string;
  cliente: {
    nombre_completo: string;
  };
}

interface EmpleadoDropdown {
  id_empleado: number;
  nombre: string;
  puesto: string;
}

interface GetDatosFormularioResponse {
  pacientes: PacienteDropdown[];
  empleados: EmpleadoDropdown[];
}

interface NuevaCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevaCitaModal: React.FC<NuevaCitaModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    paciente_id: '',
    empleado_id: '',
    fecha: '',
    hora: '',
    motivo: '',
    origen_cita: 'Mostrador'
  });

  // Inyectamos la interfaz aquí para que TypeScript sepa qué contiene 'data'
  const { data, loading: loadingDatos } = useQuery<GetDatosFormularioResponse>(GET_DATOS_FORMULARIO, { skip: !isOpen });

  const [createCita, { loading: saving, error: saveError }] = useMutation(CREATE_CITA, {
    refetchQueries: ['GetCitasAgenda']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Combinamos fecha y hora en formato ISO 8601
      const fechaHoraLocal = new Date(`${formData.fecha}T${formData.hora}:00`);
      
      await createCita({
        variables: {
          input: {
            paciente_id: parseInt(formData.paciente_id),
            empleado_id: parseInt(formData.empleado_id),
            fecha_hora: fechaHoraLocal.toISOString(),
            motivo: formData.motivo,
            estado: 'Pendiente',
            origen_cita: formData.origen_cita
          }
        }
      });
      
      setFormData({ paciente_id: '', empleado_id: '', fecha: '', hora: '', motivo: '', origen_cita: 'Mostrador' });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Agendar Nueva Cita</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Programa una visita médica o estética.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="citaForm" onSubmit={handleSubmit} className="space-y-6">
            {saveError && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{saveError.message}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Paciente */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><PawPrint size={16} className="text-[#3B82F6]"/> Paciente</Label>
                <div className="relative">
                  <select name="paciente_id" value={formData.paciente_id} onChange={handleChange} required className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                    <option value="">Selecciona un paciente...</option>
                    {/* Al tener la interfaz, TypeScript ya reconoce a 'p' perfectamente sin el :any */}
                    {data?.pacientes.map((p) => (
                      <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.especie}) - Dueño: {p.cliente.nombre_completo}</option>
                    ))}
                  </select>
                  {loadingDatos && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CalendarIcon size={16}/> Fecha</Label>
                <input 
                  type="date" 
                  name="fecha" 
                  value={formData.fecha} 
                  onChange={handleChange}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  required 
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock size={16}/> Hora</Label>
                <input 
                  type="time" 
                  name="hora" 
                  value={formData.hora} 
                  onChange={handleChange}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  required 
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark]" 
                />
              </div>

              {/* Doctor Asignado */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User size={16}/> Especialista Asignado</Label>
                <select name="empleado_id" value={formData.empleado_id} onChange={handleChange} required className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="">Selecciona al doctor...</option>
                  {/* Lo mismo aquí para 'e' */}
                  {data?.empleados.map((e) => (
                    <option key={e.id_empleado} value={e.id_empleado}>Dr. {e.nombre} ({e.puesto})</option>
                  ))}
                </select>
              </div>

              {/* Origen */}
              <div className="space-y-2">
                <Label>Medio de Reserva</Label>
                <select name="origen_cita" value={formData.origen_cita} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="Mostrador">Mostrador (Presencial)</option>
                  <option value="Telefono">Teléfono</option>
                  <option value="Web">Portal Web</option>
                </select>
              </div>

              {/* Motivo */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><FileText size={16}/> Motivo de la Consulta</Label>
                <Textarea name="motivo" value={formData.motivo} onChange={handleChange} rows={2} placeholder="Ej. Vacunación anual, revisión general..." required />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" form="citaForm" disabled={saving} variant="primary" className="flex items-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Cita"}
          </Button>
        </div>
      </div>
    </div>
  );
};