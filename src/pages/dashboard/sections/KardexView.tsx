import React, { useState } from 'react';
import { 
  Search, Filter, ClipboardList, ArrowDownToLine, ArrowUpFromLine, 
  Package, User, Calendar as CalendarIcon, Loader2, AlertTriangle, 
  ArrowRightLeft
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const GET_MOVIMIENTOS_INVENTARIO = gql`
  query GetMovimientosInventario {
    movimientosInventario {
      id_movimiento
      tipo_movimiento
      cantidad
      motivo
      fecha
      producto {
        nombre
      }
      empleado {
        nombre
        usuario {
          username
        }
      }
    }
  }
`;

interface Movimiento {
  id_movimiento: number;
  tipo_movimiento: string;
  cantidad: number;
  motivo: string;
  fecha: string;
  producto: {
    nombre: string;
  };
  empleado: {
    nombre: string;
    usuario: {
      username: string;
    };
  };
}

export const KardexView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);

  const { data, loading, error } = useQuery<{ movimientosInventario: Movimiento[] }>(GET_MOVIMIENTOS_INVENTARIO);

  const getTipoEstilo = (tipo: string) => {
    if (tipo.toLowerCase().includes('entrada')) {
      return { icon: ArrowDownToLine, bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' };
    }
    if (tipo.toLowerCase().includes('salida')) {
      return { icon: ArrowUpFromLine, bg: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/20' };
    }
    return { icon: ArrowRightLeft, bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
  };

  const movimientosFiltrados = data?.movimientosInventario?.filter(mov => {
    const busqueda = searchTerm.toLowerCase();
    const matchSearch = 
      mov.producto.nombre.toLowerCase().includes(busqueda) ||
      mov.motivo.toLowerCase().includes(busqueda) ||
      mov.empleado.usuario.username.toLowerCase().includes(busqueda);
      
    const matchFiltro = filtroTipo === 'Todos' || mov.tipo_movimiento === filtroTipo;

    return matchSearch && matchFiltro;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <ClipboardList className="text-[#3B82F6]" size={28}/> 
            Kardex de Inventario
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Historial detallado de entradas y salidas de productos.</p>
        </div>
      </div>

      {/* Controles de Búsqueda */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            icon={Search} type="text" placeholder="Buscar por producto, motivo o usuario..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" 
          />
        </div>
        
        <div className="relative">
          <Button variant="outline" className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8] w-full sm:w-auto" onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}>
            <Filter size={18} /> Filtrar Movimiento
            {filtroTipo !== 'Todos' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6]"></span>}
          </Button>
          
          {menuFiltrosAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuFiltrosAbierto(false)}></div>
              <div className="absolute right-0 top-14 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setFiltroTipo('Todos'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">Todos</button>
                <div className="h-px bg-black/5 dark:bg-white/5 my-1"></div>
                <button onClick={() => { setFiltroTipo('Entrada'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10">Entradas</button>
                <button onClick={() => { setFiltroTipo('Salida'); setMenuFiltrosAbierto(false); }} className="w-full text-left px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Salidas</button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
      
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold flex items-center gap-2">
          <AlertTriangle size={20} /> Error al cargar el Kardex: {error.message}
        </div>
      )}

      {/* Tabla de Kardex */}
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto pb-4 -mb-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Fecha / Hora</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Producto</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Movimiento</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Motivo (Detalle)</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {movimientosFiltrados.length > 0 ? (
                  movimientosFiltrados.map((mov) => {
                    const fecha = new Date(mov.fecha);
                    const est = getTipoEstilo(mov.tipo_movimiento);
                    const TipoIcon = est.icon;
                    return (
                      <tr key={mov.id_movimiento} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                              <CalendarIcon size={14} className="text-[#64748B]"/>
                              {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                              {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hrs
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 font-bold text-[#0F172A] dark:text-white">
                            <Package size={16} className="text-[#3B82F6]" />
                            {mov.producto.nombre}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-full border ${est.bg}`}>
                            <TipoIcon size={14} /> {mov.tipo_movimiento}: {mov.cantidad}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] max-w-[250px] truncate" title={mov.motivo}>
                            {mov.motivo}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                              <User size={14} className="text-[#64748B]"/> @{mov.empleado.usuario.username}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-[#64748B] dark:text-[#94A3B8]">{mov.empleado.nombre}</span>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No se encontraron movimientos registrados.
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