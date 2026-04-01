import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Truck, Edit2, AlertTriangle, Loader2, X, 
  MoreVertical, Trash2, Building, Phone, Mail, MapPin, User, Filter 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoProveedorModal } from '../components/NuevoProveedorModal';

// ==========================================
// 1. QUERIES Y MUTACIONES DEL BACKEND
// ==========================================
const GET_PROVEEDORES = gql`
  query GetProveedores {
    proveedores {
      id_proveedor
      nombre_empresa
      contacto_nombre
      telefono
      email
      direccion
    }
  }
`;

const UPDATE_PROVEEDOR = gql`
  mutation UpdateProveedor($input: UpdateProveedorInput!) {
    updateProveedor(updateInput: $input) {
      id_proveedor
      nombre_empresa
      contacto_nombre
      telefono
      email
      direccion
    }
  }
`;

const REMOVE_PROVEEDOR = gql`
  mutation RemoveProveedor($id: Int!) {
    removeProveedor(id: $id)
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface Proveedor {
  id_proveedor: number;
  nombre_empresa: string;
  contacto_nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}

// ==========================================
// 3. MODALES AUXILIARES
// ==========================================

const ModalEditarProveedor = ({ isOpen, proveedor, onClose }: { isOpen: boolean, proveedor: Proveedor | null, onClose: () => void }) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '', contacto_nombre: '', telefono: '', email: '', direccion: ''
  });

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre_empresa: proveedor.nombre_empresa || '',
        contacto_nombre: proveedor.contacto_nombre || '',
        telefono: proveedor.telefono || '',
        email: proveedor.email || '',
        direccion: proveedor.direccion || ''
      });
    }
  }, [proveedor]);

  const [updateProveedor, { loading, error }] = useMutation(UPDATE_PROVEEDOR, {
    refetchQueries: ['GetProveedores', 'GetProveedoresDropdown']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedor) return;
    try {
      await updateProveedor({
        variables: {
          input: {
            id_proveedor: proveedor.id_proveedor,
            nombre_empresa: formData.nombre_empresa.trim(),
            contacto_nombre: formData.contacto_nombre.trim(),
            telefono: formData.telefono.trim(),
            email: formData.email.trim(),
            direccion: formData.direccion.trim()
          }
        }
      });
      onClose();
    } catch (err) { console.error(err); }
  };

  if (!isOpen || !proveedor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Edit2 size={20} className="text-[#3B82F6]"/> Editar Proveedor</h2>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500"><X size={20} /></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <form id="editProvForm" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">{error.message}</div>}
            
            <div className="space-y-2">
              <Label>Nombre de la Empresa</Label>
              <Input name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre del Contacto</Label>
                <Input name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Dirección</Label>
              <Textarea name="direccion" value={formData.direccion} onChange={handleChange} rows={2} required />
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="editProvForm" variant="primary" disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 size={16} className="animate-spin"/> : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const ModalEliminarProveedor = ({ isOpen, proveedor, onClose }: { isOpen: boolean, proveedor: Proveedor | null, onClose: () => void }) => {
  const [deleteProveedor, { loading, error }] = useMutation(REMOVE_PROVEEDOR, {
    refetchQueries: ['GetProveedores', 'GetProveedoresDropdown']
  });

  const handleDelete = async () => {
    if (!proveedor) return;
    try {
      await deleteProveedor({ variables: { id: proveedor.id_proveedor } });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !proveedor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4 shadow-sm">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar Proveedor?</h2>
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-4 font-medium">
          {proveedor.nombre_empresa}
        </p>
        
        {error ? (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-medium mb-6 text-left">
            <span className="font-bold block mb-1">Operación Denegada:</span>
            {error.message}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-6">
            Esta acción lo borrará del directorio permanentemente. Solo es posible eliminarlo si no tiene productos asignados en el inventario.
          </p>
        )}

        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">
            {error ? "Entendido" : "Cancelar"}
          </Button>
          {!error && (
            <Button onClick={handleDelete} disabled={loading} className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sí, Eliminar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. VISTA PRINCIPAL
// ==========================================
export const ProveedoresView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  
  // ESTADOS DEL FILTRO
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  
  const [isModalNewOpen, setIsModalNewOpen] = useState(false);
  const [proveedorAEditar, setProveedorAEditar] = useState<Proveedor | null>(null);
  const [proveedorAEliminar, setProveedorAEliminar] = useState<Proveedor | null>(null);

  const { data, loading, error } = useQuery<{proveedores: Proveedor[]}>(GET_PROVEEDORES);

  const getAvatarColor = (nombre: string) => {
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-cyan-100 text-cyan-600', 'bg-orange-100 text-orange-600', 'bg-fuchsia-100 text-fuchsia-600'];
    if (!nombre) return colors[0];
    return colors[nombre.charCodeAt(0) % colors.length];
  };

  // Lógica de Filtrado y Ordenamiento
  let proveedoresFiltrados = data?.proveedores.filter((prov) => {
    const busqueda = searchTerm.toLowerCase();
    return prov.nombre_empresa.toLowerCase().includes(busqueda) || 
           prov.contacto_nombre.toLowerCase().includes(busqueda) ||
           prov.telefono.includes(busqueda);
  }) || [];

  if (filtroActivo === 'az') {
    proveedoresFiltrados = [...proveedoresFiltrados].sort((a, b) => a.nombre_empresa.localeCompare(b.nombre_empresa));
  } else if (filtroActivo === 'za') {
    proveedoresFiltrados = [...proveedoresFiltrados].sort((a, b) => b.nombre_empresa.localeCompare(a.nombre_empresa));
  }

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Truck className="text-[#3B82F6]" size={28}/> 
            Directorio de Proveedores
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Gestiona las empresas que surten productos a la clínica.</p>
        </div>
        <Button variant="primary" className="!px-5 !py-2.5 shadow-md" onClick={() => setIsModalNewOpen(true)}>
          <Plus size={18} /> Nuevo Proveedor
        </Button>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            icon={Search} 
            type="text" 
            placeholder="Buscar por empresa, contacto o teléfono..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" 
          />
        </div>
        
        {/* Menú de Filtros Funcional */}
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
              <div className="absolute right-0 top-14 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setFiltroActivo('todos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'todos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Predeterminado</button>
                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                <button onClick={() => { setFiltroActivo('az'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'az' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Orden A-Z</button>
                <button onClick={() => { setFiltroActivo('za'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'za' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Orden Z-A</button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
      
      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={24} />
            <h3 className="text-lg font-bold">Error de conexión</h3>
          </div>
          <p className="font-medium text-sm">{error.message}</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
          <div className="overflow-x-auto pb-24 -mb-24">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Empresa</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Contacto</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Detalles de Localización</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {proveedoresFiltrados.length > 0 ? (
                  proveedoresFiltrados.map((prov) => (
                    <tr key={prov.id_proveedor} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border border-black/5 dark:border-white/5 ${getAvatarColor(prov.nombre_empresa)}`}>
                            {prov.nombre_empresa.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A] dark:text-white text-base">{prov.nombre_empresa}</p>
                            <p className="text-xs font-medium text-[#3B82F6]">ID: {prov.id_proveedor}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-[#0F172A] dark:text-white font-bold">
                            <User size={14} className="text-[#64748B]" /> {prov.contacto_nombre}
                          </span>
                          <span className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8]">
                            <Phone size={14} /> {prov.telefono}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-[#0F172A] dark:text-white">
                            <Mail size={14} className="text-[#64748B]" /> {prov.email}
                          </span>
                          <span className="flex items-center gap-2 text-[#64748B] dark:text-[#94A3B8] max-w-[200px] truncate">
                            <MapPin size={14} className="shrink-0" /> {prov.direccion}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setMenuAbierto(menuAbierto === prov.id_proveedor ? null : prov.id_proveedor)}
                          className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuAbierto === prov.id_proveedor && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                            <div className="absolute right-8 top-10 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                              
                              <button 
                                onClick={() => { setProveedorAEditar(prov); setMenuAbierto(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                              >
                                <Edit2 size={16} /> Editar Datos
                              </button>

                              <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                              <button 
                                onClick={() => { setProveedorAEliminar(prov); setMenuAbierto(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2"
                              >
                                <Trash2 size={16} /> Eliminar
                              </button>
                              
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">No se encontraron proveedores.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RENDERIZADO DE MODALES */}
      <NuevoProveedorModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
      <ModalEditarProveedor isOpen={!!proveedorAEditar} proveedor={proveedorAEditar} onClose={() => setProveedorAEditar(null)} />
      <ModalEliminarProveedor isOpen={!!proveedorAEliminar} proveedor={proveedorAEliminar} onClose={() => setProveedorAEliminar(null)} />
      
    </div>
  );
};