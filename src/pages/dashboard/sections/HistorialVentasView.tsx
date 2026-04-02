import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, History, Receipt, Calendar, User, 
  CreditCard, Banknote, Smartphone, Loader2, AlertTriangle, 
  X, ShoppingCart, CheckCircle, Package, MoreVertical, Edit2, Trash2, DollarSign
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. QUERIES Y MUTACIONES 
// ==========================================
const GET_HISTORIAL_VENTAS = gql`
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

const UPDATE_VENTA = gql`
  mutation UpdateVenta($input: UpdateVentaInput!) {
    updateVenta(updateInput: $input) {
      id_venta
      fecha_venta
      tipo_venta
      estado_pedido
      metodo_pago
      total
      cliente {
        nombre_completo
      }
    }
  }
`;

const DELETE_VENTA = gql`
  mutation DeleteVenta($id: Int!) {
    removeVenta(id: $id)
  }
`;

// ==========================================
// 2. INTERFACES TYPESCRIPT
// ==========================================
interface DetalleVenta {
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  producto: {
    nombre: string;
  } | null; // Lo hacemos opcional por si el producto fue borrado
}

interface Venta {
  id_venta: number;
  fecha_venta: string;
  total: number;
  metodo_pago: string;
  tipo_venta: string;
  estado_pedido: string;
  empleado: {
    nombre: string;
  } | null; // Lo hacemos opcional por seguridad
  cliente: {
    nombre_completo: string;
  } | null; // Lo hacemos opcional por seguridad
  detalles: DetalleVenta[];
}

interface GetHistorialVentasResponse {
  ventas: Venta[];
}

// ==========================================
// 3. MODALES AUXILIARES
// ==========================================

// --- VISOR DE TICKET ---
const ModalTicket = ({ isOpen, venta, onClose }: { isOpen: boolean, venta: Venta | null, onClose: () => void }) => {
  if (!isOpen || !venta) return null;

  const fechaObj = new Date(venta.fecha_venta);
  const fechaStr = fechaObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const horaStr = fechaObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10">
        
        {/* Header del Modal */}
        <div className="px-6 py-4 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Receipt size={20} className="text-[#3B82F6]" /> Detalle de Venta
          </h2>
          <button onClick={onClose} className="p-1.5 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Contenido del Ticket */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          
          {/* Info General */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <ShoppingCart size={28} />
            </div>
            <h3 className="text-2xl font-black text-[#0F172A] dark:text-white">Ticket #{venta.id_venta}</h3>
            <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] capitalize">{fechaStr} - {horaStr}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
              <p className="text-[10px] uppercase font-bold text-[#64748B] mb-1 flex items-center gap-1"><User size={12}/> Cliente</p>
              <p className="font-semibold text-[#0F172A] dark:text-white line-clamp-1" title={venta.cliente?.nombre_completo || 'Público General'}>
                {venta.cliente?.nombre_completo || 'Público General'}
              </p>
            </div>
            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5 dark:border-white/5">
              <p className="text-[10px] uppercase font-bold text-[#64748B] mb-1 flex items-center gap-1"><User size={12}/> Cajero</p>
              <p className="font-semibold text-[#0F172A] dark:text-white line-clamp-1" title={venta.empleado?.nombre || 'Desconocido'}>
                {venta.empleado?.nombre || 'Desconocido'}
              </p>
            </div>
          </div>

          {/* Resumen estilo Ticket de Compra */}
          <div className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl p-5 text-left border border-black/5 dark:border-white/5 relative">
            <div className="absolute -top-1 left-0 w-full overflow-hidden flex justify-between px-2 opacity-20">
              {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-2 h-2 bg-white dark:bg-[#1E293B] rounded-full"></div>)}
            </div>

            <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-3 text-center border-b border-dashed border-black/10 dark:border-white/10 pb-2">
              Artículos Vendidos
            </p>
            
            <div className="space-y-3">
              {venta.detalles.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex-1 pr-3">
                    <span className="text-[#0F172A] dark:text-white font-bold">{item.cantidad}x </span>
                    <span className="text-[#0F172A] dark:text-white font-medium leading-tight">{item.producto?.nombre || 'Producto Desconocido'}</span>
                    <p className="text-[10px] text-[#64748B] mt-0.5">${item.precio_unitario.toFixed(2)} c/u</p>
                  </div>
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold whitespace-nowrap">${item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-black/10 dark:border-white/10 mt-4 pt-3 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#0F172A] dark:text-white">Total Pagado</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">${venta.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs bg-white dark:bg-[#1E293B] px-3 py-2 rounded-lg border border-black/5 dark:border-white/5">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Método de pago:</span>
                <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1">
                  {venta.metodo_pago === 'Efectivo' && <Banknote size={14} className="text-emerald-500"/>}
                  {venta.metodo_pago === 'Tarjeta' && <CreditCard size={14} className="text-blue-500"/>}
                  {venta.metodo_pago === 'Transferencia' && <Smartphone size={14} className="text-purple-500"/>}
                  {venta.metodo_pago}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs bg-white dark:bg-[#1E293B] px-3 py-2 rounded-lg border border-black/5 dark:border-white/5">
                <span className="text-[#64748B] dark:text-[#94A3B8]">Tipo de Venta:</span>
                <span className="font-bold text-[#0F172A] dark:text-white">{venta.tipo_venta}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- MODAL ELIMINAR VENTA ---
const ModalEliminarVenta = ({ isOpen, venta, onClose }: { isOpen: boolean, venta: Venta | null, onClose: () => void }) => {
  const [deleteVenta, { loading, error }] = useMutation(DELETE_VENTA, {
    refetchQueries: ['GetHistorialVentas']
  });

  const handleDelete = async () => {
    if (!venta) return;
    try {
      await deleteVenta({ variables: { id: venta.id_venta } });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !venta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar Venta #{venta.id_venta}?</h2>
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-6 font-medium">
          Esta acción borrará permanentemente la transacción y sus detalles. Los productos <strong className="text-rose-500">no se devolverán automáticamente al inventario</strong>.
        </p>
        
        {error && <p className="text-rose-500 text-sm mb-4">Error: {error.message}</p>}

        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">Cancelar</Button>
          <Button onClick={handleDelete} disabled={loading} className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sí, Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- MODAL EDITAR VENTA (AMPLIADO) ---
const ModalEditarVenta = ({ isOpen, venta, onClose }: { isOpen: boolean, venta: Venta | null, onClose: () => void }) => {
  const [formData, setFormData] = useState({ 
    fecha_venta: '',
    tipo_venta: '',
    estado_pedido: '', 
    metodo_pago: '',
    total: ''
  });

  // Función auxiliar para parsear fechas de la BD a input datetime-local
  const getLocalISOTime = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return '';
    const tzoffset = dateObj.getTimezoneOffset() * 60000; 
    return new Date(dateObj.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (venta) {
      setFormData({
        fecha_venta: getLocalISOTime(venta.fecha_venta),
        tipo_venta: venta.tipo_venta || 'Fisica',
        estado_pedido: venta.estado_pedido || 'Completado',
        metodo_pago: venta.metodo_pago || 'Efectivo',
        total: venta.total ? venta.total.toString() : '0'
      });
    }
  }, [venta]);

  const [updateVenta, { loading, error }] = useMutation(UPDATE_VENTA, {
    refetchQueries: ['GetHistorialVentas']
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venta) return;
    try {
      await updateVenta({
        variables: {
          input: {
            id_venta: venta.id_venta,
            fecha_venta: new Date(formData.fecha_venta).toISOString(),
            tipo_venta: formData.tipo_venta,
            estado_pedido: formData.estado_pedido,
            metodo_pago: formData.metodo_pago,
            total: parseFloat(formData.total)
          }
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !venta) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Edit2 size={24} className="text-[#3B82F6]" /> Editar Venta / Ticket</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Corrección administrativa para Ticket #{venta.id_venta}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="editVentaForm" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">{error.message}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Calendar size={14}/> Fecha y Hora</Label>
                <input 
                  type="datetime-local" 
                  name="fecha_venta" 
                  value={formData.fecha_venta} 
                  onChange={handleChange}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  required 
                  className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all cursor-pointer dark:[color-scheme:dark]" 
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Venta (Canal)</Label>
                <select name="tipo_venta" value={formData.tipo_venta} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="Fisica">Física (Mostrador)</option>
                  <option value="Online">Online (Tienda Web)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Estado del Pedido / Venta</Label>
                <select name="estado_pedido" value={formData.estado_pedido} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="Completado">Completado</option>
                  <option value="Pendiente de pago">Pendiente de pago</option>
                  <option value="Preparando">Preparando</option>
                  <option value="Listo para recoger">Listo para recoger</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Método de Pago</Label>
                <select name="metodo_pago" value={formData.metodo_pago} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="flex items-center gap-1.5"><DollarSign size={14}/> Total de la Venta ($)</Label>
                <Input name="total" type="number" step="0.01" value={formData.total} onChange={handleChange} required />
              </div>

            </div>
            
            <div className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-3 rounded-xl flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                <strong>Nota Fiscal:</strong> Los artículos y productos específicos de este ticket no se pueden modificar directamente en esta pantalla por integridad de la base de datos. Si requieres cambiar la mercancía vendida, debes eliminar la venta completa y registrarla nuevamente en la caja.
              </p>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={loading} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="editVentaForm" variant="primary" disabled={loading} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin"/> : 'Guardar Todos los Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. VISTA PRINCIPAL
// ==========================================
export const HistorialVentasView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMetodo, setFiltroMetodo] = useState('Todos');
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  
  // Modales
  const [ticketViendo, setTicketViendo] = useState<Venta | null>(null);
  const [ventaAEditar, setVentaAEditar] = useState<Venta | null>(null);
  const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null);

  const { data, loading, error } = useQuery<GetHistorialVentasResponse>(GET_HISTORIAL_VENTAS);

  const getMetodoIcon = (metodo: string) => {
    switch(metodo.toLowerCase()) {
      case 'efectivo': return <Banknote size={16} className="text-emerald-500" />;
      case 'tarjeta': return <CreditCard size={16} className="text-blue-500" />;
      case 'transferencia': return <Smartphone size={16} className="text-purple-500" />;
      default: return <Receipt size={16} className="text-gray-500" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch(estado.toLowerCase()) {
      case 'completado':
      case 'entregado': 
        return <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><CheckCircle size={12}/> {estado}</span>;
      case 'pendiente de pago': 
      case 'preparando':
        return <span className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><AlertTriangle size={12}/> {estado}</span>;
      case 'cancelado':
        return <span className="bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><X size={12}/> Cancelado</span>;
      default: 
        return <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Package size={12}/> {estado}</span>;
    }
  };

  // Filtrado Seguro con protección de Nulls
  const ventasFiltradas = data?.ventas?.filter(v => {
    const busqueda = searchTerm.toLowerCase();
    const nombreCliente = v.cliente?.nombre_completo || 'Público General';
    const nombreEmpleado = v.empleado?.nombre || 'Desconocido';
    
    const coincideBusqueda = 
      v.id_venta.toString().includes(busqueda) ||
      nombreCliente.toLowerCase().includes(busqueda) ||
      nombreEmpleado.toLowerCase().includes(busqueda);
    
    const coincideFiltro = filtroMetodo === 'Todos' || v.metodo_pago === filtroMetodo;

    return coincideBusqueda && coincideFiltro;
  }).sort((a, b) => new Date(b.fecha_venta).getTime() - new Date(a.fecha_venta).getTime()) || []; // Ordenar más recientes primero

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <History className="text-[#3B82F6]" size={28}/> 
            Historial de Ventas
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Registro completo de transacciones y tickets emitidos.</p>
        </div>
      </div>

      {/* Buscador y Pestañas */}
      <div className="flex flex-col gap-4">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex">
          <Input 
            icon={Search} 
            type="text" 
            placeholder="Buscar por ID de Ticket, Cliente o Cajero..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" 
          />
        </div>

        <div className="flex space-x-2 border-b border-black/5 dark:border-white/5 overflow-x-auto pb-2 custom-scrollbar">
          {['Todos', 'Efectivo', 'Tarjeta', 'Transferencia'].map(metodo => (
            <button 
              key={metodo}
              onClick={() => setFiltroMetodo(metodo)}
              className={`px-4 py-2 text-sm font-bold rounded-t-lg transition-colors whitespace-nowrap ${filtroMetodo === metodo ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'}`}
            >
              {metodo === 'Todos' ? 'Todos los Métodos' : metodo}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-[#3B82F6]">
          <Loader2 size={40} className="animate-spin mb-4" />
          <p className="font-medium text-[#64748B] dark:text-[#94A3B8]">Cargando transacciones...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-4 rounded-xl font-bold">
          Error al cargar el historial: {error.message}
        </div>
      )}

      {/* Tabla de Ventas */}
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
          <div className="overflow-x-auto pb-24 -mb-24">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">ID Ticket</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Fecha y Hora</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Cliente / Cajero</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Pago y Estado</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Total</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map((venta) => {
                    const fecha = new Date(venta.fecha_venta);
                    return (
                      <tr key={venta.id_venta} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        
                        <td className="px-6 py-4">
                          <span className="font-black text-[#0F172A] dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                            #{venta.id_venta}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5">
                              <Calendar size={14} className="text-[#64748B]"/>
                              {fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                              {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} hrs
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5" title="Cliente">
                              <User size={14} className="text-[#3B82F6]"/>
                              {venta.cliente?.nombre_completo 
                                ? (venta.cliente.nombre_completo.length > 20 ? venta.cliente.nombre_completo.substring(0,20)+'...' : venta.cliente.nombre_completo) 
                                : 'Público General'}
                            </span>
                            <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5" title="Cajero que procesó">
                              <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase">
                                {venta.empleado?.nombre?.charAt(0) || '-'}
                              </div>
                              {venta.empleado?.nombre || 'Desconocido'}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="flex items-center gap-1.5 text-[#0F172A] dark:text-white font-medium text-sm">
                              {getMetodoIcon(venta.metodo_pago)} {venta.metodo_pago}
                            </span>
                            {getEstadoBadge(venta.estado_pedido)}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            ${venta.total.toFixed(2)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right relative">
                          <button 
                            onClick={() => setMenuAbierto(menuAbierto === venta.id_venta ? null : venta.id_venta)}
                            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* MENÚ DESPLEGABLE */}
                          {menuAbierto === venta.id_venta && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                              <div className="absolute right-8 top-10 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                                
                                <button 
                                  onClick={() => { setTicketViendo(venta); setMenuAbierto(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                  <Receipt size={16} /> Ver Ticket
                                </button>

                                <button 
                                  onClick={() => { setVentaAEditar(venta); setMenuAbierto(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                  <Edit2 size={16} /> Editar Venta Completa
                                </button>

                                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                                <button 
                                  onClick={() => { setVentaAEliminar(venta); setMenuAbierto(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                                >
                                  <Trash2 size={16} /> Eliminar Venta
                                </button>
                                
                              </div>
                            </>
                          )}
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No se encontraron ventas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renderizado de Modales */}
      <ModalTicket isOpen={!!ticketViendo} venta={ticketViendo} onClose={() => setTicketViendo(null)} />
      <ModalEditarVenta isOpen={!!ventaAEditar} venta={ventaAEditar} onClose={() => setVentaAEditar(null)} />
      <ModalEliminarVenta isOpen={!!ventaAEliminar} venta={ventaAEliminar} onClose={() => setVentaAEliminar(null)} />

    </div>
  );
};