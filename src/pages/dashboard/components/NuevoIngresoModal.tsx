import React, { useState } from 'react';
import { X, Activity, FileText, Loader2, PawPrint, Calendar as CalendarIcon, CheckCircle, User, Clock, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// 1. QUERY ACTUALIZADA: Ahora traemos pacientes Y empleados
const GET_DATOS_INGRESO = gql`
  query GetDatosIngresoHosp {
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

const CREATE_HOSPITALIZACION = gql`
  mutation CreateHospitalizacion($input: CreateHospitalizacionInput!) {
    createHospitalizacion(createInput: $input) {
      id_hospitalizacion
      estado
    }
  }
`;

// ==========================================
// INTERFACES
// ==========================================
interface PacienteDropdown {
  id_paciente: number;
  nombre: string;
  especie: string;
  cliente: { nombre_completo: string };
}

interface EmpleadoDropdown {
  id_empleado: number;
  nombre: string;
  puesto: string;
}

interface GetDatosIngresoResponse {
  pacientes: PacienteDropdown[];
  empleados: EmpleadoDropdown[];
}

interface NuevoIngresoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoIngresoModal: React.FC<NuevoIngresoModalProps> = ({ isOpen, onClose }) => {
  // SEPARAMOS LA FECHA Y LA HORA PARA LA UI
  const [formData, setFormData] = useState({
    paciente_id: '',
    empleado_id: '',
    fecha: '',
    hora: '',
    motivo: ''
  });

  const { data, loading: loadingDatos } = useQuery<GetDatosIngresoResponse>(GET_DATOS_INGRESO, { skip: !isOpen });

  const [createHospitalizacion, { loading: saving }] = useMutation(CREATE_HOSPITALIZACION, {
    refetchQueries: ['GetHospitalizaciones', 'GetExpedientePaciente']
  });

  const [successMsg, setSuccessMsg] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  // Obtener fecha de hoy para bloquear días pasados
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setCustomError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    try {
      // MAGIA PARA EL BACKEND: Combinamos los inputs visuales en el formato ISO que espera el backend
      let fechaIngresoISO = new Date().toISOString(); // Por defecto la hora actual
      
      if (formData.fecha && formData.hora) {
        fechaIngresoISO = new Date(`${formData.fecha}T${formData.hora}:00`).toISOString();
      }

      await createHospitalizacion({
        variables: {
          input: {
            paciente_id: parseInt(formData.paciente_id),
            empleado_id: parseInt(formData.empleado_id), 
            fecha_ingreso: fechaIngresoISO, // <-- El backend recibe lo mismo de siempre
            motivo: formData.motivo.trim(),
            estado: 'Internado'
          }
        }
      });
      
      setSuccessMsg(true);
      setTimeout(() => {
        setFormData({ paciente_id: '', empleado_id: '', fecha: '', hora: '', motivo: '' });
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      // Aplicamos el mismo manejo de errores limpio
      const mensajeError = err.graphQLErrors?.[0]?.message || err.message || "Error al internar al paciente.";
      setCustomError(mensajeError);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Activity className="text-[#3B82F6]" size={24}/> Nuevo Ingreso</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Registra la hospitalización de un paciente.</p>
          </div>
          <button onClick={onClose} disabled={saving || successMsg} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="ingresoForm" onSubmit={handleSubmit} className="space-y-6">
            
            {customError && (
              <div className="p-4 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex gap-3 items-start border border-rose-200 dark:border-rose-500/20">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p>{customError}</p>
              </div>
            )}
            
            {successMsg && <div className="p-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2"><CheckCircle size={20} /> ¡Paciente ingresado con éxito!</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><PawPrint size={16} className="text-[#3B82F6]"/> Seleccionar Paciente</Label>
                <div className="relative">
                  <select name="paciente_id" value={formData.paciente_id} onChange={handleChange} required disabled={saving || successMsg} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none outline-none">
                    <option value="">Selecciona un paciente registrado...</option>
                    {data?.pacientes.map((p) => (
                      <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.especie}) - Dueño: {p.cliente.nombre_completo}</option>
                    ))}
                  </select>
                  {loadingDatos && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                </div>
              </div>

              {/* MÉDICO A CARGO */}
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><User size={16} className="text-[#3B82F6]"/> Médico a Cargo</Label>
                <div className="relative">
                  <select name="empleado_id" value={formData.empleado_id} onChange={handleChange} required disabled={saving || successMsg} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none outline-none">
                    <option value="">Selecciona al doctor...</option>
                    {data?.empleados.map((e) => (
                      <option key={e.id_empleado} value={e.id_empleado}>Dr. {e.nombre} ({e.puesto})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEPARACIÓN DE FECHA Y HORA EN 2 COLUMNAS */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CalendarIcon size={16}/> Fecha de Ingreso</Label>
                <input 
                  type="date" 
                  name="fecha" 
                  value={formData.fecha} 
                  onChange={handleChange}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  min={getTodayString()}
                  disabled={saving || successMsg}
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark]" 
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock size={16}/> Hora de Ingreso</Label>
                <input 
                  type="time" 
                  name="hora" 
                  value={formData.hora} 
                  onChange={handleChange}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  onKeyDown={(e) => e.preventDefault()}
                  disabled={saving || successMsg}
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark]" 
                />
              </div>
              <p className="text-[10px] text-[#64748B] md:col-span-2 -mt-4">Nota: Si dejas la fecha y hora vacías, se registrará el ingreso con la hora actual exacta.</p>

            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><FileText size={16}/> Motivo Clínico de Ingreso</Label>
              <Textarea name="motivo" value={formData.motivo} onChange={handleChange} rows={3} placeholder="Ej. Observación post-operatoria, cuadro de deshidratación severa..." required disabled={saving || successMsg} />
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={saving || successMsg}>Cancelar</Button>
          <Button type="submit" form="ingresoForm" disabled={saving || successMsg} variant="primary" className="flex items-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Internar Paciente"}
          </Button>
        </div>
      </div>
    </div>
  );
};