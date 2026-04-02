import React, { useState } from 'react';
import { 
  Activity, Plus, Clock, User, Phone, CheckCircle, 
  History, Search, Loader2, AlertTriangle, X 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoIngresoModal } from '../components/NuevoIngresoModal';

// QUERIES DEL BACKEND
const GET_HOSPITALIZACIONES = gql`
  query GetHospitalizaciones {
    hospitalizaciones {
      id_hospitalizacion
      fecha_ingreso
      fecha_alta
      motivo
      estado
      paciente {
        nombre
        especie
        cliente {
          nombre_completo
          telefono_principal
        }
      }
    }
  }
`;

const UPDATE_HOSPITALIZACION = gql`
  mutation UpdateHospitalizacion($input: UpdateHospitalizacionInput!) {
    updateHospitalizacion(updateInput: $input) {
      id_hospitalizacion
      fecha_alta
      estado
    }
  }
`;

// INTERFACES
interface Hospitalizacion {
  id_hospitalizacion: number;
  fecha_ingreso: string;
  fecha_alta: string | null;
  motivo: string;
  estado: string;
  paciente: {
    nombre: string;
    especie: string;
    cliente: {
      nombre_completo: string;
      telefono_principal: string;
    };
  } | null;
}

// MODAL CONFIRMACIÓN ALTA
const ModalDarDeAlta = ({ isOpen, hospId, onClose }: { isOpen: boolean, hospId: number | null, onClose: () => void }) => {
  const [updateHospitalizacion, { loading }] = useMutation(UPDATE_HOSPITALIZACION, {
    refetchQueries: ['GetHospitalizaciones', 'GetExpedientePaciente']
  });

  const handleAlta = async () => {
    if (!hospId) return;
    try {
      await updateHospitalizacion({
        variables: {
          input: {
            id_hospitalizacion: hospId,
            estado: 'Alta',
            fecha_alta: new Date().toISOString()
          }
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !hospId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Dar de Alta al Paciente?</h2>
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-6 font-medium">
          El paciente será marcado como 'Alta', se registrará su salida y pasará al historial médico.
        </p>
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">Cancelar</Button>
          <Button onClick={handleAlta} disabled={loading} className="w-1/2 bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Confirmar Alta"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const HospitalizacionView = () => {
  const [activeTab, setActiveTab] = useState<'internados' | 'historial'>('internados');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalNewOpen, setIsModalNewOpen] = useState(false);
  const [hospAAlta, setHospAAlta] = useState<number | null>(null);

  const { data, loading, error } = useQuery<{hospitalizaciones: Hospitalizacion[]}>(GET_HOSPITALIZACIONES, {
    pollInterval: 15000 // Refresco cada 15s por si otro doctor ingresa a alguien
  });

  const formatearFechaHora = (isoString: string) => {
    const d = new Date(isoString);
    return `${d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - ${d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getAvatarColor = (nombre: string) => {
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-cyan-100 text-cyan-600', 'bg-orange-100 text-orange-600', 'bg-fuchsia-100 text-fuchsia-600', 'bg-rose-100 text-rose-600'];
    return colors[(nombre?.charCodeAt(0) || 0) % colors.length];
  };

  const registros = data?.hospitalizaciones || [];
  
  // Separar Activos vs Historial
  const internados = registros.filter(h => h.estado !== 'Alta');
  
  const historialFiltrado = registros.filter(h => h.estado === 'Alta' && (
    h.paciente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.paciente?.cliente.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.motivo.toLowerCase().includes(searchTerm.toLowerCase())
  )).sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime());

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Activity className="text-[#3B82F6]" size={28}/> 
            Centro de Hospitalización
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Control de pacientes internados, jaulas y altas médicas.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="flex p-1 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
            <button onClick={() => setActiveTab('internados')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'internados' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <Activity size={16} /> Internados
              {internados.length > 0 && <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'internados' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'}`}>{internados.length}</span>}
            </button>
            <button onClick={() => setActiveTab('historial')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'historial' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] hover:bg-black/5 dark:hover:bg-white/5'}`}>
              <History size={16} /> Historial
            </button>
          </div>
          <Button variant="primary" className="!px-4" onClick={() => setIsModalNewOpen(true)}>
            <Plus size={18} className="sm:mr-2" /> <span className="hidden sm:inline">Nuevo Ingreso</span>
          </Button>
        </div>
      </div>

      {loading && !data && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl font-bold">Error de conexión: {error.message}</div>}

      {/* VISTA 1: INTERNADOS (TARJETAS) */}
      {activeTab === 'internados' && !loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {internados.length > 0 ? internados.map((hosp) => (
            <div key={hosp.id_hospitalizacion} className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 shadow-sm border border-black/5 dark:border-white/5 flex flex-col hover:shadow-md transition-all group">
              
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-inner ${getAvatarColor(hosp.paciente?.nombre || '')}`}>
                    {hosp.paciente?.nombre?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0F172A] dark:text-white text-lg leading-tight">{hosp.paciente?.nombre || 'Desconocido'}</h3>
                    <p className="text-xs text-[#64748B] font-medium">{hosp.paciente?.especie || 'N/A'}</p>
                  </div>
                </div>
                <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase animate-pulse border border-rose-200">
                  Internado
                </span>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
                  <p className="text-[10px] font-black text-[#64748B] uppercase tracking-wider mb-1 flex items-center gap-1"><AlertTriangle size={12}/> Motivo de Ingreso</p>
                  <p className="text-sm font-medium text-[#0F172A] dark:text-white line-clamp-3">{hosp.motivo}</p>
                </div>
                
                <div className="flex flex-col gap-1.5 text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                  <span className="flex items-center gap-2"><Clock size={14} className="text-[#3B82F6]"/> Entró: {formatearFechaHora(hosp.fecha_ingreso)}</span>
                  <div className="h-px w-full bg-black/5 dark:bg-white/5 my-1"></div>
                  <span className="flex items-center gap-2"><User size={14}/> Dueño: {hosp.paciente?.cliente?.nombre_completo || 'N/A'}</span>
                  <span className="flex items-center gap-2"><Phone size={14}/> Tel: {hosp.paciente?.cliente?.telefono_principal || 'N/A'}</span>
                </div>
              </div>

              {/* BOTÓN CORREGIDO: variant="outline" y colores forzados */}
              <Button 
                variant="outline"
                onClick={() => setHospAAlta(hosp.id_hospitalizacion)}
                className="w-full mt-5 !bg-emerald-50 !text-emerald-600 !border-emerald-200 hover:!bg-emerald-500 hover:!text-white dark:!bg-emerald-500/10 dark:!text-emerald-400 dark:hover:!bg-emerald-600 dark:hover:!text-white dark:!border-emerald-500/20 transition-all font-bold"
              >
                <CheckCircle size={18} className="mr-2" /> Dar de Alta Médica
              </Button>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
              <Activity size={48} className="mx-auto text-emerald-500 opacity-50 mb-4" />
              <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Instalaciones Libres</h3>
              <p className="text-[#64748B] dark:text-[#94A3B8]">No hay pacientes hospitalizados en este momento.</p>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: HISTORIAL (TABLA) */}
      {activeTab === 'historial' && !loading && !error && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm">
            <Input icon={Search} type="text" placeholder="Buscar por paciente, motivo o dueño..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-[#F8FAFC] dark:bg-[#0F172A]" />
          </div>

          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
            <div className="overflow-x-auto pb-24 -mb-24">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Paciente</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Motivo de Ingreso</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Ingreso</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Fecha de Alta</th>
                    <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {historialFiltrado.length > 0 ? (
                    historialFiltrado.map((hosp) => (
                      <tr key={hosp.id_hospitalizacion} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#0F172A] dark:text-white">{hosp.paciente?.nombre || 'Desconocido'}</p>
                          <p className="text-xs text-[#64748B]">Dueño: {hosp.paciente?.cliente?.nombre_completo || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4 max-w-[200px] truncate" title={hosp.motivo}>
                          <span className="font-medium text-[#0F172A] dark:text-white">{hosp.motivo}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-[#64748B]">{formatearFechaHora(hosp.fecha_ingreso)}</td>
                        <td className="px-6 py-4 text-xs font-medium text-[#64748B]">{hosp.fecha_alta ? formatearFechaHora(hosp.fecha_alta) : '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold text-[10px] uppercase rounded-full border border-emerald-200 dark:border-emerald-500/20">
                            {hosp.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-[#64748B]">No hay historial de altas registradas.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      <NuevoIngresoModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
      <ModalDarDeAlta isOpen={!!hospAAlta} hospId={hospAAlta} onClose={() => setHospAAlta(null)} />
    </div>
  );
};