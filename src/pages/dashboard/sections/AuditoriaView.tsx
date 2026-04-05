import React, { useState } from 'react';
import { 
  Search, Filter, ShieldAlert, Activity, Database, Loader2, 
  AlertTriangle, Calendar as CalendarIcon, User, Edit2, 
  Trash2, PlusCircle
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const GET_AUDITORIA_LOG = gql`
  query GetAuditoriaLog {
    auditoriasLog {
      id_log
      accion
      tabla_afectada
      detalle
      fecha
      usuario {
        username
      }
    }
  }
`;

interface AuditoriaLog {
  id_log: number;
  accion: string;
  tabla_afectada: string;
  detalle: string;
  fecha: string;
  usuario: {
    username: string;
  } | null;
}

export const AuditoriaView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroAccion, setFiltroAccion] = useState('Todas');
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);

  const { data, loading, error } = useQuery<{ auditoriasLog: AuditoriaLog[] }>(GET_AUDITORIA_LOG);

  const getActionBadge = (accion: string) => {
    switch (accion.toUpperCase()) {
      case 'INSERT': return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><PlusCircle size={12}/> Creación</span>;
      case 'UPDATE': return <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Edit2 size={12}/> Modificación</span>;
      case 'DELETE': return <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Trash2 size={12}/> Eliminación</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1"><Activity size={12}/> {accion}</span>;
    }
  };

  const logsFiltrados = data?.auditoriasLog?.filter(log => {
    const busqueda = searchTerm.toLowerCase();
    const user = log.usuario?.username?.toLowerCase() || '';
    
    const matchSearch = 
      user.includes(busqueda) ||
      log.tabla_afectada.toLowerCase().includes(busqueda) ||
      log.detalle.toLowerCase().includes(busqueda);
      
    const matchFiltro = filtroAccion === 'Todas' || log.accion.toUpperCase() === filtroAccion;

    return matchSearch && matchFiltro;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={28}/> 
            Auditoría y Seguridad
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Rastro inmutable de acciones críticas del sistema.</p>
        </div>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            icon={Search} type="text" placeholder="Buscar por usuario, tabla o detalle..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" 
          />
        </div>
        
        <div className="relative">
          <Button variant="outline" className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8] w-full sm:w-auto" onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}>
            <Filter size={18} /> Filtrar Acción
            {filtroAccion !== 'Todas' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>}
          </Button>
          
          {menuFiltrosAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuFiltrosAbierto(false)}></div>
              <div className="absolute right-0 top-14 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setFiltroAccion('Todas'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">Todas las acciones</button>
                <div className="h-px bg-black/5 dark:bg-white/5 my-1"></div>
                <button onClick={() => { setFiltroAccion('INSERT'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">Solo Creaciones</button>
                <button onClick={() => { setFiltroAccion('UPDATE'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10">Solo Modificaciones</button>
                <button onClick={() => { setFiltroAccion('DELETE'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Solo Eliminaciones</button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-rose-500" size={40} /></div>}
      
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold flex items-center gap-2">
          <AlertTriangle size={20} /> Error al cargar Logs: {error.message}
        </div>
      )}

      {/* Tabla de Logs */}
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto pb-4 -mb-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] w-48">Momento Exacto</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] w-40">Usuario</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] w-48">Tipo y Módulo</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Detalle del Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {logsFiltrados.length > 0 ? (
                  logsFiltrados.map((log) => {
                    const fecha = new Date(log.fecha);
                    return (
                      <tr key={log.id_log} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                              <CalendarIcon size={14} className="text-[#64748B]"/>
                              {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                              {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} hrs
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                            <User size={14} className="text-[#3B82F6]"/> @{log.usuario?.username || 'Sistema'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            {getActionBadge(log.accion)}
                            <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                              <Database size={12}/> Tabla: {log.tabla_afectada}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#0F172A] dark:text-white whitespace-pre-wrap font-mono bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-lg border border-black/5 dark:border-white/5 text-[11px] leading-relaxed max-w-xl">
                            {log.detalle}
                          </p>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No hay registros en la auditoría con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};