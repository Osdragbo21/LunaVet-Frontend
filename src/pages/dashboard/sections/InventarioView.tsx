import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Package, Edit2, AlertTriangle, CheckCircle, 
  Store, Loader2, X, MoreVertical, Trash2, EyeOff, Tag, DollarSign, 
  Image as ImageIcon, Truck, UploadCloud
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoProductoModal } from '../components/NuevoProductoModal';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_PRODUCTOS = gql`
  query GetProductos {
    productos {
      id_producto
      nombre
      descripcion
      categoria
      precio_compra
      precio_venta
      stock_actual
      stock_minimo
      imagen_url
      activo_en_tienda
      proveedor {
        id_proveedor
        nombre_empresa
      }
    }
  }
`;

// Agregamos la query de proveedores para el Dropdown de Edición
const GET_PROVEEDORES_DROPDOWN = gql`
  query GetProveedoresDropdown {
    proveedores {
      id_proveedor
      nombre_empresa
    }
  }
`;

const UPDATE_PRODUCTO = gql`
  mutation UpdateProducto($input: UpdateProductoInput!) {
    updateProducto(updateProductoInput: $input) {
      id_producto
      nombre
      descripcion
      categoria
      precio_compra
      precio_venta
      stock_actual
      stock_minimo
      imagen_url
      activo_en_tienda
      proveedor {
        id_proveedor
        nombre_empresa
      }
    }
  }
`;

// Mutación actualizada con el nombre exacto sugerido por el backend
const REMOVE_PRODUCTO = gql`
  mutation RemoveProducto($id: Int!) {
    removeProducto(id: $id)
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface ProveedorDropdown {
  id_proveedor: number;
  nombre_empresa: string;
}

interface GetProveedoresResponse {
  proveedores: ProveedorDropdown[];
}

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  precio_compra: number;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  imagen_url: string;
  activo_en_tienda: boolean;
  proveedor?: { 
    id_proveedor: number;
    nombre_empresa: string; 
  };
}

// ==========================================
// 3. MODALES AUXILIARES
// ==========================================

// --- NUEVO MODAL DE EDICIÓN COMPLETA ---
const ModalEditarProducto = ({ isOpen, producto, onClose }: { isOpen: boolean, producto: Producto | null, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    nombre: '', categoria: '', proveedor_id: '',
    precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '',
    imagen_url: '', descripcion: ''
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const { data: proveedoresData, loading: loadingProveedores } = useQuery<GetProveedoresResponse>(GET_PROVEEDORES_DROPDOWN, { skip: !isOpen });
  const [updateProducto, { loading, error }] = useMutation(UPDATE_PRODUCTO, { refetchQueries: ['GetProductos'] });

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre || '',
        categoria: producto.categoria || 'Alimento',
        proveedor_id: producto.proveedor?.id_proveedor?.toString() || '',
        precio_compra: producto.precio_compra?.toString() || '0',
        precio_venta: producto.precio_venta?.toString() || '0',
        stock_actual: producto.stock_actual?.toString() || '0',
        stock_minimo: producto.stock_minimo?.toString() || '0',
        imagen_url: producto.imagen_url || '',
        descripcion: producto.descripcion || ''
      });
    }
  }, [producto]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLocalError("La imagen es demasiado grande. Máximo 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imagen_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!producto) return;
    try {
      await updateProducto({
        variables: {
          input: {
            id_producto: producto.id_producto,
            nombre: formData.nombre.trim(),
            categoria: formData.categoria,
            proveedor_id: formData.proveedor_id ? parseInt(formData.proveedor_id) : null,
            precio_compra: parseFloat(formData.precio_compra),
            precio_venta: parseFloat(formData.precio_venta),
            stock_actual: parseInt(formData.stock_actual),
            stock_minimo: parseInt(formData.stock_minimo),
            imagen_url: formData.imagen_url.trim(),
            descripcion: formData.descripcion.trim()
          }
        }
      });
      onClose();
    } catch (err) { 
      console.error(err); 
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Edit2 size={24} className="text-[#3B82F6]"/> Editar Producto</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Actualizando información de: {producto.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="editProdForm" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">{error.message}</div>}
            {localError && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">{localError}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre del Producto</Label>
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={Tag} required disabled={loading} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} disabled={loading} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                      <option value="Alimento">Alimento</option>
                      <option value="Medicamento">Medicamento</option>
                      <option value="Accesorio">Accesorio</option>
                      <option value="Higiene">Higiene</option>
                      <option value="Juguetes">Juguetes</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Truck size={14}/> Proveedor</Label>
                    <div className="relative">
                      <select name="proveedor_id" value={formData.proveedor_id} onChange={handleChange} required disabled={loading || loadingProveedores} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none disabled:opacity-60">
                        <option value="">Selecciona...</option>
                        {proveedoresData?.proveedores?.map(prov => (
                          <option key={prov.id_proveedor} value={prov.id_proveedor}>{prov.nombre_empresa}</option>
                        ))}
                      </select>
                      {loadingProveedores && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Costo de Compra ($)</Label>
                    <Input name="precio_compra" type="number" step="0.01" value={formData.precio_compra} onChange={handleChange} icon={DollarSign} required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio de Venta ($)</Label>
                    <Input name="precio_venta" type="number" step="0.01" value={formData.precio_venta} onChange={handleChange} icon={DollarSign} required disabled={loading} />
                  </div>
                </div>
              </div>

              {/* Columna Derecha */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-[16px] border border-amber-100 dark:border-amber-500/10">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Package size={14}/> Stock Real</Label>
                    <Input name="stock_actual" type="number" value={formData.stock_actual} onChange={handleChange} required disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-amber-600"><AlertTriangle size={14}/> Alerta Mínima</Label>
                    <Input name="stock_minimo" type="number" value={formData.stock_minimo} onChange={handleChange} required disabled={loading} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagen del Producto (URL o Archivo)</Label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input name="imagen_url" type="text" value={formData.imagen_url} onChange={handleChange} icon={ImageIcon} required disabled={loading} placeholder="URL o subir archivo..." />
                    </div>
                    <input type="file" id={`img-upload-edit-${producto?.id_producto}`} className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
                    <Button type="button" variant="outline" onClick={() => document.getElementById(`img-upload-edit-${producto?.id_producto}`)?.click()} disabled={loading} className="!px-3 shrink-0" title="Subir Imagen Local">
                      <UploadCloud size={20} />
                    </Button>
                  </div>
                  {formData.imagen_url && formData.imagen_url.length > 0 && (
                    <div className="mt-2 w-16 h-16 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden bg-white">
                      <img src={formData.imagen_url} alt="Vista previa" className="w-full h-full object-cover" onError={(e:any)=> e.target.style.display='none'}/>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Descripción Breve</Label>
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 resize-none" required disabled={loading} />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="editProdForm" variant="primary" disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ModalEliminarProducto = ({ isOpen, producto, onClose }: { isOpen: boolean, producto: Producto | null, onClose: () => void }) => {
  // Ahora usamos REMOVE_PRODUCTO
  const [deleteProducto, { loading, error }] = useMutation(REMOVE_PRODUCTO, {
    refetchQueries: ['GetProductos']
  });

  const handleDelete = async () => {
    if (!producto) return;
    try {
      await deleteProducto({ variables: { id: producto.id_producto } });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar Producto?</h2>
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-2 font-medium">
          {producto.nombre}
        </p>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6">
          Esta acción lo borrará del catálogo permanentemente. Si solo quieres que no se venda, considera ocultarlo de la tienda.
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

// ==========================================
// 4. VISTA PRINCIPAL
// ==========================================
export const InventarioView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // ESTADOS DEL FILTRO
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  
  // ESTADOS DE MENÚ DE ACCIONES
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  
  // ESTADOS DE MODALES
  const [isModalNewOpen, setIsModalNewOpen] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);

  const { data, loading, error } = useQuery<{productos: Producto[]}>(GET_PRODUCTOS);
  const [updateProducto] = useMutation(UPDATE_PRODUCTO, { refetchQueries: ['GetProductos'] });

  const handleToggleTienda = async (prod: Producto) => {
    try {
      await updateProducto({ 
        variables: { input: { id_producto: prod.id_producto, activo_en_tienda: !prod.activo_en_tienda } } 
      });
      setMenuAbierto(null);
    } catch (err) {
      console.error(err);
    }
  };

  const productosFiltrados = data?.productos.filter((prod) => {
    const matchSearch = prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || prod.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    let matchFilter = true;
    if (filtroActivo === 'alimento') matchFilter = prod.categoria === 'Alimento';
    if (filtroActivo === 'medicamento') matchFilter = prod.categoria === 'Medicamento';
    if (filtroActivo === 'accesorio') matchFilter = prod.categoria === 'Accesorio';
    if (filtroActivo === 'higiene') matchFilter = prod.categoria === 'Higiene';
    if (filtroActivo === 'juguetes') matchFilter = prod.categoria === 'Juguetes';
    if (filtroActivo === 'alerta') matchFilter = prod.stock_actual <= prod.stock_minimo;
    return matchSearch && matchFilter;
  }) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Package className="text-[#3B82F6]" size={28}/> 
            Catálogo e Inventario
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Gestiona productos, existencias y precios de la clínica y tienda.</p>
        </div>
        <Button variant="primary" className="!px-5 !py-2.5 shadow-md" onClick={() => setIsModalNewOpen(true)}>
          <Plus size={18} /> Nuevo Producto
        </Button>
      </div>

      {/* Buscador y Botón de Filtros */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            icon={Search} 
            type="text" 
            placeholder="Buscar por nombre o categoría..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" 
          />
        </div>
        
        {/* Menú de Filtros Funcional (Dropdown) */}
        <div className="relative">
          <Button 
            variant="outline" 
            className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8] relative w-full sm:w-auto"
            onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}
          >
            <Filter size={18} /> Filtros
            {filtroActivo !== 'todos' && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6] border border-white dark:border-[#1E293B]"></span>
            )}
          </Button>
          
          {menuFiltrosAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuFiltrosAbierto(false)}></div>
              <div className="absolute right-0 top-14 w-52 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setFiltroActivo('todos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'todos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Todos los Productos</button>
                
                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                
                <button onClick={() => { setFiltroActivo('alerta'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${filtroActivo === 'alerta' ? 'text-amber-600 bg-amber-50 dark:bg-amber-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <AlertTriangle size={14} className={filtroActivo === 'alerta' ? 'text-amber-600' : 'text-amber-500'}/> Alerta de Bajo Stock
                </button>
                
                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                <button onClick={() => { setFiltroActivo('alimento'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'alimento' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Alimentos</button>
                <button onClick={() => { setFiltroActivo('medicamento'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'medicamento' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Medicamentos</button>
                <button onClick={() => { setFiltroActivo('accesorio'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'accesorio' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Accesorios</button>
                <button onClick={() => { setFiltroActivo('higiene'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'higiene' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Higiene</button>
                <button onClick={() => { setFiltroActivo('juguetes'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'juguetes' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Juguetes</button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
      
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-6 rounded-xl shadow-sm mb-2">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold">Error al cargar el inventario</h3>
          </div>
          <p className="font-medium text-sm">{error.message}</p>
        </div>
      )}

      {/* Tabla de Productos */}
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
          <div className="overflow-x-auto pb-24 -mb-24">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Producto</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Precio</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Inventario</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Tienda Web</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {productosFiltrados.length > 0 ? (
                  productosFiltrados.map((prod) => {
                    const stockCritico = prod.stock_actual <= prod.stock_minimo;
                    return (
                      <tr key={prod.id_producto} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={prod.imagen_url} alt={prod.nombre} className="w-12 h-12 rounded-xl object-cover bg-gray-100 dark:bg-gray-800 border border-black/5 dark:border-white/5" onError={(e:any) => { e.target.src = "https://placehold.co/100x100?text=No+Img"; }} />
                            <div>
                              <p className="font-bold text-[#0F172A] dark:text-white text-sm max-w-[200px] truncate">{prod.nombre}</p>
                              <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">{prod.categoria} • {prod.proveedor?.nombre_empresa || 'Sin Proveedor'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                          ${prod.precio_venta.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1.5 font-bold text-xs px-2.5 py-1 rounded-full w-fit ${stockCritico ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                              {stockCritico ? <AlertTriangle size={12}/> : <Package size={12}/>}
                              {prod.stock_actual} en stock
                            </span>
                            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Mínimo: {prod.stock_minimo}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {prod.activo_en_tienda ? 
                            <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold"><CheckCircle size={14}/> Activo</span> : 
                            <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 text-xs font-bold"><EyeOff size={14}/> Oculto</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          
                          {/* BOTÓN DE ACCIONES DE 3 PUNTITOS */}
                          <button 
                            onClick={() => setMenuAbierto(menuAbierto === prod.id_producto ? null : prod.id_producto)}
                            className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {/* MENÚ DESPLEGABLE */}
                          {menuAbierto === prod.id_producto && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                              <div className="absolute right-8 top-10 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                                
                                <button 
                                  onClick={() => { setProductoAEditar(prod); setMenuAbierto(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                  <Edit2 size={16} /> Editar Producto
                                </button>

                                <button 
                                  onClick={() => handleToggleTienda(prod)}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                  {prod.activo_en_tienda ? <><EyeOff size={16}/> Ocultar de Tienda</> : <><Store size={16}/> Mostrar en Tienda</>}
                                </button>

                                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                                <button 
                                  onClick={() => { setProductoAEliminar(prod); setMenuAbierto(null); }}
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                                >
                                  <Trash2 size={16} /> Eliminar
                                </button>
                                
                              </div>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">No se encontraron productos.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDERIZADO DE MODALES */}
      <NuevoProductoModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
      <ModalEditarProducto isOpen={!!productoAEditar} producto={productoAEditar} onClose={() => setProductoAEditar(null)} />
      <ModalEliminarProducto isOpen={!!productoAEliminar} producto={productoAEliminar} onClose={() => setProductoAEliminar(null)} />
      
    </div>
  );
};