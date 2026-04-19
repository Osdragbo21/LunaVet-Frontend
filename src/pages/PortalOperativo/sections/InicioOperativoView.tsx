import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronRight, Stethoscope, ShoppingCart, Users, Activity,
  ShieldCheck, ArrowUpRight, Sparkles, Calendar as CalendarIcon, 
  Clock, PawPrint, User, CheckCircle, Loader2, BarChart2
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

// REGLA ESTRICTA DE APOLLO APLICADA
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

// ==========================================
// 1. QUERY AMPLIADA
// ==========================================
const GET_DATOS_INICIO_OPERATIVO = gql`
  query GetDatosInicioOperativo {
    citas {
      id_cita
      fecha_hora
      motivo
      estado
      origen_cita
      paciente {
        nombre
        especie
        cliente {
          nombre_completo
        }
      }
      empleado {
        nombre
      }
    }
    pacientes {
      id_paciente
      especie
    }
    hospitalizaciones {
      id_hospitalizacion
      estado
    }
  }
`;

// ==========================================
// INTERFACES
// ==========================================
interface PacienteData {
  id_paciente: number;
  especie: string;
}

interface HospitalizacionData {
  id_hospitalizacion: number;
  estado: string;
}

interface CitaData {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado: string;
  origen_cita: string;
  paciente: {
    nombre: string;
    especie: string;
    cliente: {
      nombre_completo: string;
    };
  };
  empleado: {
    nombre: string;
  };
}

export const InicioOperativoView = () => {
  const [greeting, setGreeting] = useState('Bienvenido');
  const { data, loading } = useQuery<{
    citas: CitaData[], 
    pacientes: PacienteData[],
    hospitalizaciones: HospitalizacionData[]
  }>(GET_DATOS_INICIO_OPERATIVO, { fetchPolicy: 'network-only' });
  
  // Datos del usuario
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const nombreReal = user?.nombre || (user?.username ? user.username.split('.')[0] : 'Doctor(a)');
  const rolNombre = user?.rol?.nombre || 'Personal Médico';

  // Saludo dinámico
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días');
    else if (hour < 19) setGreeting('Buenas tardes');
    else setGreeting('Buenas noches');
  }, []);

  // Navegación Global
  const handleNavigate = (tab: string) => {
    const event = new CustomEvent('lunavet:switch-tab', { detail: tab });
    window.dispatchEvent(event);
  };

  // ==========================================
  // CÁLCULOS Y ESTADÍSTICAS
  // ==========================================
  const hoyStr = new Date().toISOString().split('T')[0];

  const citasDeHoy = useMemo(() => {
    if (!data?.citas) return [];
    return data.citas
      .filter(cita => cita.fecha_hora.startsWith(hoyStr))
      .sort((a, b) => new Date(a.fecha_hora).getTime() - new Date(b.fecha_hora).getTime());
  }, [data, hoyStr]);

  const especiesColorsHex: Record<string, string> = {
    'Perro': '#3B82F6',  // blue-500
    'Gato': '#8B5CF6',   // purple-500
    'Ave': '#F59E0B',    // amber-500
    'Reptil': '#10B981', // emerald-500
    'Roedor': '#F97316', // orange-500
    'Otro': '#64748B'    // slate-500
  };

  const especiesData = useMemo(() => {
    if (!data?.pacientes) return [];
    const counts: Record<string, number> = {};
    
    // Normalizador de nombres de especies
    const normalizarEspecie = (rawEspecie: string) => {
      const str = rawEspecie.trim().toLowerCase();
      if (str.includes('perro') || str.includes('canino')) return 'Perro';
      if (str.includes('gato') || str.includes('felino')) return 'Gato';
      if (str.includes('ave') || str.includes('pájaro') || str.includes('loro')) return 'Ave';
      if (str.includes('reptil') || str.includes('tortuga') || str.includes('iguana')) return 'Reptil';
      if (str.includes('roedor') || str.includes('conejo') || str.includes('hamster') || str.includes('hámster')) return 'Roedor';
      return 'Otro';
    };

    data.pacientes.forEach(p => {
      const especieKey = p.especie ? normalizarEspecie(p.especie) : 'Otro';
      counts[especieKey] = (counts[especieKey] || 0) + 1;
    });
    
    const total = data.pacientes.length || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({ 
        name, 
        count, 
        percentage: Math.round((count / total) * 100),
        colorHex: especiesColorsHex[name] || '#64748B'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [data]);

  const flujoSemanal = useMemo(() => {
    if (!data?.citas) return { max: 1, dias: [] };
    
    const ultimos7Dias = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    const dias = ultimos7Dias.map(fechaStr => {
      const dateObj = new Date(fechaStr + 'T12:00:00');
      const label = diasNombres[dateObj.getDay()];
      const count = data.citas.filter(c => c.fecha_hora.startsWith(fechaStr)).length;
      return { label, count, fecha: fechaStr };
    });

    const max = Math.max(...dias.map(d => d.count), 1);
    return { max, dias };
  }, [data]);

  const internados = data?.hospitalizaciones?.filter(h => h.estado !== 'Alta' && h.estado !== 'Fallecido').length || 0;
  const citasCompletadasHoy = citasDeHoy.filter(c => c.estado === 'Completada' || c.estado === 'Atendida' || c.estado === 'Realizada').length;

  const metricCards = [
    { title: "Pacientes Registrados", value: data?.pacientes?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Citas para Hoy", value: citasDeHoy.length, icon: CalendarIcon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "En Hospitalización", value: internados, icon: Activity, color: "text-rose-500", bg: "bg-rose-500/10" },
    { title: "Atendidas Hoy", value: citasCompletadasHoy, icon: CheckCircle, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const formatHora = (fechaIso: string) => {
    return new Date(fechaIso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="flex justify-center p-12 w-full"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>;
  }

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      
      {/* ======================================================== */}
      {/* 1. BANNER DE BIENVENIDA (Ajuste de Breakpoints a 'lg') */}
      {/* ======================================================== */}
      <div className="relative bg-white dark:bg-[#1E293B] rounded-[32px] p-6 sm:p-8 lg:p-10 border border-black/5 dark:border-white/5 shadow-sm flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full">
        
        {/* Contenedor de fondos con overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden rounded-[32px] pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#3B82F6]/10 to-[#8B5CF6]/10 dark:from-[#3B82F6]/20 dark:to-[#8B5CF6]/20 blur-3xl rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 blur-2xl rounded-full -mb-10"></div>
        </div>

        <div className="relative z-10 flex-1 w-full text-center lg:text-left min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 sm:mb-6">
            <Sparkles size={14} /> Turno Activo
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mb-3 sm:mb-4 leading-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] block sm:inline">Dr. {nombreReal}</span>
          </h1>
          
          <p className="text-[#64748B] dark:text-[#94A3B8] text-sm sm:text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-6 sm:mb-8 font-medium">
            Tu panel de control clínico está listo. Revisa tus pendientes del día o ingresa una venta rápida en mostrador.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4 justify-center lg:justify-start w-full">
            <Button variant="primary" onClick={() => handleNavigate('agenda')} className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-[16px] text-base shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 shrink-0">
              <CalendarIcon size={20} className="shrink-0" /> Ver mi Agenda
            </Button>
            <Button variant="outline" onClick={() => handleNavigate('nueva-venta')} className="w-full sm:w-auto flex items-center justify-center gap-2 h-12 px-6 rounded-[16px] text-base bg-white dark:bg-[#0F172A] shrink-0">
              <ShoppingCart size={20} className="text-[#64748B] shrink-0" /> Caja Rápida
            </Button>
          </div>
        </div>

        <div className="relative z-10 shrink-0 flex items-center justify-center mt-8 lg:mt-0">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 shrink-0">
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-blue-600/20 to-emerald-600/20 blur-2xl animate-pulse pointer-events-none"></div>
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-blue-500/20 dark:border-white/10 animate-spin-slow pointer-events-none"></div>
              <div className="relative z-10 w-full h-full overflow-hidden rounded-full border-8 border-white dark:border-[#1E293B] shadow-2xl">
                <img 
                  src="/Cat_c.png" 
                  alt="Avatar LunaVet" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  onError={(e) => e.currentTarget.src = "https://img.freepik.com/foto-gratis/lindo-perrito-abrazando-al-veterinario-joven_23-2148993883.jpg"}
                />
              </div>
          </div>
          <div className="absolute -bottom-4 z-20 bg-white dark:bg-[#0F172A] px-4 py-2 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 flex items-center gap-2 whitespace-nowrap">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">{rolNombre}</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TARJETAS DE MÉTRICAS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
        {metricCards.map((stat, index) => (
          <div key={index} className="bg-[#FFFFFF] dark:bg-[#1E293B] p-5 sm:p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm hover:-translate-y-1 transition-transform duration-300 min-w-0 flex flex-col">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
            <div className="min-w-0 w-full">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-white truncate">{stat.value}</h3>
              <p className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-[#94A3B8] mt-1 truncate">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

{/* ======================================================== */}
      {/* 3. GRÁFICAS CLÍNICAS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full">
        
        {/* Gráfica 1: Flujo de Consultas */}
        <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col h-full min-h-[320px] min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 w-full">
            <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2 truncate">
              <BarChart2 size={18} className="text-[#3B82F6] shrink-0"/> Flujo de Consultas
            </h3>
            <span className="text-[10px] uppercase font-bold text-[#64748B] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md self-start sm:self-auto shrink-0 whitespace-nowrap">
              Últimos 7 días
            </span>
          </div>
          
          <div className="flex-1 flex items-end gap-1 sm:gap-2 h-full mt-auto pt-2 w-full">
            {flujoSemanal.dias.map((dia, idx) => {
              const heightPercent = dia.count === 0 ? 5 : (dia.count / flujoSemanal.max) * 100;
              const isToday = dia.fecha === hoyStr;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 group relative h-full justify-end">
                  <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md z-10 whitespace-nowrap pointer-events-none">{dia.count} citas</div>
                  <div 
                    className={`w-full max-w-[32px] sm:max-w-[48px] rounded-t-md transition-all duration-500 ${isToday ? 'bg-[#3B82F6]' : 'bg-blue-100 dark:bg-blue-500/20 group-hover:bg-blue-300 dark:group-hover:bg-blue-500/40'}`}
                    style={{ height: `${heightPercent}%` }}
                  ></div>
                  <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold ${isToday ? 'text-[#3B82F6]' : 'text-[#64748B]'} truncate w-full text-center`}>{dia.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Gráfica 2: Especies */}
        <div className="bg-white dark:bg-[#1E293B] p-5 sm:p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col h-full min-h-[320px] min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 w-full">
            <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2 truncate">
              <PawPrint size={18} className="text-purple-500 shrink-0"/> Pacientes por Especie
            </h3>
          </div>
          
          <div className="flex-1 flex flex-col justify-evenly gap-3 w-full">
            {especiesData.length > 0 ? especiesData.map((especie, idx) => (
              <div key={idx} className="space-y-1.5 w-full">
                <div className="flex justify-between text-xs sm:text-sm font-bold w-full gap-2">
                  <span className="text-[#0F172A] dark:text-white truncate">{especie.name}</span>
                  <span className="text-[#64748B] shrink-0">{especie.percentage}% ({especie.count})</span>
                </div>
                <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2 overflow-hidden shrink-0">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${especie.percentage}%`, backgroundColor: especie.colorHex }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-center text-sm text-[#64748B]">No hay datos de pacientes aún.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. TABLA: ITINERARIO CLÍNICO DE HOY */}
      {/* ======================================================== */}
      <div className="w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6 mt-4 w-full">
          <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white flex items-center gap-2 truncate">
            <Clock size={20} className="sm:w-6 sm:h-6 text-[#3B82F6] shrink-0" />
            Itinerario Clínico de Hoy
          </h2>
          <span className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-[#94A3B8] bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full self-start sm:self-auto shrink-0 whitespace-nowrap">
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>

        {/* CONTENEDOR DE LA TABLA */}
        <div className="bg-white dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden w-full max-w-full min-w-0">
          <div className="overflow-x-auto custom-scrollbar w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5 text-xs font-black text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Hora / Estado</th>
                  <th className="p-4">Paciente / Dueño</th>
                  <th className="p-4">Motivo</th>
                  <th className="p-4">Médico Asignado</th>
                  <th className="p-4 pr-6 text-right">Acciones</th>
                </tr>
              </thead>
              
              <tbody>
                {citasDeHoy.length > 0 ? (
                  citasDeHoy.map((cita) => (
                    <tr key={cita.id_cita} className="border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      
                      <td className="p-4 pl-6 align-top">
                        <div className="flex flex-col gap-2 items-start">
                          <span className="text-sm font-black text-[#0F172A] dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                            <Clock size={16} className="text-[#3B82F6] shrink-0"/> {formatHora(cita.fecha_hora)}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border whitespace-nowrap ${
                            cita.estado === 'Pendiente' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 
                            cita.estado === 'En Consulta' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20' : 
                            'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20'
                          }`}>
                            {cita.estado}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 align-top max-w-[200px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 truncate w-full">
                            <PawPrint size={14} className="text-[#64748B] shrink-0"/> 
                            <span className="truncate">{cita.paciente.nombre}</span>
                            <span className="text-xs font-normal text-[#64748B] shrink-0">({cita.paciente.especie})</span>
                          </span>
                          <span className="text-xs text-[#64748B] flex items-center gap-1.5 pl-5 truncate w-full">
                            <User size={12} className="shrink-0"/> <span className="truncate">{cita.paciente.cliente.nombre_completo}</span>
                          </span>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] line-clamp-2 max-w-[200px]" title={cita.motivo}>
                          {cita.motivo}
                        </p>
                      </td>

                      <td className="p-4 align-top max-w-[150px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-[#0F172A] dark:text-white truncate">
                            Dr. {cita.empleado.nombre}
                          </span>
                          <span className="text-[10px] font-bold uppercase text-[#64748B] whitespace-nowrap">
                            Origen: {cita.origen_cita}
                          </span>
                        </div>
                      </td>

                      <td className="p-4 pr-6 align-top text-right">
                        <Button 
                          variant="outline" 
                          onClick={() => handleNavigate('consultas')}
                          className="px-3 py-1.5 text-xs h-auto rounded-[10px] inline-flex items-center gap-1.5 bg-white dark:bg-[#0F172A] whitespace-nowrap"
                        >
                          <Stethoscope size={14} className="shrink-0" /> Atender
                        </Button>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center w-full">
                        <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                          <CheckCircle size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Día libre de citas</h3>
                        <p className="text-sm text-[#64748B]">No tienes citas programadas para el día de hoy.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};