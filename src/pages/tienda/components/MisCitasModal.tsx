import React, { useState } from 'react';
import { X, CalendarClock, Loader2, Clock, CheckCircle, Ban, XCircle, Stethoscope, PawPrint, User } from 'lucide-react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import { Button } from '../../../components/ui/Button';

// Consultas
const GET_MI_CLIENTE_ID = gql`
  query GetMiClienteId {
    clientes {
      id_cliente
      usuario { id_usuario }
    }
  }
`;

const GET_MIS_CITAS = gql`
  query GetMisCitasWeb {
    citas {
      id_cita
      fecha_hora
      motivo
      estado
      paciente {
        nombre
        especie
        cliente {
          id_cliente
        }
      }
      empleado {
        nombre
      }
    }
  }
`;

const CANCELAR_CITA = gql`
  mutation CancelarCitaWeb($id: Int!, $nuevoEstado: String!) {
    updateEstadoCita(id: $id, nuevoEstado: $nuevoEstado) {
      id_cita
      estado
    }
  }
`;

// Interfaces
interface Cita {
  id_cita: number;
  fecha_hora: string;
  motivo: string;
  estado: string;
  paciente: {
    nombre: string;
    especie: string;
    cliente: {
      id_cliente: number;
    };
  };
  empleado: {
    nombre: string;
  };
}

interface GetCitasResponse {
  citas: Cita[];
}

interface GetMiClienteIdResponse {
  clientes: {
    id_cliente: number;
    usuario: { id_usuario: number } | null;
  }[];
}

export const MisCitasModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const apolloClient = useApolloClient();

  const [miClienteId, setMiClienteId] = useState<number | null>(null);

  // Obtener ID Cliente
  React.useEffect(() => {
    if (isOpen && currentUser) {
      apolloClient.query<GetMiClienteIdResponse>({ query: GET_MI_CLIENTE_ID, fetchPolicy: 'cache-first' }).then(({ data }) => {
        if (data && data.clientes) {
          const perfil = data.clientes.find(c => c.usuario?.id_usuario === currentUser.id_usuario);
          if (perfil) setMiClienteId(perfil.id_cliente);
        }
      });
    }
  }, [isOpen, currentUser, apolloClient]);

  // Cargar Citas
  const { data, loading, error } = useQuery<GetCitasResponse>(GET_MIS_CITAS, {
    skip: !isOpen || !miClienteId,
    fetchPolicy: 'network-only'
  });

  const [cancelarCita, { loading: cancelando }] = useMutation(CANCELAR_CITA, {
    refetchQueries: ['GetMisCitasWeb', 'GetCitasAgenda']
  });

  const handleCancelar = async (id_cita: number) => {
    if(window.confirm('¿Estás seguro de cancelar esta cita? El horario quedará liberado.')) {
      try {
        await cancelarCita({
          variables: {
            id: id_cita,
            nuevoEstado: 'Cancelada'
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!isOpen) return null;

  // Filtrar citas del cliente actual y ordenar por fecha descendente
  const misCitasFiltradas = data?.citas?.filter(c => 
    c.paciente.cliente.id_cliente === miClienteId
  ).sort((a, b) => new Date(b.fecha_hora).getTime() - new Date(a.fecha_hora).getTime()) || [];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <CalendarClock className="text-[#3B82F6]" size={24}/> Historial de Citas
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Revisa el estado de tus reservas médicas y estéticas.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#F1F5F9] dark:bg-[#0F172A] flex-1">
          {(loading || !miClienteId) && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
          {error && <div className="text-rose-500 bg-rose-50 p-4 rounded-xl font-bold">Error: {error.message}</div>}
          
          {!loading && miClienteId && !error && (
            misCitasFiltradas.length > 0 ? (
              <div className="space-y-4">
                {misCitasFiltradas.map((cita) => {
                  const fecha = new Date(cita.fecha_hora);
                  const fechaStr = fecha.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                  const horaStr = fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
                  
                  const completada = cita.estado === 'Completada';
                  const cancelada = cita.estado === 'Cancelada';
                  const pendiente = cita.estado === 'Pendiente';
                  
                  let badgeClass = 'bg-gray-100 text-gray-700';
                  let Icon = Clock;
                  
                  if (pendiente) { badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'; Icon = Clock; }
                  else if (completada) { badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'; Icon = CheckCircle; }
                  else if (cancelada) { badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'; Icon = Ban; }

                  return (
                    <div key={cita.id_cita} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
                      {cancelada && <div className="absolute inset-0 bg-white/60 dark:bg-[#1E293B]/60 z-10 pointer-events-none"></div>}
                      
                      <div className="flex justify-between items-start mb-4 border-b border-black/5 dark:border-white/5 pb-4 relative z-20">
                        <div>
                          <p className="text-xs font-bold text-[#64748B] tracking-wider uppercase mb-1">Cita #{cita.id_cita}</p>
                          <p className="font-bold text-[#0F172A] dark:text-white capitalize">{fechaStr}</p>
                          <p className="font-black text-xl text-[#3B82F6]">{horaStr} hrs</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                            <Icon size={14}/> {cita.estado}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                            <PawPrint size={20} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-[#0F172A] dark:text-white">{cita.paciente.nombre}</p>
                            <p className="text-xs text-[#64748B] font-medium">{cita.paciente.especie}</p>
                          </div>
                        </div>

                        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5 mt-2">
                          <p className="text-[11px] font-bold text-[#64748B] uppercase mb-1">Motivo de la Reserva</p>
                          <p className="text-sm font-medium text-[#0F172A] dark:text-white">{cita.motivo}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium text-[#64748B] mt-2">
                          <Stethoscope size={14} className="text-[#3B82F6]" /> Médico Asignado: Dr. {cita.empleado.nombre}
                        </div>
                      </div>

                      {/* Botón de Cancelar Cita (Solo si está pendiente) */}
                      {pendiente && (
                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 relative z-20 flex justify-end">
                           <Button 
                            variant="outline" 
                            onClick={() => handleCancelar(cita.id_cita)}
                            disabled={cancelando}
                            className="!py-1.5 !px-3 text-xs border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-500/10"
                           >
                            <XCircle size={14} className="mr-1"/> Cancelar Cita
                           </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 opacity-60">
                <CalendarClock size={48} className="mx-auto mb-4 text-[#64748B]" />
                <p className="text-lg font-bold text-[#0F172A] dark:text-white">Aún no tienes citas</p>
                <p className="text-sm text-[#64748B]">Tus reservas aparecerán aquí.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};