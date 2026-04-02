import React, { useState } from 'react';
import { 
  Package, Clock, CheckCircle, ArrowRight, Loader2, 
  AlertTriangle, Receipt, ShoppingBag, MapPin, User, Truck
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. REUTILIZAMOS QUERIES Y MUTACIONES
// ==========================================
const GET_PEDIDOS = gql`
  query GetHistorialVentas {
    ventas {
      id_venta
      fecha_venta
      total
      metodo_pago
      tipo_venta
      estado_pedido
      empleado {
        nombre
      }
      cliente {
        nombre_completo
      }
      detalles {
        cantidad
        precio_unitario
        subtotal
        producto {
          nombre
        }
      }
    }
  }
`;

const UPDATE_ESTADO_PEDIDO = gql`
  mutation UpdateVenta($input: UpdateVentaInput!) {
    updateVenta(updateInput: $input) {
      id_venta
      estado_pedido
    }
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface Venta {
  id_venta: number;
  fecha_venta: string;
  total: number;
  metodo_pago: string;
  tipo_venta: string;
  estado_pedido: string;
  empleado: { nombre: string } | null;
  cliente: { nombre_completo: string } | null;
  detalles: {
    cantidad: number;
    subtotal: number;
    producto: { nombre: string } | null;
  }[];
}

interface GetPedidosResponse {
  ventas: Venta[];
}

// ==========================================
// 3. VISTA PRINCIPAL (TABLERO KANBAN)
// ==========================================
export const PedidosView = () => {
  const { data, loading, error } = useQuery<GetPedidosResponse>(GET_PEDIDOS, {
    pollInterval: 15000 // Hacemos polling cada 15 segs para ver pedidos nuevos automáticamente
  });
  
  const [updatePedido, { loading: updating }] = useMutation(UPDATE_ESTADO_PEDIDO, {
    refetchQueries: ['GetHistorialVentas']
  });

  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const avanzarPedido = async (pedido: Venta, nuevoEstado: string) => {
    setProcesandoId(pedido.id_venta);
    try {
      await updatePedido({
        variables: {
          input: {
            id_venta: pedido.id_venta,
            fecha_venta: pedido.fecha_venta,
            tipo_venta: pedido.tipo_venta,
            estado_pedido: nuevoEstado, // ESTE ES EL ÚNICO CAMBIO REAL
            metodo_pago: pedido.metodo_pago,
            total: pedido.total
          }
        }
      });
    } catch (err) {
      console.error("Error al actualizar el pedido", err);
    } finally {
      setProcesandoId(null);
    }
  };

  // Filtrado y clasificación en columnas (Ignoramos los ya entregados o cancelados)
  const pedidosActivos = data?.ventas?.filter(v => 
    v.estado_pedido !== 'Entregado' && 
    v.estado_pedido !== 'Completado' && 
    v.estado_pedido !== 'Cancelado'
  ).sort((a, b) => new Date(a.fecha_venta).getTime() - new Date(b.fecha_venta).getTime()) || [];

  const colPendientes = pedidosActivos.filter(v => v.estado_pedido === 'Pendiente de pago' || v.estado_pedido === 'Nuevo');
  const colPreparando = pedidosActivos.filter(v => v.estado_pedido === 'Preparando');
  const colListos = pedidosActivos.filter(v => v.estado_pedido === 'Listo para recoger');

  // Componente de Tarjeta de Pedido
  const PedidoCard = ({ pedido, nextState, actionText, actionIcon: ActionIcon, colorClass }: any) => {
    const isProcesando = procesandoId === pedido.id_venta;
    const date = new Date(pedido.fecha_venta);
    const timeString = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <div className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-all group flex flex-col cursor-default">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md">
              #{pedido.id_venta}
            </span>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mt-2">{timeString} hrs</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">${pedido.total.toFixed(2)}</span>
            <p className="text-[10px] text-[#64748B]">{pedido.tipo_venta}</p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-2.5 rounded-xl border border-black/5 dark:border-white/5 mb-3">
          <p className="text-xs font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5 mb-1.5 truncate">
            <User size={12} className="text-[#3B82F6] shrink-0"/> {pedido.cliente?.nombre_completo || 'Cliente General'}
          </p>
          <div className="space-y-1">
            {pedido.detalles.slice(0, 2).map((det: any, idx: number) => (
              <p key={idx} className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                <span className="font-bold text-[#0F172A] dark:text-white">{det.cantidad}x</span> {det.producto?.nombre || 'Producto'}
              </p>
            ))}
            {pedido.detalles.length > 2 && (
              <p className="text-[10px] text-[#3B82F6] font-bold italic">+ {pedido.detalles.length - 2} artículos más</p>
            )}
          </div>
        </div>

        <Button 
          variant="outline" 
          disabled={updating || isProcesando}
          onClick={() => avanzarPedido(pedido, nextState)}
          className={`w-full !py-2 text-xs font-bold mt-auto border-dashed border-2 hover:border-solid flex items-center justify-center gap-2 transition-all ${colorClass}`}
        >
          {isProcesando ? <Loader2 size={14} className="animate-spin" /> : (
            <><ActionIcon size={14} /> {actionText}</>
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 h-[calc(100vh-120px)] relative overflow-hidden">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Package className="text-[#3B82F6]" size={28}/> 
            Tablero de Pedidos
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Gestiona el flujo de entrega de las compras de la tienda en línea y mostrador.</p>
        </div>
      </div>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center py-12 text-[#3B82F6] flex-1">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-medium text-[#64748B] dark:text-[#94A3B8]">Cargando pedidos activos...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold shrink-0">
          Error al cargar los pedidos: {error.message}
        </div>
      )}

      {/* Tablero Kanban */}
      {!loading && !error && (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 custom-scrollbar items-start">
          
          {/* COLUMNA 1: PENDIENTES */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-[#F1F5F9] dark:bg-[#1E293B]/50 rounded-[24px] border border-black/5 dark:border-white/5 p-4 h-full">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
              <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <Clock size={18} className="text-amber-500"/> Pendientes
              </h3>
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">{colPendientes.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {colPendientes.map(pedido => (
                <PedidoCard 
                  key={pedido.id_venta} 
                  pedido={pedido} 
                  nextState="Preparando" 
                  actionText="Iniciar Preparación" 
                  actionIcon={ArrowRight}
                  colorClass="text-amber-600 border-amber-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 dark:border-amber-500/30"
                />
              ))}
              {colPendientes.length === 0 && <div className="text-center p-6 text-sm text-[#64748B] border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl">No hay pedidos pendientes.</div>}
            </div>
          </div>

          {/* COLUMNA 2: PREPARANDO */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-[#F1F5F9] dark:bg-[#1E293B]/50 rounded-[24px] border border-black/5 dark:border-white/5 p-4 h-full">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
              <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <ShoppingBag size={18} className="text-blue-500"/> En Preparación
              </h3>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{colPreparando.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {colPreparando.map(pedido => (
                <PedidoCard 
                  key={pedido.id_venta} 
                  pedido={pedido} 
                  nextState="Listo para recoger" 
                  actionText="Marcar como Listo" 
                  actionIcon={CheckCircle}
                  colorClass="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:border-blue-500/30"
                />
              ))}
              {colPreparando.length === 0 && <div className="text-center p-6 text-sm text-[#64748B] border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl">Ningún pedido en preparación.</div>}
            </div>
          </div>

          {/* COLUMNA 3: LISTOS PARA RECOGER */}
          <div className="flex-1 min-w-[300px] flex flex-col bg-[#F1F5F9] dark:bg-[#1E293B]/50 rounded-[24px] border border-black/5 dark:border-white/5 p-4 h-full">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
              <h3 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                <MapPin size={18} className="text-emerald-500"/> Listos p/ Recoger
              </h3>
              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">{colListos.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
              {colListos.map(pedido => (
                <PedidoCard 
                  key={pedido.id_venta} 
                  pedido={pedido} 
                  nextState="Entregado" 
                  actionText="Entregar al Cliente" 
                  actionIcon={Truck}
                  colorClass="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:border-emerald-500/30"
                />
              ))}
              {colListos.length === 0 && <div className="text-center p-6 text-sm text-[#64748B] border-2 border-dashed border-black/5 dark:border-white/5 rounded-xl">Ningún pedido en espera.</div>}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};