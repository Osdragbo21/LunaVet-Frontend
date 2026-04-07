import React, { useState } from 'react';
import { X, Package, Loader2, Clock, CheckCircle, AlertTriangle, XCircle, Store } from 'lucide-react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import { Button } from '../../../components/ui/Button';

const GET_MIS_PEDIDOS_WEB = gql`
  query GetMisPedidosWeb {
    ventas {
      id_venta
      fecha_venta
      total
      estado_pedido
      tipo_venta
      cliente {
        id_cliente
      }
      detalles {
        cantidad
        subtotal
        producto {
          nombre
          imagen_url
        }
      }
    }
  }
`;

const CANCELAR_PEDIDO = gql`
  mutation CancelarPedido($input: UpdateVentaInput!) {
    updateVenta(updateInput: $input) {
      id_venta
      estado_pedido
    }
  }
`;

const GET_MI_CLIENTE_ID = gql`
  query GetMiClienteId {
    clientes {
      id_cliente
      usuario { id_usuario }
    }
  }
`;

// ==========================================
// INTERFACES PARA TYPESCRIPT (QUITA LÍNEAS ROJAS)
// ==========================================
interface Venta {
  id_venta: number;
  fecha_venta: string;
  total: number;
  estado_pedido: string;
  tipo_venta: string;
  cliente: {
    id_cliente: number;
  } | null;
  detalles: {
    cantidad: number;
    subtotal: number;
    producto: {
      nombre: string;
      imagen_url: string;
    } | null;
  }[];
}

interface GetPedidosResponse {
  ventas: Venta[];
}

interface GetMiClienteIdResponse {
  clientes: {
    id_cliente: number;
    usuario: { id_usuario: number } | null;
  }[];
}

export const MisPedidosModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const apolloClient = useApolloClient();

  const [miClienteId, setMiClienteId] = useState<number | null>(null);

  React.useEffect(() => {
    if (isOpen && currentUser) {
      // Inyectamos la interfaz en la petición local
      apolloClient.query<GetMiClienteIdResponse>({ query: GET_MI_CLIENTE_ID, fetchPolicy: 'cache-first' }).then(({ data }) => {
        if (data && data.clientes) {
          const perfil = data.clientes.find(c => c.usuario?.id_usuario === currentUser.id_usuario);
          if (perfil) setMiClienteId(perfil.id_cliente);
        }
      });
    }
  }, [isOpen, currentUser, apolloClient]);

  // Inyectamos la interfaz aquí para que VS Code reconozca "data.ventas"
  const { data, loading, error } = useQuery<GetPedidosResponse>(GET_MIS_PEDIDOS_WEB, {
    skip: !isOpen || !miClienteId,
    fetchPolicy: 'network-only'
  });

  const [cancelarPedido, { loading: cancelando }] = useMutation(CANCELAR_PEDIDO, {
    refetchQueries: ['GetMisPedidosWeb', 'GetHistorialVentas', 'GetInventarioYServicios']
  });

  const handleCancelar = async (id_venta: number) => {
    if(window.confirm('¿Estás seguro de cancelar este pedido?')) {
      try {
        await cancelarPedido({
          variables: {
            input: {
              id_venta: id_venta,
              estado_pedido: 'Cancelado'
            }
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!isOpen) return null;

  const misPedidosFiltrados = data?.ventas?.filter(v => 
    v.cliente?.id_cliente === miClienteId && v.tipo_venta === 'Online'
  ).sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime()) || [];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Package className="text-[#3B82F6]" size={24}/> Historial de Pedidos
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Sigue el estado de tus compras en línea.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-[#F1F5F9] dark:bg-[#0F172A] flex-1">
          {(loading || !miClienteId) && <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
          {error && <div className="text-rose-500 bg-rose-50 p-4 rounded-xl font-bold">Error: {error.message}</div>}
          
          {!loading && miClienteId && !error && (
            misPedidosFiltrados.length > 0 ? (
              <div className="space-y-4">
                {misPedidosFiltrados.map((pedido) => {
                  const fecha = new Date(pedido.fecha_venta).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                  
                  const entregado = pedido.estado_pedido === 'Entregado' || pedido.estado_pedido === 'Completado';
                  const cancelado = pedido.estado_pedido === 'Cancelado';
                  
                  let badgeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
                  let Icon = Clock;
                  
                  if (entregado) { badgeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'; Icon = CheckCircle; }
                  else if (cancelado) { badgeClass = 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'; Icon = XCircle; }
                  else if (pedido.estado_pedido === 'Listo para recoger') { badgeClass = 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'; Icon = Store; }

                  // SOLUCIÓN VISUAL: Transformamos la frase "Pendiente de pago" a "Pendiente (Pago en Clínica)" solo en pantalla
                  const estadoVisual = pedido.estado_pedido === 'Pendiente de pago' ? 'Pendiente (Pago en clínica)' : pedido.estado_pedido;

                  return (
                    <div key={pedido.id_venta} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm relative overflow-hidden group">
                      {cancelado && <div className="absolute inset-0 bg-white/60 dark:bg-[#1E293B]/60 z-10 pointer-events-none"></div>}
                      
                      <div className="flex justify-between items-start mb-4 border-b border-black/5 dark:border-white/5 pb-4 relative z-20">
                        <div>
                          <p className="text-xs font-bold text-[#64748B] tracking-wider uppercase mb-1">Pedido #{pedido.id_venta}</p>
                          <p className="font-bold text-[#0F172A] dark:text-white text-sm">{fecha} hrs</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                            <Icon size={14}/> {estadoVisual}
                          </span>
                          <p className="font-black text-lg text-[#0F172A] dark:text-white">${pedido.total.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-20">
                        {pedido.detalles.map((det, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 border border-black/5 overflow-hidden shrink-0">
                               <img src={det.producto?.imagen_url || ''} alt={det.producto?.nombre} className="w-full h-full object-cover" onError={(e:any)=>{e.target.src="https://placehold.co/100?text=Item"}}/>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-[#0F172A] dark:text-white leading-tight">{det.producto?.nombre || 'Producto'}</p>
                              <p className="text-xs text-[#64748B] font-medium">{det.cantidad} pieza(s)</p>
                            </div>
                            <span className="font-bold text-[#64748B] text-sm">${det.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Botón de Cancelar Pedido */}
                      {(!entregado && !cancelado) && (
                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 relative z-20 flex justify-end">
                           <Button 
                            variant="outline" 
                            onClick={() => handleCancelar(pedido.id_venta)}
                            disabled={cancelando}
                            className="!py-1.5 !px-3 text-xs border-rose-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900/50 dark:hover:bg-rose-500/10"
                           >
                            <XCircle size={14} className="mr-1"/> Cancelar Pedido
                           </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 opacity-60">
                <Package size={48} className="mx-auto mb-4 text-[#64748B]" />
                <p className="text-lg font-bold text-[#0F172A] dark:text-white">Aún no has realizado compras</p>
                <p className="text-sm text-[#64748B]">Tus pedidos en línea aparecerán aquí.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};