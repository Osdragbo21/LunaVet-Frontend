import React, { useState } from 'react';
import { X, Activity, FileText, Loader2, PawPrint, Calendar as CalendarIcon, CheckCircle, User } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    paciente_id: '',
    empleado_id: '', // NUEVO CAMPO AGREGADO
    fecha_ingreso: '',
    motivo: ''
  });

  const { data, loading: loadingDatos } = useQuery<GetDatosIngresoResponse>(GET_DATOS_INGRESO, { skip: !isOpen });

  const [createHospitalizacion, { loading: saving, error: saveError }] = useMutation(CREATE_HOSPITALIZACION, {
    refetchQueries: ['GetHospitalizaciones', 'GetExpedientePaciente']
  });

  const [successMsg, setSuccessMsg] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let fechaIngresoISO = new Date().toISOString();
      if (formData.fecha_ingreso) {
        fechaIngresoISO = new Date(formData.fecha_ingreso).toISOString();
      }

      await createHospitalizacion({
        variables: {
          input: {
            paciente_id: parseInt(formData.paciente_id),
            empleado_id: parseInt(formData.empleado_id), // ENVIAMOS EL DATO AL BACKEND
            fecha_ingreso: fechaIngresoISO,
            motivo: formData.motivo.trim(),
            estado: 'Internado'
          }
        }
      });
      
      setSuccessMsg(true);
      setTimeout(() => {
        setFormData({ paciente_id: '', empleado_id: '', fecha_ingreso: '', motivo: '' });
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err) {
      console.error(err);
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
            {saveError && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{saveError.message}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2"><CheckCircle size={20} /> ¡Paciente ingresado con éxito!</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-2"><PawPrint size={16} className="text-[#3B82F6]"/> Seleccionar Paciente</Label>
                <div className="relative">
                  <select name="paciente_id" value={formData.paciente_id} onChange={handleChange} required disabled={saving || successMsg} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                    <option value="">Selecciona un paciente registrado...</option>
                    {data?.pacientes.map((p) => (
                      <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.especie}) - Dueño: {p.cliente.nombre_completo}</option>
                    ))}
                  </select>
                  {loadingDatos && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                </div>
              </div>

              {/* NUEVO CAMPO: MÉDICO A CARGO */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><User size={16} className="text-[#3B82F6]"/> Médico a Cargo</Label>
                <div className="relative">
                  <select name="empleado_id" value={formData.empleado_id} onChange={handleChange} required disabled={saving || successMsg} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                    <option value="">Selecciona al doctor...</option>
                    {data?.empleados.map((e) => (
                      <option key={e.id_empleado} value={e.id_empleado}>Dr. {e.nombre} ({e.puesto})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><CalendarIcon size={16}/> Fecha y Hora de Ingreso</Label>
                <input 
                  type="datetime-local" 
                  name="fecha_ingreso" 
                  value={formData.fecha_ingreso} 
                  onChange={handleChange}
                  disabled={saving || successMsg}
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:[color-scheme:dark]" 
                />
                <p className="text-[10px] text-[#64748B]">Déjalo en blanco para usar la hora actual.</p>
              </div>
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