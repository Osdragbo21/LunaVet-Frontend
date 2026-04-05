import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, 
  Banknote, Receipt, AlertTriangle, Loader2, CheckCircle, User, Package, Award 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. QUERIES Y MUTACIONES (Actualizadas para Servicios)
// ==========================================
const GET_INVENTARIO_Y_SERVICIOS = gql`
  query GetInventarioYServicios {
    productos {
      id_producto
      nombre
      precio_venta
      stock_actual
      imagen_url
    }
    servicios {
      id_servicio
      nombre_servicio
      costo_base
      descripcion
    }
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
      detalles_servicios {
        servicio {
          nombre_servicio
        }
        costo_aplicado
      }
    }
  }
`;

// ==========================================
// 2. INTERFACES UNIFICADAS PARA EL CARRITO
// ==========================================
interface ItemCarrito {
  id_item: number; // Puede ser id_producto o id_servicio
  tipo: 'producto' | 'servicio';
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock_actual: number | null; // Null para servicios
  imagen_url: string | null;
}

// NUEVAS INTERFACES PARA ARREGLAR TYPESCRIPT
interface ProductoData {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  imagen_url: string;
}

interface ServicioData {
  id_servicio: number;
  nombre_servicio: string;
  costo_base: number;
  descripcion: string;
}

interface ClienteData {
  id_cliente: number;
  nombre_completo: string;
}

interface EmpleadoData {
  id_empleado: number;
  usuario: {
    id_usuario: number;
  } | null;
}

interface GetInventarioResponse {
  productos: ProductoData[];
  servicios: ServicioData[];
  clientes: ClienteData[];
  empleados: EmpleadoData[];
}

interface CreateVentaResponse {
  createVenta: {
    id_venta: number;
    total: number;
    estado_pedido: string;
    detalles: {
      producto: { nombre: string } | null;
      cantidad: number;
      subtotal: number;
    }[];
    detalles_servicios: {
      servicio: { nombre_servicio: string } | null;
      costo_aplicado: number;
    }[];
  };
}

// ==========================================
// 3. VISTA PRINCIPAL (CAJA REGISTRADORA)
// ==========================================
export const NuevaVentaView = () => {
  // --- ESTADOS ---
  const [posTab, setPosTab] = useState<'productos' | 'servicios'>('productos');
  const [searchTerm, setSearchTerm] = useState('');
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  
  // Buscador de Clientes
  const [clienteId, setClienteId] = useState('1'); 
  const [clienteSearch, setClienteSearch] = useState('Público en General');
  const [showClientSearch, setShowClientSearch] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);
  
  // Ticket Data
  const [ticketData, setTicketData] = useState<CreateVentaResponse['createVenta'] | null>(null);

  // --- PETICIÓN GLOBAL TIPADA ---
  const { data, loading: loadingData } = useQuery<GetInventarioResponse>(GET_INVENTARIO_Y_SERVICIOS);
  
  const [createVenta, { loading: procesandoPago, error: errorPago }] = useMutation<CreateVentaResponse>(CREATE_VENTA_POS, {
    refetchQueries: ['GetInventarioYServicios', 'GetHistorialVentas', 'GetProductos']
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clientDropdownRef.current && !clientDropdownRef.current.contains(event.target as Node)) {
        setShowClientSearch(false);
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
  const agregarProductoAlCarrito = (prod: ProductoData) => {
    if (prod.stock_actual <= 0) return;
    setCarrito(prev => {
      const existe = prev.find(item => item.tipo === 'producto' && item.id_item === prod.id_producto);
      if (existe) {
        if (existe.cantidad >= prod.stock_actual) return prev;
        return prev.map(item => (item.tipo === 'producto' && item.id_item === prod.id_producto) ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { id_item: prod.id_producto, tipo: 'producto', nombre: prod.nombre, precio_unitario: prod.precio_venta, cantidad: 1, stock_actual: prod.stock_actual, imagen_url: prod.imagen_url }];
    });
  };

  const agregarServicioAlCarrito = (serv: ServicioData) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.tipo === 'servicio' && item.id_item === serv.id_servicio);
      if (existe) {
        return prev.map(item => (item.tipo === 'servicio' && item.id_item === serv.id_servicio) ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { id_item: serv.id_servicio, tipo: 'servicio', nombre: serv.nombre_servicio, precio_unitario: serv.costo_base, cantidad: 1, stock_actual: null, imagen_url: null }];
    });
  };

  const modificarCantidad = (id_item: number, tipo: 'producto' | 'servicio', delta: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.id_item === id_item && item.tipo === tipo) {
        const nuevaCantidad = item.cantidad + delta;
        if (nuevaCantidad > 0) {
          if (item.tipo === 'producto' && item.stock_actual && nuevaCantidad > item.stock_actual) return item;
          return { ...item, cantidad: nuevaCantidad };
        }
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (id_item: number, tipo: 'producto' | 'servicio') => {
    setCarrito(prev => prev.filter(item => !(item.id_item === id_item && item.tipo === tipo)));
  };

  const totalCarrito = useMemo(() => {
    return carrito.reduce((acc, item) => acc + (item.precio_unitario * item.cantidad), 0);
  }, [carrito]);

  // --- PROCESAR PAGO ---
  const handleCobrar = async () => {
    if (carrito.length === 0 || !clienteId) return;

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const empleadoCajero = data?.empleados?.find((emp) => emp.usuario?.id_usuario === currentUser?.id_usuario);
    const empleadoIdAEnviar = empleadoCajero ? empleadoCajero.id_empleado : 1;

    // PREPARAR ARREGLOS PARA EL BACKEND
    const detalles_productos = carrito
      .filter(i => i.tipo === 'producto')
      .map(i => ({ producto_id: i.id_item, cantidad: i.cantidad, precio_unitario: i.precio_unitario }));

    const detalles_servicios: any[] = [];
    carrito.filter(i => i.tipo === 'servicio').forEach(item => {
      // Expandimos los servicios si agregaron más de 1 cantidad del mismo
      for (let k = 0; k < item.cantidad; k++) {
        detalles_servicios.push({ servicio_id: item.id_item, costo_aplicado: item.precio_unitario });
      }
    });

    try {
      const result = await createVenta({
        variables: {
          input: {
            empleado_id: empleadoIdAEnviar,
            cliente_id: parseInt(clienteId),
            total: totalCarrito,
            metodo_pago: metodoPago,
            tipo_venta: "Fisica",
            // Mandamos los arreglos separados según lo solicitado
            detalles_productos: detalles_productos.length > 0 ? detalles_productos : undefined,
            detalles_servicios: detalles_servicios.length > 0 ? detalles_servicios : undefined
          }
        }
      });

      if (result.data?.createVenta) {
        setTicketData(result.data.createVenta);
      }

      setCarrito([]); 
      setClienteId('1');
      setClienteSearch('Público en General');
      setMetodoPago('Efectivo');
    } catch (err) {
      console.error("Error al procesar la venta:", err);
    }
  };

  // --- FILTRADOS ---
  const productosFiltrados = data?.productos?.filter((p) => p.nombre.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  const serviciosFiltrados = data?.servicios?.filter((s) => s.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase())) || [];
  const clientesFiltrados = data?.clientes?.filter((c) => c.nombre_completo.toLowerCase().includes(clienteSearch.toLowerCase())) || [];

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)] relative">
      
      {/* ==========================================
          PANEL IZQUIERDO: CATÁLOGO Y BUSCADOR
          ========================================== */}
      <div className="flex-1 flex flex-col gap-4 bg-[#F8FAFC] dark:bg-[#0F172A] overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <ShoppingCart className="text-[#3B82F6]" size={28}/> Punto de Venta
            </h1>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Agrega productos o servicios médicos al ticket.</p>
          </div>
          
          {/* Pestañas (Productos / Servicios) */}
          <div className="flex p-1 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-xl border border-black/5 dark:border-white/5 shadow-sm">
            <button 
              onClick={() => setPosTab('productos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${posTab === 'productos' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <Package size={16} /> Artículos
            </button>
            <button 
              onClick={() => setPosTab('servicios')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${posTab === 'servicios' ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <Award size={16} /> Servicios Clínicos
            </button>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm shrink-0">
          <Input icon={Search} type="text" placeholder={`Buscar ${posTab === 'productos' ? 'producto' : 'servicio'}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" />
        </div>

        {/* Cuadrícula de Resultados */}
        <div className="flex-1 overflow-y-auto pr-2 pb-24">
          {loadingData ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>
          ) : posTab === 'productos' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in duration-200">
              {productosFiltrados.map((prod) => {
                const sinStock = prod.stock_actual <= 0;
                return (
                  <button 
                    key={`prod-${prod.id_producto}`}
                    onClick={() => agregarProductoAlCarrito(prod)}
                    disabled={sinStock}
                    className={`flex flex-col text-left bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[20px] p-3 border border-black/5 dark:border-white/5 shadow-sm transition-all group ${sinStock ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md hover:border-[#3B82F6]/30 active:scale-95'}`}
                  >
                    <div className="w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-[12px] mb-3 overflow-hidden relative">
                      <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform" onError={(e:any) => { e.target.src = "https://placehold.co/200x200?text=No+Img"; }}/>
                      {sinStock && <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]"><span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">Agotado</span></div>}
                    </div>
                    <p className="font-bold text-[#0F172A] dark:text-white text-sm line-clamp-2 leading-tight mb-1">{prod.nombre}</p>
                    <div className="mt-auto flex items-end justify-between w-full">
                      <span className="font-bold text-[#3B82F6] text-lg">${prod.precio_venta.toFixed(2)}</span>
                      <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8] bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">Stock: {prod.stock_actual}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-200">
              {serviciosFiltrados.map((serv) => (
                <button 
                  key={`serv-${serv.id_servicio}`}
                  onClick={() => agregarServicioAlCarrito(serv)}
                  className="flex flex-col text-left bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[20px] p-5 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md hover:border-[#3B82F6]/30 active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-full flex items-center justify-center">
                      <Award size={20} />
                    </div>
                    <span className="font-black text-[#0F172A] dark:text-white text-base leading-tight">{serv.nombre_servicio}</span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-2 mb-4">{serv.descripcion || 'Servicio clínico general.'}</p>
                  <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 w-full flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Precio Base</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">${serv.costo_base.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          PANEL DERECHO: TICKET DE VENTA
          ========================================== */}
      <div className="w-full lg:w-[400px] xl:w-[450px] bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-lg flex flex-col overflow-hidden shrink-0 h-full">
        
        <div className="p-5 border-b border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <h2 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Receipt size={20} className="text-[#3B82F6]"/> Ticket Integrado
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingCart size={48} className="mb-4 text-[#64748B] dark:text-[#94A3B8]"/>
              <p className="font-medium text-[#0F172A] dark:text-white">La caja está vacía</p>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Selecciona artículos o servicios</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {carrito.map((item, idx) => (
                <div key={`cart-${item.tipo}-${item.id_item}-${idx}`} className={`flex items-center gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-[16px] border ${item.tipo === 'servicio' ? 'border-purple-200 dark:border-purple-500/30' : 'border-black/5 dark:border-white/5'}`}>
                  
                  {item.tipo === 'producto' ? (
                    <img src={item.imagen_url || ''} alt={item.nombre} className="w-12 h-12 rounded-[8px] object-cover bg-white" onError={(e:any) => { e.target.src = "https://placehold.co/100?text=Img"; }}/>
                  ) : (
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl flex items-center justify-center shrink-0">
                      <Award size={20} />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] dark:text-white text-sm truncate">{item.nombre}</p>
                    <p className="text-xs font-medium text-[#3B82F6]">${item.precio_unitario.toFixed(2)} {item.tipo === 'producto' && 'c/u'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-full px-1 border border-black/5 dark:border-white/5">
                    <button onClick={() => modificarCantidad(item.id_item, item.tipo, -1)} className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"><Minus size={14} /></button>
                    <span className="w-4 text-center text-sm font-bold text-[#0F172A] dark:text-white">{item.cantidad}</span>
                    <button onClick={() => modificarCantidad(item.id_item, item.tipo, 1)} disabled={item.tipo === 'producto' && item.cantidad >= (item.stock_actual || 0)} className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white disabled:opacity-30 transition-colors"><Plus size={14} /></button>
                  </div>
                  
                  <button onClick={() => eliminarDelCarrito(item.id_item, item.tipo)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-full transition-colors ml-1"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zona de Cobro */}
        <div className="border-t border-black/5 dark:border-white/5 bg-[#F8FAFC] dark:bg-[#0F172A] p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            
            {/* Buscador Autocomplete de Clientes */}
            <div className="space-y-1.5 relative" ref={clientDropdownRef}>
              <Label className="text-[10px] uppercase tracking-wider text-[#64748B] flex items-center gap-1"><User size={12}/> Buscar Cliente</Label>
              <div className="relative">
                <input
                  type="text" value={clienteSearch} disabled={procesandoPago}
                  onChange={(e) => { setClienteSearch(e.target.value); setShowClientSearch(true); if (clienteId !== '') setClienteId(''); }}
                  onFocus={() => setShowClientSearch(true)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[10px] text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 outline-none truncate"
                />
              </div>
              {showClientSearch && (
                <div className="absolute bottom-full left-0 mb-1 w-full bg-[#FFFFFF] dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[10px] shadow-[0_-8px_30px_rgb(0,0,0,0.12)] max-h-48 overflow-y-auto z-20 animate-in fade-in zoom-in-95">
                  <button type="button" className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 font-medium" onClick={() => { setClienteId('1'); setClienteSearch('Público en General'); setShowClientSearch(false); }}>
                    Público en General
                  </button>
                  {clientesFiltrados.map((c) => c.id_cliente !== 1 && (
                    <button key={c.id_cliente} type="button" className="w-full text-left px-3 py-2.5 text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 border-t border-black/5 dark:border-white/5" onClick={() => { setClienteId(c.id_cliente.toString()); setClienteSearch(c.nombre_completo); setShowClientSearch(false); }}>
                      {c.nombre_completo}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-wider text-[#64748B] flex items-center gap-1"><CreditCard size={12}/> Pago</Label>
              <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)} disabled={procesandoPago} className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[10px] text-sm focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none outline-none">
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta Débito/Crédito</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>
          </div>

          <div className="h-px bg-black/5 dark:bg-white/5 w-full my-1"></div>

          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-[#64748B] font-medium mb-1">Total a cobrar</p>
              <p className="text-3xl font-black text-[#0F172A] dark:text-white tracking-tight">${totalCarrito.toFixed(2)}</p>
            </div>
            <p className="text-xs text-[#64748B] font-medium">{carrito.length} apartados</p>
          </div>

          {errorPago && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 text-rose-600 p-3 rounded-xl text-sm font-medium flex gap-2 items-start"><AlertTriangle size={16} className="shrink-0 mt-0.5"/> <p>{errorPago.message}</p></div>
          )}

          <Button variant="primary" onClick={handleCobrar} disabled={carrito.length === 0 || procesandoPago || !clienteId} className="w-full h-14 text-lg font-bold shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-2">
            {procesandoPago ? <Loader2 size={24} className="animate-spin" /> : <><Banknote size={24}/> Procesar Venta</>}
          </Button>

        </div>
      </div>

      {/* ==========================================
          MODAL DE TICKET RESULTANTE
          ========================================== */}
      {ticketData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-black text-[#0F172A] dark:text-white mb-1">¡Venta Exitosa!</h2>
              <p className="text-sm font-medium text-[#64748B] mb-6">Ticket #{ticketData.id_venta} registrado correctamente.</p>
              
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] rounded-2xl p-5 text-left border border-black/5 relative">
                <div className="absolute -top-1 left-0 w-full overflow-hidden flex justify-between px-2 opacity-20">
                  {Array.from({ length: 12 }).map((_, i) => <div key={i} className="w-2 h-2 bg-white dark:bg-[#1E293B] rounded-full"></div>)}
                </div>

                <p className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-3 text-center border-b border-dashed border-black/10 pb-2">
                  Resumen de Compra
                </p>
                
                <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {/* Desglose de Productos */}
                  {ticketData.detalles && ticketData.detalles.map((det, idx) => (
                    <div key={`p-${idx}`} className="flex justify-between items-start text-sm">
                      <span className="text-[#0F172A] dark:text-white font-medium pr-3 leading-tight">{det.cantidad}x {det.producto?.nombre}</span>
                      <span className="text-[#64748B] whitespace-nowrap">${det.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                  
                  {/* Desglose de Servicios */}
                  {ticketData.detalles_servicios && ticketData.detalles_servicios.map((det, idx) => (
                    <div key={`s-${idx}`} className="flex justify-between items-start text-sm">
                      <span className="text-purple-600 dark:text-purple-400 font-bold pr-3 leading-tight flex items-center gap-1"><Award size={12}/> {det.servicio?.nombre_servicio}</span>
                      <span className="text-[#64748B] whitespace-nowrap">${det.costo_aplicado.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-black/10 mt-4 pt-3 space-y-1">
                  <div className="flex justify-between items-center text-xs text-[#64748B]">
                    <span>Subtotal</span><span>${ticketData.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#0F172A] dark:text-white">Total Pagado</span>
                    <span className="text-xl font-black text-emerald-600">${ticketData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 border-t border-black/5 bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-center">
              <Button onClick={() => setTicketData(null)} variant="primary" className="w-full">Cerrar Ticket</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};