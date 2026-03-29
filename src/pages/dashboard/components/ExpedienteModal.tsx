import React, { useState } from 'react';
// 1. CORRECCIÓN: Importamos Activity y Plus que faltaban
import { 
  X, Calendar as CalendarIcon, Stethoscope, AlertTriangle, 
  FileText, Loader2, Thermometer, Weight, HeartPulse, 
  CheckCircle, Clock, Activity, Plus 
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevaConsultaModal } from './NuevaConsultaModal';

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
// 2. CORRECCIÓN: INTERFACES DE TYPESCRIPT
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

interface ExpedienteModalProps {
  isOpen: boolean;
  pacienteId: number | null;
  onClose: () => void;
}

export const ExpedienteModal: React.FC<ExpedienteModalProps> = ({ isOpen, pacienteId, onClose }) => {
  const [citaSeleccionada, setCitaSeleccionada] = useState<number | null>(null);

  // Inyectamos la interfaz en useQuery para eliminar el error de data?.paciente
  const { data, loading, error } = useQuery<GetExpedientePacienteResponse>(GET_EXPEDIENTE_PACIENTE, {
    variables: { id: pacienteId },
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
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={24} /></button>
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                
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
    </div>
  );
};