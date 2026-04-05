import React, { useState } from 'react';
import { 
  Stethoscope, Clock, History, Search, FileText, 
  User, PawPrint, Calendar as CalendarIcon, Loader2, 
  Thermometer, Weight, ChevronRight, Plus
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// IMPORTACIÓN CORRECTA AL COMPONENTE QUE ACABAMOS DE CREAR
import { NuevaConsultaModal } from '../components/NuevaConsultaModal';
// NUEVA IMPORTACIÓN PARA EL INGRESO RÁPIDO
import { NuevaCitaModal } from '../components/NuevaCitaModal';

// ==========================================
// 1. QUERIES DE APOLLO
// ==========================================

// Query 1: Para la Sala de Espera (Reutilizada de la Agenda)
const GET_CITAS_SALA_ESPERA = gql`
  query GetCitasSalaEspera {
    citas {
      id_cita
      fecha_hora
      motivo
      estado
      paciente {
        nombre
        especie
        raza
        cliente {
          nombre_completo
        }
      }
      empleado {
        nombre
      }
    }
  }
`;

// Query 2: NUEVA - Proporcionada por Backend para el Historial
const GET_HISTORIAL_CONSULTAS = gql`
  query GetHistorialConsultas {
    consultas {
      id_consulta
      peso_actual
      temperatura
      diagnostico
      cita {
        fecha_hora
        paciente {
          nombre
          especie
        }
        empleado {
          nombre
        }
      }
    }
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface CitaSalaEspera {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado: string;
  paciente: {
    nombre: string;
    especie: string;
    raza: string;
    cliente: { nombre_completo: string };
  };
  empleado: { nombre: string };
}

interface ConsultaHistorial {
  id_consulta: number;
  peso_actual: number;
  temperatura: number;
  diagnostico: string;
  cita: {
    fecha_hora: string;
    paciente: {
      nombre: string;
      especie: string;
    };
    empleado: {
      nombre: string;
    };
  } | null; // Nullable por seguridad de DB
}

// ==========================================
// 3. VISTA PRINCIPAL
// ==========================================
export const ConsultasView = () => {
  // Pestaña activa: 'sala' o 'historial'
  const [activeTab, setActiveTab] = useState<'sala' | 'historial'>('sala');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para abrir el formulario médico
  const [citaAAtender, setCitaAAtender] = useState<number | null>(null);

  // NUEVO: Estado para abrir el ingreso rápido (cita sin reserva)
  const [isNuevaCitaOpen, setIsNuevaCitaOpen] = useState(false);

  // Ejecutamos ambas queries sin caché para que siempre estén frescas
  const { data: dataSala, loading: loadingSala, error: errorSala } = useQuery<{citas: CitaSalaEspera[]}>(GET_CITAS_SALA_ESPERA, {
    fetchPolicy: 'network-only'
  });
  const { data: dataHistorial, loading: loadingHistorial, error: errorHistorial } = useQuery<{consultas: ConsultaHistorial[]}>(GET_HISTORIAL_CONSULTAS, {
    fetchPolicy: 'network-only'
  });

  // --- LÓGICA PARA SALA DE ESPERA ---
  const citasDeHoy = dataSala?.citas?.filter(cita => {
    // Solo citas "Pendientes"
    if (cita.estado !== 'Pendiente') return false;
    
    // Solo citas de "Hoy"
    const fechaCita = new Date(cita.fecha_hora);
    const hoy = new Date();
    return fechaCita.getDate() === hoy.getDate() &&
           fechaCita.getMonth() === hoy.getMonth() &&
           fechaCita.getFullYear() === hoy.getFullYear();
  }).sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime()) || []; // Ordenar por hora

  // --- LÓGICA PARA HISTORIAL DE CONSULTAS ---
  const consultasFiltradas = dataHistorial?.consultas?.filter(consulta => {
    const busqueda = searchTerm.toLowerCase();
    const nombrePaciente = consulta.cita?.paciente?.nombre?.toLowerCase() || '';
    const nombreMedico = consulta.cita?.empleado?.nombre?.toLowerCase() || '';
    const diagnostico = consulta.diagnostico?.toLowerCase() || '';
    const idStr = consulta.id_consulta.toString();

    return nombrePaciente.includes(busqueda) || 
           nombreMedico.includes(busqueda) || 
           diagnostico.includes(busqueda) ||
           idStr.includes(busqueda);
  }).sort((a, b) => {
    // Ordenar más recientes primero
    const dateA = a.cita ? new Date(a.cita.fecha_hora).getTime() : 0;
    const dateB = b.cita ? new Date(b.cita.fecha_hora).getTime() : 0;
    return dateB - dateA;
  }) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado y Pestañas */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Stethoscope className="text-[#3B82F6]" size={28}/> 
            Módulo Médico
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Sala de espera en tiempo real e historial de diagnósticos.</p>
        </div>
        
        <div className="flex p-1 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
          <button 
            onClick={() => setActiveTab('sala')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sala' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <Clock size={16} /> Sala de Espera
          </button>
          <button 
            onClick={() => setActiveTab('historial')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historial' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            <History size={16} /> Historial Clínico
          </button>
        </div>
      </div>

      {/* ==========================================
          VISTA 1: SALA DE ESPERA (TURNOS DE HOY)
          ========================================== */}
      {activeTab === 'sala' && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* HEADER MODIFICADO: Agregado el botón de Ingreso Rápido */}
          <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
            <div className="flex items-center gap-2 text-[#0F172A] dark:text-white font-bold text-lg">
              Turnos del Día <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs ml-2 animate-pulse">{citasDeHoy.length} en espera</span>
            </div>
            <Button 
              variant="outline" 
              className="!py-1.5 !px-3 text-xs border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-1 shadow-sm"
              onClick={() => setIsNuevaCitaOpen(true)}
            >
              <Plus size={14} /> Ingreso Rápido
            </Button>
          </div>

          {loadingSala && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
          {errorSala && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-bold">Error al cargar la sala de espera: {errorSala.message}</div>}

          {!loadingSala && !errorSala && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {citasDeHoy.length > 0 ? citasDeHoy.map((cita) => {
                const hora = new Date(cita.fecha_hora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={cita.id_cita} className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-2xl p-5 border-l-4 border-l-[#3B82F6] shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group flex flex-col">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">{hora}</span>
                        <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mt-1">Con: Dr. {cita.empleado.nombre}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xl">
                        {cita.paciente.nombre.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div>
                        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">{cita.paciente.nombre}</h3>
                        <p className="text-sm font-medium text-[#3B82F6]">{cita.paciente.especie} • {cita.paciente.raza}</p>
                      </div>
                      <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
                        <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold uppercase mb-1">Motivo de Visita</p>
                        <p className="text-sm font-medium text-[#0F172A] dark:text-white line-clamp-2">{cita.motivo}</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => setCitaAAtender(cita.id_cita)}
                      className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-blue-500/30 flex justify-between items-center group-hover:pl-6 transition-all"
                    >
                      Atender Paciente <ChevronRight size={18} className="opacity-50 group-hover:opacity-100 transition-opacity"/>
                    </Button>
                  </div>
                )
              }) : (
                <div className="col-span-full bg-white dark:bg-[#1E293B] rounded-2xl p-12 text-center border border-dashed border-black/10 dark:border-white/10">
                  <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Sala de espera vacía</h3>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">No hay pacientes pendientes por atender el día de hoy.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          VISTA 2: HISTORIAL MÉDICO (TABLA GENERAL)
          ========================================== */}
      {activeTab === 'historial' && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex">
            <Input 
              icon={Search} type="text" placeholder="Buscar por paciente, diagnóstico o médico..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" 
            />
          </div>

          {loadingHistorial && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
          {errorHistorial && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-bold">Error al cargar historial: {errorHistorial.message}</div>}

          {!loadingHistorial && !errorHistorial && (
            <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
              <div className="overflow-x-auto pb-24 -mb-24">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Folio / Fecha</th>
                      <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Paciente</th>
                      <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Diagnóstico Principal</th>
                      <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Signos Vitales</th>
                      <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Médico Tratante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {consultasFiltradas.length > 0 ? (
                      consultasFiltradas.map((consulta) => {
                        const fechaObj = consulta.cita ? new Date(consulta.cita.fecha_hora) : null;
                        const fechaStr = fechaObj ? fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Sin fecha';
                        const horaStr = fechaObj ? fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '';

                        return (
                          <tr key={consulta.id_consulta} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                            
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <span className="font-black text-[#0F172A] dark:text-white">Dx-{consulta.id_consulta}</span>
                                <span className="text-xs font-bold text-[#64748B] flex items-center gap-1"><CalendarIcon size={12}/> {fechaStr}</span>
                                {horaStr && <span className="text-[10px] text-[#64748B]">{horaStr} hrs</span>}
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <PawPrint size={16} className="text-[#3B82F6]" />
                                <div>
                                  <p className="font-bold text-[#0F172A] dark:text-white">{consulta.cita?.paciente?.nombre || 'Desconocido'}</p>
                                  <p className="text-xs text-[#64748B]">{consulta.cita?.paciente?.especie || '-'}</p>
                                </div>
                              </div>
                            </td>

                            <td className="px-6 py-4 max-w-[250px]">
                              <p className="text-sm font-medium text-[#0F172A] dark:text-white truncate" title={consulta.diagnostico}>
                                {consulta.diagnostico}
                              </p>
                            </td>

                            <td className="px-6 py-4">
                              <div className="flex gap-3 text-xs font-bold">
                                <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><Weight size={12}/> {consulta.peso_actual}kg</span>
                                <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-1 rounded-md"><Thermometer size={12}/> {consulta.temperatura}°C</span>
                              </div>
                            </td>

                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 font-medium text-[#64748B] dark:text-[#94A3B8]">
                                <User size={14} className="text-[#3B82F6]"/> Dr. {consulta.cita?.empleado?.nombre || 'Sin asignar'}
                              </span>
                            </td>

                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                          No se encontraron consultas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para Registrar la Consulta de forma segura y unificada */}
      <NuevaConsultaModal 
        isOpen={!!citaAAtender} 
        citaId={citaAAtender} 
        onClose={() => setCitaAAtender(null)} 
      />

      {/* NUEVO: Modal para Ingreso Rápido de Citas sin reserva previa */}
      <NuevaCitaModal 
        isOpen={isNuevaCitaOpen} 
        onClose={() => setIsNuevaCitaOpen(false)} 
      />

    </div>
  );
};