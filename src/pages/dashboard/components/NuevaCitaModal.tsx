import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, FileText, Loader2, User, PawPrint, AlertCircle, HeartPulse } from 'lucide-react';
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
// INTERFACES DE TYPESCRIPT
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
  
  const [isUrgencia, setIsUrgencia] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, loading: loadingDatos } = useQuery<GetDatosFormularioResponse>(GET_DATOS_FORMULARIO, { skip: !isOpen });

  const [createCita, { loading: saving }] = useMutation(CREATE_CITA, {
    refetchQueries: ['GetCitasAgenda', 'GetCitasSalaEspera']
  });

  // --- LÓGICA DE FECHAS ---

  // Obtener hoy en formato YYYY-MM-DD para el atributo 'min'
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayString = getTodayString();

  // Función segura para obtener el día de la semana (0 = Domingo)
  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return -1;
    const [year, month, day] = dateString.split('-');
    return new Date(Number(year), Number(month) - 1, Number(day)).getDay();
  };

  // --- MANEJADORES DE EVENTOS ---

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    const dayOfWeek = getDayOfWeek(selectedDate);

    // Validación de Domingos (si no es urgencia)
    if (!isUrgencia && dayOfWeek === 0) {
      setFormError('Los domingos la clínica está cerrada. Selecciona otro día o marca la cita como Urgencia.');
      setFormData(prev => ({ ...prev, fecha: '', hora: '' }));
      return;
    }

    setFormError(null);
    setFormData(prev => ({ ...prev, fecha: selectedDate, hora: '' }));
  };

  const handleUrgenciaToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsUrgencia(checked);
    setFormError(null);
    
    if (!checked && getDayOfWeek(formData.fecha) === 0) {
      setFormData(prev => ({ ...prev, fecha: '', hora: '' }));
      setFormError('Se desactivó la Urgencia. La fecha seleccionada era Domingo y la clínica está cerrada.');
    } else {
      setFormData(prev => ({ ...prev, hora: '' }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Generador dinámico de horas
  const getAvailableHours = () => {
    if (isUrgencia) {
      return Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
    }
    
    const dayOfWeek = getDayOfWeek(formData.fecha);
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
      // L-V: 08:00 a 19:00
      return Array.from({ length: 12 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
    }
    if (dayOfWeek === 6) { 
      // Sáb: 09:00 a 16:00
      return Array.from({ length: 8 }, (_, i) => `${(i + 9).toString().padStart(2, '0')}:00`);
    }
    return [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const fechaHoraLocal = new Date(`${formData.fecha}T${formData.hora}:00`);
      
      await createCita({
        variables: {
          input: {
            paciente_id: parseInt(formData.paciente_id),
            empleado_id: parseInt(formData.empleado_id),
            fecha_hora: fechaHoraLocal.toISOString(),
            motivo: formData.motivo,
            estado: 'Pendiente',
            origen_cita: isUrgencia ? 'Urgencia' : formData.origen_cita
          }
        }
      });
      
      setFormData({ paciente_id: '', empleado_id: '', fecha: '', hora: '', motivo: '', origen_cita: 'Mostrador' });
      setIsUrgencia(false);
      onClose();
    } catch (error: any) {
      const mensajeError = error.graphQLErrors?.[0]?.message 
                        || error.message 
                        || 'Ocurrió un error inesperado al agendar la cita.';
      setFormError(mensajeError);
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
            
            {formError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex gap-3 items-start border border-rose-200 dark:border-rose-500/20">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>{formError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><PawPrint size={16} className="text-[#3B82F6]"/> Paciente</Label>
                <div className="relative">
                  <select name="paciente_id" value={formData.paciente_id} onChange={handleChange} required className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                    <option value="">Selecciona un paciente...</option>
                    {data?.pacientes.map((p) => (
                      <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.especie}) - Dueño: {p.cliente.nombre_completo}</option>
                    ))}
                  </select>
                  {loadingDatos && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CalendarIcon size={16}/> Fecha</Label>
                <input 
                  type="date" 
                  name="fecha" 
                  value={formData.fecha} 
                  onChange={handleFechaChange}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  min={todayString}
                  required 
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark]" 
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock size={16}/> Hora Asignada</Label>
                <select 
                  name="hora" 
                  value={formData.hora} 
                  onChange={handleChange}
                  required 
                  disabled={!formData.fecha}
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{formData.fecha ? 'Selecciona una hora...' : 'Primero elige la fecha'}</option>
                  {getAvailableHours().map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2"><HeartPulse size={18}/> Es una Urgencia (24/7)</h4>
                  <p className="text-xs text-rose-500/80 dark:text-rose-400/80 mt-1">Ignorar restricciones de horarios y días cerrados.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isUrgencia} onChange={handleUrgenciaToggle} className="sr-only peer" />
                  <div className="w-11 h-6 bg-rose-200 peer-focus:outline-none rounded-full peer dark:bg-rose-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-500"></div>
                </label>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User size={16}/> Especialista Asignado</Label>
                <select name="empleado_id" value={formData.empleado_id} onChange={handleChange} required className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="">Selecciona al doctor...</option>
                  {data?.empleados.map((e) => (
                    <option key={e.id_empleado} value={e.id_empleado}>Dr. {e.nombre} ({e.puesto})</option>
                  ))}
                </select>
              </div>

              <div className={`space-y-2 transition-opacity ${isUrgencia ? 'opacity-50 pointer-events-none' : ''}`}>
                <Label>Medio de Reserva</Label>
                <select name="origen_cita" value={isUrgencia ? 'Urgencia' : formData.origen_cita} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="Mostrador">Mostrador (Presencial)</option>
                  <option value="Telefono">Teléfono</option>
                  <option value="Web">Portal Web</option>
                  {isUrgencia && <option value="Urgencia">Urgencia</option>}
                </select>
              </div>

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