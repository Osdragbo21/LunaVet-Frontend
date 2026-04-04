import React, { useState } from 'react';
import { 
  X, Calendar as CalendarIcon, Stethoscope, AlertTriangle, 
  FileText, Loader2, Thermometer, Weight, HeartPulse, 
  CheckCircle, Clock, Activity, Plus, Syringe, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevaConsultaModal } from './NuevaConsultaModal';

// ==========================================
// 1. QUERIES DEL EXPEDIENTE
// ==========================================
const GET_EXPEDIENTE_PACIENTE = gql`
  query GetExpedientePaciente($id: Int!) {
    paciente(id: $id) {
      id_paciente
      nombre
      especie
      alergias
      citas {
        id_cita
        fecha_hora
        motivo
        estado
        consulta {
          peso_actual
          temperatura
          frecuencia_cardiaca
          diagnostico
          observaciones
        }
      }
      hospitalizaciones {
        fecha_ingreso
        fecha_alta
        motivo
        estado
      }
    }
  }
`;

// ==========================================
// NUEVAS QUERIES PARA LA CARTILLA DE VACUNACIÓN
// ==========================================
const GET_VACUNAS = gql`
  query GetVacunas {
    vacunas {
      id_vacuna
      nombre_vacuna
      descripcion
    }
  }
`;

const GET_CARTILLA_PACIENTE = gql`
  query GetCartillaPaciente($paciente_id: Int!) {
    getCartillaPaciente(paciente_id: $paciente_id) {
      id_registro_vac
      fecha_aplicacion
      peso_al_vacunar
      proxima_dosis
      vacuna {
        nombre_vacuna
      }
    }
  }
`;

const REGISTRAR_VACUNACION = gql`
  mutation RegistrarVacunacion($input: CreateRegistroVacunacionInput!) {
    createRegistroVacunacion(createInput: $input) {
      id_registro_vac
      fecha_aplicacion
      proxima_dosis
      peso_al_vacunar
      vacuna {
        nombre_vacuna
      }
    }
  }
`;

// ==========================================
// 2. INTERFACES DE TYPESCRIPT
// ==========================================
interface ConsultaDetalle {
  peso_actual: number;
  temperatura: number;
  frecuencia_cardiaca: number;
  diagnostico: string;
  observaciones: string;
}

interface CitaExpediente {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado: string;
  consulta: ConsultaDetalle | null;
}

interface Hospitalizacion {
  fecha_ingreso: string;
  fecha_alta: string | null;
  motivo: string;
  estado: string;
}

interface PacienteExpediente {
  id_paciente: number;
  nombre: string;
  especie: string;
  alergias: string | null;
  citas: CitaExpediente[];
  hospitalizaciones: Hospitalizacion[];
}

interface GetExpedientePacienteResponse {
  paciente: PacienteExpediente;
}

interface RegistroVacuna {
  id_registro_vac: number;
  fecha_aplicacion: string;
  peso_al_vacunar: number;
  proxima_dosis: string | null;
  vacuna: {
    nombre_vacuna: string;
  };
}

interface GetCartillaResponse {
  getCartillaPaciente: RegistroVacuna[];
}

// NUEVAS INTERFACES PARA CORREGIR EL ERROR
interface VacunaDropdown {
  id_vacuna: number;
  nombre_vacuna: string;
  descripcion: string;
}

interface GetVacunasResponse {
  vacunas: VacunaDropdown[];
}

// ==========================================
// 3. COMPONENTE MODAL: REGISTRAR VACUNA
// ==========================================
const ModalNuevaVacuna = ({ isOpen, pacienteId, onClose }: { isOpen: boolean, pacienteId: number, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    vacuna_id: '',
    peso_al_vacunar: '',
    fecha_aplicacion: new Date().toISOString().split('T')[0],
    proxima_dosis: ''
  });

  // INYECTAMOS LA INTERFAZ AQUÍ
  const { data: dataVacunas, loading: loadingVacunas } = useQuery<GetVacunasResponse>(GET_VACUNAS, { skip: !isOpen });
  
  const [registrarVacuna, { loading, error }] = useMutation(REGISTRAR_VACUNACION, {
    refetchQueries: ['GetCartillaPaciente']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registrarVacuna({
        variables: {
          input: {
            paciente_id: pacienteId,
            vacuna_id: parseInt(formData.vacuna_id),
            peso_al_vacunar: parseFloat(formData.peso_al_vacunar),
            fecha_aplicacion: new Date(formData.fecha_aplicacion).toISOString(),
            proxima_dosis: formData.proxima_dosis ? new Date(formData.proxima_dosis).toISOString() : null
          }
        }
      });
      setFormData({ vacuna_id: '', peso_al_vacunar: '', fecha_aplicacion: new Date().toISOString().split('T')[0], proxima_dosis: '' });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10">
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Syringe size={20} className="text-[#3B82F6]"/> Registrar Vacuna</h2>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500"><X size={20} /></button>
        </div>
        
        <div className="p-6">
          <form id="vacunaForm" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{error.message}</div>}
            
            <div className="space-y-2">
              <Label>Biológico / Vacuna</Label>
              <select name="vacuna_id" value={formData.vacuna_id} onChange={handleChange} required disabled={loading || loadingVacunas} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                <option value="">Selecciona la vacuna...</option>
                {/* AL ESTAR TIPADO, YA NO NECESITAMOS (v: any) */}
                {dataVacunas?.vacunas.map((v) => (
                  <option key={v.id_vacuna} value={v.id_vacuna}>{v.nombre_vacuna}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Aplicación</Label>
                <input 
                  type="date" 
                  name="fecha_aplicacion" 
                  value={formData.fecha_aplicacion} 
                  onChange={handleChange} 
                  required 
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:[color-scheme:dark]" 
                />
              </div>
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input name="peso_al_vacunar" type="number" step="0.01" value={formData.peso_al_vacunar} onChange={handleChange} placeholder="Ej. 12.5" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Próxima Dosis (Opcional)</Label>
              <input 
                type="date" 
                name="proxima_dosis" 
                value={formData.proxima_dosis} 
                onChange={handleChange} 
                className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:[color-scheme:dark]" 
              />
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="vacunaForm" variant="primary" disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : 'Guardar Registro'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. COMPONENTE PRINCIPAL DEL EXPEDIENTE
// ==========================================
interface ExpedienteModalProps {
  isOpen: boolean;
  pacienteId: number | null;
  onClose: () => void;
}

export const ExpedienteModal: React.FC<ExpedienteModalProps> = ({ isOpen, pacienteId, onClose }) => {
  const [citaSeleccionada, setCitaSeleccionada] = useState<number | null>(null);

  // ESTADOS PARA TABS Y VACUNAS
  const [activeTab, setActiveTab] = useState<'historial' | 'cartilla'>('historial');
  const [isNuevaVacunaOpen, setIsNuevaVacunaOpen] = useState(false);

  // Inyectamos la interfaz en useQuery para eliminar el error de data?.paciente
  const { data, loading, error } = useQuery<GetExpedientePacienteResponse>(GET_EXPEDIENTE_PACIENTE, {
    variables: { id: pacienteId },
    skip: !isOpen || !pacienteId
  });

  // QUERY: Traemos la cartilla
  const { data: dataCartilla, loading: loadingCartilla } = useQuery<GetCartillaResponse>(GET_CARTILLA_PACIENTE, {
    variables: { paciente_id: pacienteId },
    skip: !isOpen || !pacienteId
  });

  const formatearFecha = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  const paciente = data?.paciente;
  const tieneAlergias = paciente?.alergias && paciente.alergias.trim().toLowerCase() !== 'ninguna';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-[24px] shadow-2xl w-full h-full max-w-6xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10">
        
        {/* Header Expediente */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#FFFFFF] dark:bg-[#1E293B] shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl shadow-inner">
              {paciente?.nombre?.charAt(0) || <Stethoscope />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white leading-tight">Expediente Clínico</h2>
              {paciente ? (
                <p className="text-sm font-medium text-[#3B82F6]">{paciente.nombre} • {paciente.especie}</p>
              ) : (
                <p className="text-sm text-[#64748B]">Cargando identidad...</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* TABS DE NAVEGACIÓN DESKTOP */}
            <div className="hidden sm:flex p-1 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-black/5 dark:border-white/5">
              <button 
                onClick={() => setActiveTab('historial')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historial' ? 'bg-white dark:bg-[#1E293B] text-[#3B82F6] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                <FileText size={16} /> Historial General
              </button>
              <button 
                onClick={() => setActiveTab('cartilla')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cartilla' ? 'bg-white dark:bg-[#1E293B] text-[#3B82F6] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'}`}
              >
                <Syringe size={16} /> Cartilla de Vacunación
              </button>
            </div>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={24} /></button>
          </div>
        </div>

        {/* TABS DE NAVEGACIÓN MÓVIL */}
        <div className="sm:hidden flex p-2 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
          <button onClick={() => setActiveTab('historial')} className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'historial' ? 'bg-white dark:bg-[#1E293B] text-[#3B82F6] shadow-sm' : 'text-[#64748B]'}`}>
            <FileText size={14} /> Historial
          </button>
          <button onClick={() => setActiveTab('cartilla')} className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'cartilla' ? 'bg-white dark:bg-[#1E293B] text-[#3B82F6] shadow-sm' : 'text-[#64748B]'}`}>
            <Syringe size={14} /> Vacunas
          </button>
        </div>

        {/* Body Expediente */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-[#3B82F6]">
              <Loader2 size={48} className="animate-spin mb-4" />
              <p className="font-bold text-[#64748B]">Abriendo expediente médico...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-600 p-6 rounded-xl font-bold text-center border border-rose-200">
              Error al leer el expediente: {error.message}
            </div>
          )}

          {paciente && (
            <>
              {/* Alertas Médicas Críticas */}
              {tieneAlergias && (
                <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                  <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-rose-700 dark:text-rose-400 text-sm uppercase tracking-wide">Alerta Médica Crítica</h4>
                    <p className="text-rose-600 dark:text-rose-300 font-medium mt-1">{paciente.alergias}</p>
                  </div>
                </div>
              )}

              {/* PESTAÑA: HISTORIAL GENERAL */}
              {activeTab === 'historial' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full animate-in fade-in slide-in-from-left-4 duration-300">
                  
                  {/* Historial de Citas y Consultas (Línea de tiempo) */}
                  <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[20px] shadow-sm border border-black/5 dark:border-white/5 p-6">
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2 mb-6">
                      <FileText className="text-[#3B82F6]" /> Historial de Consultas
                    </h3>

                    {paciente.citas && paciente.citas.length > 0 ? (
                      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-black/10 dark:before:via-white/10 before:to-transparent">
                        {paciente.citas.map((cita) => (
                          <div key={cita.id_cita} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            {/* Icono Timeline */}
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#FFFFFF] dark:border-[#1E293B] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${cita.consulta ? 'bg-emerald-500 text-white' : (cita.estado === 'Completada' ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-500')}`}>
                              {cita.consulta ? <Stethoscope size={16} /> : (cita.estado === 'Completada' ? <AlertTriangle size={16} /> : <CalendarIcon size={16} />)}
                            </div>
                            
                            {/* Tarjeta de Contenido */}
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 shadow-sm">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">{formatearFecha(cita.fecha_hora)}</span>
                              </div>
                              <h4 className="font-bold text-[#0F172A] dark:text-white text-base mb-2">{cita.motivo}</h4>
                              
                              {cita.consulta ? (
                                <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 space-y-3">
                                  <div className="flex gap-4">
                                    <span className="text-xs font-medium text-[#64748B] flex items-center gap-1"><Weight size={14}/> {cita.consulta.peso_actual}kg</span>
                                    <span className="text-xs font-medium text-[#64748B] flex items-center gap-1"><Thermometer size={14}/> {cita.consulta.temperatura}°C</span>
                                    <span className="text-xs font-medium text-[#64748B] flex items-center gap-1"><HeartPulse size={14}/> {cita.consulta.frecuencia_cardiaca} lpm</span>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#0F172A] dark:text-white font-medium"><strong>Dx:</strong> {cita.consulta.diagnostico}</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-4">
                                  {cita.estado === 'Completada' || cita.estado === 'Pendiente' ? (
                                    <Button variant="outline" className="w-full !py-2 text-xs border-dashed border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50 dark:hover:bg-blue-500/10" onClick={() => setCitaSeleccionada(cita.id_cita)}>
                                      <Plus size={14} className="mr-1" /> Registrar Consulta Médica
                                    </Button>
                                  ) : (
                                    <p className="text-xs text-rose-500 font-medium italic">Cita {cita.estado}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-[#64748B]">No hay historial de consultas registrado.</div>
                    )}
                  </div>

                  {/* Historial de Hospitalizaciones */}
                  <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[20px] shadow-sm border border-black/5 dark:border-white/5 p-6 h-fit">
                    <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2 mb-6">
                      <Activity className="text-purple-500" /> Hospitalizaciones
                    </h3>
                    {paciente.hospitalizaciones && paciente.hospitalizaciones.length > 0 ? (
                      <div className="space-y-4">
                        {paciente.hospitalizaciones.map((hosp, i) => (
                          <div key={i} className="p-3 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-xl border border-black/5 dark:border-white/5">
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-purple-500">{new Date(hosp.fecha_ingreso).toLocaleDateString()}</span>
                              {hosp.estado === 'Alta' ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Alta</span>
                              ) : (
                                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold animate-pulse">Internado</span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-[#0F172A] dark:text-white">{hosp.motivo}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-sm text-[#64748B]">Sin registros de hospitalización.</div>
                    )}
                  </div>

                </div>
              )}

              {/* PESTAÑA: CARTILLA DE VACUNACIÓN */}
              {activeTab === 'cartilla' && (
                <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[20px] shadow-sm border border-black/5 dark:border-white/5 p-6 min-h-[50vh] animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                        <Syringe className="text-[#3B82F6]" /> Cartilla Virtual de Vacunación
                      </h3>
                      <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Historial de inmunizaciones y control de peso de {paciente.nombre}.</p>
                    </div>
                    <Button variant="primary" onClick={() => setIsNuevaVacunaOpen(true)} className="flex items-center gap-2 shadow-md">
                      <Plus size={18} /> Registrar Aplicación
                    </Button>
                  </div>

                  {loadingCartilla ? (
                    <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={32} /></div>
                  ) : dataCartilla?.getCartillaPaciente.length === 0 ? (
                    <div className="text-center py-16 bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                      <ShieldAlert size={48} className="mx-auto text-[#64748B] opacity-30 mb-4" />
                      <h4 className="text-lg font-bold text-[#0F172A] dark:text-white mb-2">Cartilla en Blanco</h4>
                      <p className="text-[#64748B] dark:text-[#94A3B8]">Aún no hay vacunas registradas para este paciente.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {dataCartilla?.getCartillaPaciente.map((registro) => {
                        const hoy = new Date();
                        const isVencida = registro.proxima_dosis && new Date(registro.proxima_dosis) < hoy;
                        const proximaDosisStr = registro.proxima_dosis ? new Date(registro.proxima_dosis).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' }) : 'No requiere';
                        
                        return (
                          <div key={registro.id_registro_vac} className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            
                            {/* Barra de Color de Estado */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isVencida ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>

                            <div className="flex justify-between items-start mb-4 pl-2">
                              <h4 className="font-bold text-lg text-[#0F172A] dark:text-white leading-tight pr-2">{registro.vacuna.nombre_vacuna}</h4>
                              <div className="bg-white dark:bg-[#1E293B] p-2 rounded-full shadow-sm shrink-0">
                                <Syringe size={18} className={isVencida ? 'text-rose-500' : 'text-emerald-500'} />
                              </div>
                            </div>

                            <div className="space-y-3 pl-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-[#64748B] dark:text-[#94A3B8]">Aplicada:</span>
                                <span className="font-bold text-[#0F172A] dark:text-white">
                                  {new Date(registro.fecha_aplicacion).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: '2-digit' })}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-[#64748B] dark:text-[#94A3B8]">Peso:</span>
                                <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1">
                                  <Weight size={14} className="text-[#3B82F6]"/> {registro.peso_al_vacunar} kg
                                </span>
                              </div>
                              
                              <div className="pt-3 mt-3 border-t border-black/5 dark:border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-[#64748B] dark:text-[#94A3B8]">Próxima Dosis:</span>
                                  <span className={`font-bold px-2 py-1 rounded-md text-[11px] flex items-center gap-1 ${isVencida ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'}`}>
                                    {isVencida ? <AlertTriangle size={12}/> : <ShieldCheck size={12}/>}
                                    {proximaDosisStr}
                                  </span>
                                </div>
                              </div>
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Hijo para Nueva Consulta */}
      <NuevaConsultaModal 
        isOpen={!!citaSeleccionada} 
        citaId={citaSeleccionada} 
        onClose={() => setCitaSeleccionada(null)} 
      />

      {/* Modal Hijo para Registrar Vacuna */}
      {pacienteId && (
        <ModalNuevaVacuna
          isOpen={isNuevaVacunaOpen}
          pacienteId={pacienteId}
          onClose={() => setIsNuevaVacunaOpen(false)}
        />
      )}
    </div>
  );
};