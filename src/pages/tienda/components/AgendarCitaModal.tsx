import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, FileText, Loader2, User, PawPrint, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_DATOS_CITA_WEB = gql`
  query GetDatosCitaWeb {
    clientes {
      id_cliente
      usuario {
        id_usuario
      }
      pacientes {
        id_paciente
        nombre
        especie
      }
    }
    empleados {
      id_empleado
      nombre
      puesto
    }
  }
`;

const CREATE_CITA_WEB = gql`
  mutation CreateCitaWeb($input: CreateCitaInput!) {
    createCita(createCitaInput: $input) {
      id_cita
      fecha_hora
      estado
    }
  }
`;

// ==========================================
// 2. INTERFACES TYPESCRIPT
// ==========================================
interface PacienteWeb {
  id_paciente: number;
  nombre: string;
  especie: string;
}

interface EmpleadoWeb {
  id_empleado: number;
  nombre: string;
  puesto: string;
}

interface GetDatosCitaWebResponse {
  clientes: {
    id_cliente: number;
    usuario: { id_usuario: number } | null;
    pacientes: PacienteWeb[];
  }[];
  empleados: EmpleadoWeb[];
}

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================
interface AgendarCitaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgendarCitaModal = ({ isOpen, onClose }: AgendarCitaModalProps) => {
  const [formData, setFormData] = useState({
    paciente_id: '',
    empleado_id: '',
    fecha: '',
    hora: '',
    motivo: ''
  });
  
  const [successMsg, setSuccessMsg] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const { data, loading: loadingDatos, error: errorDatos } = useQuery<GetDatosCitaWebResponse>(GET_DATOS_CITA_WEB, { 
    skip: !isOpen || !currentUser,
    fetchPolicy: 'cache-and-network'
  });

  const [createCita, { loading: saving }] = useMutation(CREATE_CITA_WEB);

  // Filtrar solo las mascotas del usuario logueado
  const miPerfil = data?.clientes.find(c => c.usuario?.id_usuario === currentUser?.id_usuario);
  const misMascotas = miPerfil?.pacientes || [];

  // Filtrar solo veterinarios disponibles (Ej. excluyendo recepcionistas o limpieza si fuera necesario, aquí mostramos todos los aptos)
  const veterinarios = data?.empleados.filter(e => e.puesto.includes('Veterinario') || e.puesto.includes('Estilista')) || [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!miPerfil) {
      setCustomError("No pudimos vincular tu cuenta con un perfil de cliente. Contacta a soporte.");
      return;
    }

    try {
      const fechaHoraLocal = new Date(`${formData.fecha}T${formData.hora}:00`);
      
      await createCita({
        variables: {
          input: {
            paciente_id: parseInt(formData.paciente_id),
            empleado_id: parseInt(formData.empleado_id),
            fecha_hora: fechaHoraLocal.toISOString(),
            motivo: formData.motivo.trim(),
            estado: 'Pendiente',
            origen_cita: 'Web' // <-- Forzado como Web
          }
        }
      });
      
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setFormData({ paciente_id: '', empleado_id: '', fecha: '', hora: '', motivo: '' });
        onClose();
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setCustomError(err.message || "Ocurrió un error al agendar la cita.");
    }
  };

  const handleClose = () => {
    setCustomError(null);
    setSuccessMsg(false);
    setFormData({ paciente_id: '', empleado_id: '', fecha: '', hora: '', motivo: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleClose}>
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <CalendarIcon className="text-[#3B82F6]" size={24} /> Agendar Cita en Clínica
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Programa una visita médica o de estética para tu mascota.</p>
          </div>
          <button onClick={handleClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          
          {loadingDatos ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>
          ) : errorDatos ? (
            <div className="text-center py-10 text-rose-500 font-bold">Error al cargar datos. Intenta nuevamente más tarde.</div>
          ) : misMascotas.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">No tienes mascotas registradas</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-6">Para agendar una cita, primero debes dar de alta a tu compañero desde tu perfil.</p>
              <Button variant="primary" onClick={handleClose}>Entendido</Button>
            </div>
          ) : successMsg ? (
            <div className="text-center py-10 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">¡Cita Confirmada!</h3>
              <p className="text-[#64748B] dark:text-[#94A3B8] mb-6">Tu espacio en la agenda ha sido reservado correctamente.</p>
            </div>
          ) : (
            <form id="agendarWebForm" onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              
              {customError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium flex gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5"/> <p>{customError}</p></div>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Paciente */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2"><PawPrint size={16} className="text-[#3B82F6]"/> ¿Quién nos visita?</Label>
                  <select name="paciente_id" value={formData.paciente_id} onChange={handleChange} required disabled={saving} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none outline-none">
                    <option value="">Selecciona a tu mascota...</option>
                    {misMascotas.map((p) => (
                      <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} ({p.especie})</option>
                    ))}
                  </select>
                </div>

                {/* Fecha y Hora */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><CalendarIcon size={16}/> Fecha Deseada</Label>
                  <input 
                    type="date" 
                    name="fecha" 
                    value={formData.fecha} 
                    onChange={handleChange}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    onKeyDown={(e) => e.preventDefault()}
                    min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                    required 
                    disabled={saving}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark] outline-none" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Clock size={16}/> Hora Aproximada</Label>
                  <input 
                    type="time" 
                    name="hora" 
                    value={formData.hora} 
                    onChange={handleChange}
                    onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                    onKeyDown={(e) => e.preventDefault()}
                    required 
                    disabled={saving}
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer select-none dark:[color-scheme:dark] outline-none" 
                  />
                </div>

                {/* Especialista */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2"><User size={16}/> Especialista Preferido (Opcional)</Label>
                  <select name="empleado_id" value={formData.empleado_id} onChange={handleChange} required disabled={saving} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none outline-none">
                    <option value="">Cualquier especialista disponible...</option>
                    {veterinarios.map((e) => (
                      <option key={e.id_empleado} value={e.id_empleado}>Dr. {e.nombre} ({e.puesto})</option>
                    ))}
                  </select>
                </div>

                {/* Motivo */}
                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2"><FileText size={16}/> Motivo de la Cita</Label>
                  <Textarea 
                    name="motivo" 
                    value={formData.motivo} 
                    onChange={handleChange} 
                    rows={3} 
                    placeholder="Describe brevemente los síntomas o el servicio que necesitas (Ej. Estética, Vacuna Rabia, Revisión general)..." 
                    required 
                    disabled={saving}
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer de Botones */}
        {!successMsg && misMascotas.length > 0 && !loadingDatos && !errorDatos && (
          <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
            <Button variant="outline" onClick={handleClose} disabled={saving}>Cancelar</Button>
            <Button type="submit" form="agendarWebForm" disabled={saving} variant="primary" className="flex items-center gap-2 shadow-lg shadow-blue-500/20">
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Reserva"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};