import React, { useState } from 'react';
import { X, Package, Tag, DollarSign, Image as ImageIcon, Loader2, CheckCircle, AlertTriangle, Truck, UploadCloud } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// 1. NUEVA QUERY: Descargamos la lista de proveedores para el Dropdown
const GET_PROVEEDORES_DROPDOWN = gql`
  query GetProveedoresDropdown {
    proveedores {
      id_proveedor
      nombre_empresa
    }
  }
`;

const CREATE_PRODUCTO = gql`
  mutation CreateProducto($input: CreateProductoInput!) {
    createProducto(createInput: $input) {
      id_producto
      nombre
      stock_actual
    }
  }
`;

// ==========================================
// INTERFACES
// ==========================================
interface ProveedorDropdown {
  id_proveedor: number;
  nombre_empresa: string;
}

interface GetProveedoresResponse {
  proveedores: ProveedorDropdown[];
}

interface NuevoProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoProductoModal: React.FC<NuevoProductoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Alimento',
    proveedor_id: '', // Ya no tiene el '1' por defecto, forzamos a que seleccione
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: '',
    imagen_url: '',
    descripcion: '',
    activo_en_tienda: true
  });

  const client = useApolloClient();
  
  // Ejecutamos la consulta de proveedores solo cuando el modal se abre
  const { data: proveedoresData, loading: loadingProveedores } = useQuery<GetProveedoresResponse>(GET_PROVEEDORES_DROPDOWN, {
    skip: !isOpen 
  });

  const [createProducto] = useMutation(CREATE_PRODUCTO);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (Máximo 2MB para no saturar la Base de Datos)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("La imagen seleccionada es muy pesada. El tamaño máximo es 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // El resultado es un string en Base64 (data:image/jpeg;base64,...)
      setFormData(prev => ({ ...prev, imagen_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await createProducto({
        variables: {
          input: {
            proveedor_id: parseInt(formData.proveedor_id),
            nombre: formData.nombre.trim(),
            categoria: formData.categoria,
            precio_compra: parseFloat(formData.precio_compra),
            precio_venta: parseFloat(formData.precio_venta),
            stock_actual: parseInt(formData.stock_actual),
            stock_minimo: parseInt(formData.stock_minimo),
            imagen_url: formData.imagen_url.trim(),
            descripcion: formData.descripcion.trim(),
            activo_en_tienda: formData.activo_en_tienda
          }
        }
      });
      
      await client.refetchQueries({ include: "active" });

      setSuccessMsg(true);
      setTimeout(() => {
        setFormData({
          nombre: '', categoria: 'Alimento', proveedor_id: '', precio_compra: '', precio_venta: '', 
          stock_actual: '', stock_minimo: '', imagen_url: '', descripcion: '', activo_en_tienda: true
        });
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      // Interceptamos el error de llave foránea por si llega a ocurrir otra vez con otro dato
      if (err.message.includes('llave foránea') || err.message.includes('foreign key')) {
        setErrorMsg("El proveedor seleccionado no es válido o fue eliminado.");
      } else {
        setErrorMsg(err.message || "Ocurrió un error al registrar el producto.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Package size={24} className="text-[#3B82F6]"/> Registrar Producto</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Añade nueva mercancía al catálogo y tienda en línea.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="productoForm" onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">{errorMsg}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2"><CheckCircle size={20} /> ¡Producto registrado con éxito!</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda: Datos Básicos */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre del Producto</Label>
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={Tag} placeholder="Ej. Croquetas ProPlan 3kg" required disabled={isSubmitting || successMsg} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <select name="categoria" value={formData.categoria} onChange={handleChange} disabled={isSubmitting || successMsg} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                      <option value="Alimento">Alimento</option>
                      <option value="Medicamento">Medicamento</option>
                      <option value="Accesorio">Accesorio</option>
                      <option value="Higiene">Higiene</option>
                      <option value="Juguetes">Juguetes</option>
                    </select>
                  </div>
                  
                  {/* AQUÍ EL CAMBIO PRINCIPAL: DROPDOWN DE PROVEEDORES */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Truck size={14}/> Proveedor</Label>
                    <div className="relative">
                      <select 
                        name="proveedor_id" 
                        value={formData.proveedor_id} 
                        onChange={handleChange} 
                        required 
                        disabled={isSubmitting || successMsg || loadingProveedores} 
                        className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none disabled:opacity-60"
                      >
                        <option value="">Selecciona...</option>
                        {proveedoresData?.proveedores?.map(prov => (
                          <option key={prov.id_proveedor} value={prov.id_proveedor}>
                            {prov.nombre_empresa}
                          </option>
                        ))}
                      </select>
                      {loadingProveedores && <Loader2 className="absolute right-4 top-3.5 animate-spin text-[#3B82F6]" size={18} />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Costo de Compra ($)</Label>
                    <Input name="precio_compra" type="number" step="0.01" value={formData.precio_compra} onChange={handleChange} icon={DollarSign} placeholder="0.00" required disabled={isSubmitting || successMsg} />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio de Venta ($)</Label>
                    <Input name="precio_venta" type="number" step="0.01" value={formData.precio_venta} onChange={handleChange} icon={DollarSign} placeholder="0.00" required disabled={isSubmitting || successMsg} />
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Inventario y Detalles */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50/50 dark:bg-amber-500/5 rounded-[16px] border border-amber-100 dark:border-amber-500/10">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Package size={14}/> Stock Inicial</Label>
                    <Input name="stock_actual" type="number" value={formData.stock_actual} onChange={handleChange} placeholder="Ej. 15" required disabled={isSubmitting || successMsg} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1 text-amber-600"><AlertTriangle size={14}/> Alerta Mínima</Label>
                    <Input name="stock_minimo" type="number" value={formData.stock_minimo} onChange={handleChange} placeholder="Ej. 5" required disabled={isSubmitting || successMsg} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Imagen del Producto (URL o Archivo)</Label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input name="imagen_url" type="text" value={formData.imagen_url} onChange={handleChange} icon={ImageIcon} placeholder="URL o subir archivo..." required disabled={isSubmitting || successMsg} />
                    </div>
                    <input type="file" id="img-upload-new" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isSubmitting || successMsg} />
                    <Button type="button" variant="outline" onClick={() => document.getElementById('img-upload-new')?.click()} disabled={isSubmitting || successMsg} className="!px-3 shrink-0" title="Subir Imagen Local">
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
                  <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 resize-none" required disabled={isSubmitting || successMsg} placeholder="Detalles del producto..."></textarea>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" id="activo_tienda" name="activo_en_tienda" checked={formData.activo_en_tienda} onChange={handleChange} disabled={isSubmitting || successMsg} className="w-5 h-5 rounded border-gray-300 text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"/>
                  <label htmlFor="activo_tienda" className="text-sm font-medium text-[#0F172A] dark:text-white cursor-pointer">Mostrar en Tienda en Línea</label>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="productoForm" variant="primary" disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (successMsg ? <CheckCircle size={18} /> : "Registrar Producto")}
          </Button>
        </div>
      </div>
    </div>
  );
};