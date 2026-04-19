import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Plus, Clock, MapPin, User, PawPrint, 
  Phone, MoreHorizontal, CheckCircle, Ban, Loader2, XCircle,
  LayoutList, Grid3X3, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevaCitaModal } from '../components/NuevaCitaModal';

const GET_CITAS_AGENDA = gql`
  query GetCitasAgenda {
    citas {
      id_cita
      fecha_hora
      motivo
      estado
      origen_cita
      paciente {
        nombre
        especie
        raza
        cliente {
          nombre_completo
          telefono_principal
        }
      }
      empleado {
        nombre
        puesto
      }
    }
  }
`;

const UPDATE_ESTADO_CITA = gql`
  mutation UpdateEstadoCita($id: Int!, $nuevoEstado: String!) {
    updateEstadoCita(id: $id, nuevoEstado: $nuevoEstado) {
      id_cita
      estado
    }
  }
`;

// ==========================================
// INTERFACES DE TYPESCRIPT
// ==========================================
interface Cita {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado: string;
  origen_cita: string;
  paciente: {
    nombre: string;
    especie: string;
    raza: string;
    cliente: {
      nombre_completo: string;
      telefono_principal: string;
    };
  };
  empleado: {
    nombre: string;
    puesto: string;
  };
}

interface GetCitasResponse {
  citas: Cita[];
}

export const AgendaView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('Todas');
  const [menuEstadoAbierto, setMenuEstadoAbierto] = useState<number | null>(null);
  
  // NUEVO: Estados para la Vista Semanal
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Ajustar al Lunes
    return new Date(d.setDate(diff));
  });
  
  const { data, loading, error } = useQuery<GetCitasResponse>(GET_CITAS_AGENDA, {
    fetchPolicy: 'network-only'
  });
  
  const [updateEstado] = useMutation(UPDATE_ESTADO_CITA, {
    refetchQueries: ['GetCitasAgenda']
  });

  const handleCambiarEstado = async (idCita: number, nuevoEstado: string) => {
    try {
      await updateEstado({ variables: { id: idCita, nuevoEstado } });
      setMenuEstadoAbierto(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12}/> Pendiente</span>;
      case 'completada': return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle size={12}/> Completada</span>;
      case 'cancelada': return <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-full text-xs font-bold flex items-center gap-1"><Ban size={12}/> Cancelada</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{estado}</span>;
    }
  };

  const formatearFechaHora = (isoString: string) => {
    const fecha = new Date(isoString);
    return {
      dia: fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }),
      hora: fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const citasFiltradas = data?.citas?.filter((cita) => {
    return filtroEstado === 'Todas' || cita.estado === filtroEstado;
  }) || [];

  // ==========================================
  // LÓGICA DEL CALENDARIO SEMANAL
  // ==========================================
  const changeWeek = (offset: number) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + offset * 7);
    setCurrentWeekStart(newDate);
  };

  const getEndOfWeek = (start: Date) => {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return end;
  };

  const horasLaborales = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 a 20:00
  const diasSemana = [
    { label: 'Lunes', index: 1 }, { label: 'Martes', index: 2 }, 
    { label: 'Miércoles', index: 3 }, { label: 'Jueves', index: 4 }, 
    { label: 'Viernes', index: 5 }, { label: 'Sábado', index: 6 }, 
    { label: 'Domingo', index: 0 }
  ];

  // Helper para saber si una cita cae en la semana actual
  const isSameWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const start = new Date(currentWeekStart);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return d >= start && d <= end;
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-screen">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-[#3B82F6]" size={28}/> 
            Agenda Médica
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Controla las consultas y visitas programadas.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* NUEVO: Toggle de Vistas */}
          <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('lista')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'lista' ? 'bg-white dark:bg-[#1E293B] text-[#3B82F6] shadow-sm' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
            >
              <LayoutList size={16}/> Lista
            </button>
            <button 
              onClick={() => setViewMode('calendario')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'calendario' ? 'bg-white dark:bg-[#1E293B] text-[#3B82F6] shadow-sm' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'}`}
            >
              <Grid3X3 size={16}/> Calendario
            </button>
          </div>

          <Button variant="primary" className="!px-5 !py-2.5 shadow-md w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> Nueva Cita
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-[#3B82F6]">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-medium text-[#64748B] dark:text-[#94A3B8]">Cargando agenda...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold">
          Error de conexión: {error.message}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ========================================== */}
          {/* VISTA DE CALENDARIO SEMANAL                  */}
          {/* ========================================== */}
          {viewMode === 'calendario' && (
            <div className="flex flex-col gap-4 animate-in fade-in">
              {/* Controles de Semana */}
              <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-black/5 dark:border-white/5">
                <Button variant="outline" className="!px-3" onClick={() => changeWeek(-1)}><ChevronLeft size={20}/></Button>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
                    Semana del {currentWeekStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al {getEndOfWeek(currentWeekStart).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <Button variant="outline" className="!px-3" onClick={() => changeWeek(1)}><ChevronRight size={20}/></Button>
              </div>

              {/* Grid Semanal */}
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden overflow-x-auto shadow-sm">
                <div className="min-w-[800px]">
                  {/* Headers Días */}
                  <div className="grid grid-cols-8 border-b border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#0F172A]">
                    <div className="p-3 text-center border-r border-black/5 dark:border-white/5">
                      <Clock size={16} className="mx-auto text-[#64748B]"/>
                    </div>
                    {diasSemana.map((dia) => {
                      // Calcular fecha exacta de ese día en la columna
                      const fechaColumna = new Date(currentWeekStart);
                      const diff = dia.index === 0 ? 6 : dia.index - 1; 
                      fechaColumna.setDate(fechaColumna.getDate() + diff);
                      const esHoy = new Date().toDateString() === fechaColumna.toDateString();

                      return (
                        <div key={dia.label} className={`p-3 text-center border-r border-black/5 dark:border-white/5 last:border-0 ${dia.index === 0 ? 'bg-rose-50/50 dark:bg-rose-500/5' : ''}`}>
                          <p className={`text-xs font-black uppercase tracking-wider ${esHoy ? 'text-[#3B82F6]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>{dia.label}</p>
                          <p className={`text-lg font-bold ${esHoy ? 'text-[#3B82F6]' : 'text-[#0F172A] dark:text-white'}`}>{fechaColumna.getDate()}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cuerpo Horas */}
                  {horasLaborales.map((hora) => (
                    <div key={hora} className="grid grid-cols-8 border-b border-black/5 dark:border-white/5 last:border-0">
                      {/* Columna de la Hora */}
                      <div className="p-2 text-center border-r border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#0F172A]/50 flex items-center justify-center">
                        <span className="text-xs font-bold text-[#64748B]">{`${hora.toString().padStart(2, '0')}:00`}</span>
                      </div>
                      
                      {/* Celdas de los Días */}
                      {diasSemana.map((dia) => {
                        // Encontrar citas que coincidan con este día y esta hora
                        const citasEnCelda = citasFiltradas.filter(c => {
                          const fechaCita = new Date(c.fecha_hora);
                          return isSameWeek(c.fecha_hora) && fechaCita.getDay() === dia.index && fechaCita.getHours() === hora;
                        });

                        return (
                          <div key={`${dia.label}-${hora}`} className={`p-1 min-h-[60px] border-r border-black/5 dark:border-white/5 last:border-0 relative hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${dia.index === 0 ? 'bg-rose-50/30 dark:bg-rose-500/5 cursor-not-allowed' : ''}`}>
                            {citasEnCelda.map(cita => {
                              // Colores dinámicos por estado para el calendario
                              let bgBadge = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
                              if (cita.estado === 'Completada') bgBadge = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300';
                              if (cita.estado === 'Cancelada') bgBadge = 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300';
                              if (cita.origen_cita === 'Urgencia') bgBadge = 'bg-red-500 text-white dark:bg-red-600 dark:text-white ring-2 ring-red-200';

                              return (
                                <div key={cita.id_cita} className={`p-1.5 mb-1 rounded-lg text-xs leading-tight shadow-sm border border-black/5 ${bgBadge}`}>
                                  <p className="font-bold truncate" title={cita.paciente.nombre}>{cita.paciente.nombre}</p>
                                  <p className="opacity-80 truncate text-[10px]" title={cita.motivo}>{cita.motivo}</p>
                                </div>
                              )
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* VISTA DE LISTA (Tarjetas originales)         */}
          {/* ========================================== */}
          {viewMode === 'lista' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Pestañas de Filtro por Estado (Solo se ven en lista) */}
              <div className="flex space-x-2 border-b border-black/5 dark:border-white/5 overflow-x-auto pb-2 custom-scrollbar">
                {['Todas', 'Pendiente', 'Completada', 'Cancelada'].map(estado => (
                  <button 
                    key={estado}
                    onClick={() => setFiltroEstado(estado)}
                    className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${filtroEstado === estado ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'}`}
                  >
                    {estado}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {citasFiltradas.length > 0 ? (
                  citasFiltradas.map((cita) => {
                    const { dia, hora } = formatearFechaHora(cita.fecha_hora);
                    return (
                      <div key={cita.id_cita} className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5 relative group hover:shadow-md transition-shadow flex flex-col">
                        
                        {/* Header Tarjeta */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xl font-black text-[#0F172A] dark:text-white leading-none">{hora}</p>
                            <p className="text-xs text-[#64748B] font-medium capitalize mt-1">{dia}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(cita.estado)}
                            
                            {/* Menú de Acciones */}
                            <div className="relative">
                              <button onClick={() => setMenuEstadoAbierto(menuEstadoAbierto === cita.id_cita ? null : cita.id_cita)} className="p-1 text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                                <MoreHorizontal size={18}/>
                              </button>
                              
                              {menuEstadoAbierto === cita.id_cita && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setMenuEstadoAbierto(null)}></div>
                                  <div className="absolute right-0 top-8 w-44 bg-white dark:bg-[#0F172A] rounded-xl shadow-lg border border-black/5 dark:border-white/10 py-1 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <button onClick={() => handleCambiarEstado(cita.id_cita, 'Completada')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-2">
                                      <CheckCircle size={14}/> Marcar Completada
                                    </button>
                                    <button onClick={() => handleCambiarEstado(cita.id_cita, 'Pendiente')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center gap-2">
                                      <Clock size={14}/> Marcar Pendiente
                                    </button>
                                    <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                                    <button onClick={() => handleCambiarEstado(cita.id_cita, 'Cancelada')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2">
                                      <XCircle size={14}/> Cancelar Cita
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Cuerpo Tarjeta (Info) */}
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                              {cita.paciente.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-[#0F172A] dark:text-white leading-tight">{cita.paciente.nombre}</p>
                              <p className="text-xs text-[#64748B]">{cita.paciente.especie} • {cita.paciente.raza}</p>
                            </div>
                          </div>

                          <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5 space-y-2">
                            <p className="text-xs text-[#0F172A] dark:text-white font-medium flex items-center gap-2">
                              <User size={14} className="text-[#64748B]"/> {cita.paciente.cliente.nombre_completo}
                            </p>
                            <p className="text-xs text-[#0F172A] dark:text-white font-medium flex items-center gap-2">
                              <Phone size={14} className="text-[#64748B]"/> {cita.paciente.cliente.telefono_principal}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase text-[#64748B] tracking-wider mb-1">Motivo de Visita</p>
                            <p className="text-sm font-medium text-[#0F172A] dark:text-white line-clamp-2">{cita.motivo}</p>
                          </div>
                        </div>

                        {/* Footer Tarjeta */}
                        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex justify-between items-center text-xs font-medium text-[#64748B]">
                          <span>Dr. {cita.empleado.nombre}</span>
                          <span className="bg-[#F8FAFC] dark:bg-[#0F172A] px-2 py-1 rounded-md">{cita.origen_cita}</span>
                        </div>

                      </div>
                    );
                  })
                ) : (
                   <div className="col-span-full py-12 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
                     <CalendarIcon size={48} className="mx-auto text-[#64748B] opacity-50 mb-3" />
                     <p className="text-[#0F172A] dark:text-white font-bold text-lg">No hay citas programadas</p>
                     <p className="text-[#64748B] dark:text-[#94A3B8] text-sm">Cambia de estado en el filtro o añade una nueva.</p>
                   </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <NuevaCitaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};