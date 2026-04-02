import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, 
  Banknote, Receipt, AlertTriangle, Loader2, CheckCircle, User 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_PRODUCTOS_POS = gql`
  query GetProductosPOS {
    productos {
      id_producto
      nombre
      precio_venta
      stock_actual
      imagen_url
    }
  }
`;

const GET_CLIENTES_Y_EMPLEADOS = gql`
  query GetClientesYEmpleados {
    clientes {
      id_cliente
      nombre_completo
    }
    empleados {
      id_empleado
      usuario {
        id_usuario
      }
    }
  }
`;

const CREATE_VENTA_POS = gql`
  mutation CreateVentaPOS($input: CreateVentaInput!) {
    createVenta(createInput: $input) {
      id_venta
      total
      estado_pedido
      detalles {
        producto {
          nombre
        }
        cantidad
        subtotal
      }
    }
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface ProductoPOS {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  imagen_url: string;
}

interface ItemCarrito extends ProductoPOS {
  cantidad: number;
}

interface ClienteDropdown {
  id_cliente: number;
  nombre_completo: string;
}

interface GetClientesDropdownResponse {
  clientes: ClienteDropdown[];
  empleados: {
    id_empleado: number;
    usuario: {
      id_usuario: number;
    } | null;
  }[];
}

interface CreateVentaResponse {
  createVenta: {
    id_venta: number;
    total: number;
    estado_pedido: string;
    detalles: {
      producto: {
        nombre: string;
      };
      cantidad: number;
      subtotal: number;
    }[];
  };
}

// Nueva interfaz para guardar los datos del ticket en pantalla
interface TicketData {
  id: number;
  total: number;
  pago: string;
  detalles: {
    producto: { nombre: string };
    cantidad: number;
    subtotal: number;
  }[];
}

// ==========================================
// 3. VISTA PRINCIPAL (CAJA REGISTRADORA)
// ==========================================
export const NuevaVentaView = () => {
  // --- ESTADOS ---
  const [searchTerm, setSearchTerm] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  
  // Estados para el buscador de Clientes
  const [clienteId, setClienteId] = useState('1'); 
  const [clienteSearch, setClienteSearch] = useState('Público en General');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  
  // Estado para el Modal de Ticket
  const [ticketData, setTicketData] = useState<TicketData | null>(null);

  // --- PETICIONES ---
  const { data: dataProductos, loading: loadingProd } = useQuery<{productos: ProductoPOS[]}>(GET_PRODUCTOS_POS);
  const { data: dataExtras } = useQuery<GetClientesDropdownResponse>(GET_CLIENTES_Y_EMPLEADOS);
  
  const [createVenta, { loading: procesandoPago, error: errorPago }] = useMutation<CreateVentaResponse>(CREATE_VENTA_POS, {
    refetchQueries: ['GetProductosPOS', 'GetHistorialVentas', 'GetProductos']
  });

  // --- EFECTO: CERRAR DROPDOWN CLIENTES AL HACER CLIC AFUERA ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientSearch(false);
        // Si hicieron clic afuera y borraron el texto, forzamos de vuelta al Público en General
        if (clienteId === '') {
          setClienteId('1');
          setClienteSearch('Público en General');
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clienteId]);

  // --- LÓGICA DEL CARRITO ---
  const agregarAlCarrito = (producto: ProductoPOS) => {
    if (producto.stock_actual <= 0) return;

    setCarrito(prev => {
      const existe = prev.find(item => item.id_producto === producto.id_producto);
      if (existe) {
        if (existe.cantidad >= producto.stock_actual) return prev;
        return prev.map(item => item.id_producto === producto.id_producto ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const modificarCantidad = (id_producto: number, delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.id_producto === id_producto) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0 && nuevaCantidad <= item.stock_actual) {
          return { ...item, cantidad: nuevaCantidad };
        }
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id_producto: number) => {
    setCarrito(prev => prev.filter(item => item.id_producto !== id_producto));
  };

  const totalCarrito = useMemo(() => {
    return carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
  }, [carrito]);

  // --- PROCESAR PAGO ---
  const handleCobrar = async () => {
    if (carrito.length === 0 || !clienteId) return;

    // 1. OBTENEMOS EL USUARIO LOGUEADO DEL NAVEGADOR
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // 2. BUSCAMOS SU ID_EMPLEADO CRUZANDO LOS DATOS
    const empleadoCajero = dataExtras?.empleados?.find(emp => emp.usuario?.id_usuario === currentUser?.id_usuario);
    const empleadoIdAEnviar = empleadoCajero ? empleadoCajero.id_empleado : 1; // Fallback de seguridad

    try {
      const { data } = await createVenta({
        variables: {
          input: {
            empleado_id: empleadoIdAEnviar,
            cliente_id: parseInt(clienteId),
            total: totalCarrito,
            metodo_pago: metodoPago,
            tipo_venta: "Fisica",
            detalles: carrito.map(item => ({
              producto_id: item.id_producto,
              cantidad: item.cantidad,
              precio_unitario: item.precio_venta
            }))
          }
        }
      });

      if (data?.createVenta) {
        // AHORA EL TICKET SE CONSTRUYE DESDE "detalle_venta" PROVENIENTE DEL BACKEND
        setTicketData({
          id: data.createVenta.id_venta,
          total: data.createVenta.total, 
          pago: metodoPago,
          detalles: data.createVenta.detalles
        });
      }

      // Vaciamos la caja para el siguiente cliente
      setCarrito([]); 
      setClienteId('1');
      setClienteSearch('Público en General');
      setMetodoPago('Efectivo');

    } catch (err) {
      console.error("Error al procesar la venta:", err);
    }
  };

  // --- FILTRADOS ---
  const productosFiltrados = dataProductos?.productos.filter(prod => 
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const clientesFiltrados = dataExtras?.clientes?.filter(c => 
    c.nombre_completo.toLowerCase().includes(clienteSearch.toLowerCase())
  ) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] relative">
      
      {/* ==========================================
          PANEL IZQUIERDO: CATÁLOGO DE PRODUCTOS
          ========================================== */}
      <div className="flex-1 flex flex-col gap-4 bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <ShoppingCart className="text-[#3B82F6]" size={28}/> Caja Registradora
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Busca productos y agrégalos al ticket actual.</p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm shrink-0">
          <Input icon={Search} type="text" placeholder="Buscar por código o nombre del producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" />
        </div>

        {/* Cuadrícula de Productos */}
        <div className="flex-1 overflow-y-auto pr-2 pb-24">
          {loadingProd ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {productosFiltrados.map((prod) => {
                const sinStock = prod.stock_actual <= 0;
                return (
                  <button 
                    key={prod.id_producto}
                    onClick={() => agregarAlCarrito(prod)}
                    disabled={sinStock}
                    className={`flex flex-col text-left bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[20px] p-3 border border-black/5 dark:border-white/5 shadow-sm transition-all group ${sinStock ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-[#3B82F6]/30 active:scale-95'}`}
                  >
                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-[12px] mb-3 overflow-hidden relative">
                      <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e:any) => { e.target.src = "https://placehold.co/200x200?text=No+Img"; }}/>
                      {sinStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                          <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span>
                        </div>
                      )}
                    </div>
                    <p className="font-bold text-[#0F172A] dark:text-white text-sm line-clamp-2 leading-tight mb-1">{prod.nombre}</p>
                    <div className="mt-auto flex items-end justify-between w-full">
                      <span className="font-bold text-[#3B82F6] text-lg">${prod.precio_venta.toFixed(2)}</span>
                      <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">
                        Stock: {prod.stock_actual}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          PANEL DERECHO: TICKET Y COBRO
          ========================================== */}
      <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-lg flex flex-col overflow-hidden shrink-0 h-full">
        
        {/* Cabecera del Ticket */}
        <div className="p-5 border-b border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Receipt size={20} className="text-[#3B82F6]"/> Ticket de Venta
          </h2>
        </div>

        {/* Lista de Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingCart size={48} className="mb-4 text-[#64748B] dark:text-[#94A3B8]"/>
              <p className="font-medium text-[#0F172A] dark:text-white">El carrito está vacío</p>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Selecciona productos del catálogo</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {carrito.map(item => (
                <div key={item.id_producto} className="flex items-center gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-[16px] border border-black/5 dark:border-white/5">
                  <img src={item.imagen_url} alt={item.nombre} className="w-12 h-12 rounded-[8px] object-cover bg-white" onError={(e:any) => { e.target.src = "https://placehold.co/100?text=Img"; }}/>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] dark:text-white text-sm truncate">{item.nombre}</p>
                    <p className="text-xs font-medium text-[#3B82F6]">${item.precio_venta.toFixed(2)} c/u</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-full px-1 border border-black/5 dark:border-white/5">
                    <button onClick={() => modificarCantidad(item.id_producto, -1)} className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors">
                      <Minus size={14} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold text-[#0F172A] dark:text-white">{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.id_producto, 1)} disabled={item.cantidad >= item.stock_actual} className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white disabled:opacity-30 transition-colors">
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button onClick={() => eliminarDelCarrito(item.id_producto)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors ml-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zona de Opciones y Cobro */}
        <div className="border-t border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#0F172A] p-5 flex flex-col gap-4">
          
          <div className="grid grid-cols-2 gap-3">
            
            {/* NUEVO BUSCADOR AUTOCOMPLETE DE CLIENTES */}
            <div className="space-y-1.5 relative" ref={clientDropdownRef}>
              <Label className="text-[10px] uppercase tracking-wider text-[#64748B] flex items-center gap-1"><User size={12}/> Buscar Cliente</Label>
              <div className="relative">
                <input
                  type="text"
                  value={clienteSearch}
                  disabled={procesandoPago}
                  onChange={(e) => {
                    setClienteSearch(e.target.value);
                    setShowClientSearch(true);
                    if (clienteId !== '') setClienteId(''); // Reseteamos ID si escribe algo nuevo
                  }}
                  onFocus={() => setShowClientSearch(true)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[10px] text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 outline-none truncate"
                />
              </div>

              {/* Menú Flotante de Resultados */}
              {showClientSearch && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-[#FFFFFF] dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[10px] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] max-h-48 overflow-y-auto z-20 animate-in fade-in zoom-in-95">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 text-[#0F172A] dark:text-[#F8FAFC] font-medium"
                    onClick={() => {
                      setClienteId('1');
                      setClienteSearch('Público en General');
                      setShowClientSearch(false);
                    }}
                  >
                    Público en General (Default)
                  </button>
                  {clientesFiltrados.map((c) => c.id_cliente !== 1 && (
                    <button
                      key={c.id_cliente}
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 text-[#0F172A] dark:text-[#F8FAFC] border-t border-black/5 dark:border-white/5"
                      onClick={() => {
                        setClienteId(c.id_cliente.toString());
                        setClienteSearch(c.nombre_completo);
                        setShowClientSearch(false);
                      }}
                    >
                      {c.nombre_completo}
                    </button>
                  ))}
                  {clientesFiltrados.length === 0 && (
                    <div className="px-3 py-3 text-xs text-[#64748B] text-center italic">No hay resultados.</div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-[#64748B] flex items-center gap-1"><CreditCard size={12}/> Pago</Label>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} disabled={procesandoPago} className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[10px] text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none outline-none">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-black/5 dark:bg-white/5 w-full my-1"></div>

          {/* Totales y Botón */}
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] font-medium mb-1">Total a cobrar</p>
              <p className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">${totalCarrito.toFixed(2)}</p>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">{carrito.length} artículos</p>
          </div>

          {errorPago && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm font-medium flex gap-2 items-start">
              <AlertTriangle size={16} className="shrink-0 mt-0.5"/> <p>{errorPago.message}</p>
            </div>
          )}

          <Button 
            variant="primary" 
            onClick={handleCobrar} 
            disabled={carrito.length === 0 || procesandoPago || !clienteId} // Bloqueado si no seleccionó un cliente de la lista
            className="w-full h-14 text-lg font-bold shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-2 disabled:shadow-none"
          >
            {procesandoPago ? <Loader2 size={24} className="animate-spin" /> : <><Banknote size={24}/> Procesar Venta</>}
          </Button>

        </div>
      </div>

      {/* ==========================================
          MODAL OBLIGATORIO DE TICKET DE VENTA 
          ========================================== */}
      {ticketData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-white mb-1">¡Venta Exitosa!</h2>
              <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mb-6">Ticket #{ticketData.id} registrado correctamente.</p>
              
              {/* Resumen estilo Ticket */}
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl p-5 text-left border border-black/5 dark:border-white/5 relative">
                
                {/* Bordes dentados visuales del ticket */}
                <div className="absolute -top-1 left-0 w-full overflow-hidden flex justify-between px-2 opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-2 h-2 bg-white dark:bg-[#1E293B] rounded-full"></div>)}
                </div>

                <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-3 text-center border-b border-dashed border-black/10 dark:border-white/10 pb-2">
                  Resumen de Compra
                </p>
                
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {ticketData.detalles.map((detalle, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <span className="text-[#0F172A] dark:text-white font-medium pr-3 leading-tight">{detalle.cantidad}x {detalle.producto.nombre}</span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">${detalle.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-black/10 dark:border-white/10 mt-4 pt-3 space-y-1">
                  <div className="flex justify-between items-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                    <span>Subtotal</span>
                    <span>${ticketData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0F172A] dark:text-white">Total Pagado</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">${ticketData.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center text-xs bg-white dark:bg-[#1E293B] px-3 py-2 rounded-lg border border-black/5 dark:border-white/5">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Método de pago:</span>
                  <span className="font-bold text-[#0F172A] dark:text-white">{ticketData.pago}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-center bg-[#F8FAFC] dark:bg-[#0F172A]">
              <Button onClick={() => setTicketData(null)} variant="primary" className="w-full text-center flex justify-center h-12 text-base">
                Cerrar Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};