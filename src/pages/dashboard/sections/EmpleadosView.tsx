import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, MoreVertical, Briefcase, Phone, 
  ShieldCheck, ShieldAlert, Loader2, Edit2, Ban, CheckCircle, 
  User, Calendar as CalendarIcon, Shield, X, Mail 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoEmpleadoModal } from '../components/NuevoEmpleadoModal';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_EMPLEADOS_DIRECTORIO = gql`
  query GetEmpleadosDirectorio {
    empleados {
      id_empleado
      nombre
      apellido_paterno
      apellido_materno
      email_empleado
      puesto
      telefono
      fecha_contratacion
      usuario {
        id_usuario
        username
        activo
        rol_id
      }
    }
  }
`;

// Mutación actualizada con la estructura exacta del Backend
const UPDATE_EMPLEADO = gql`
  mutation UpdateEmpleado($input: UpdateEmpleadoInput!) {
    updateEmpleado(updateEmpleadoInput: $input) {
      id_empleado
      nombre
      apellido_paterno
      apellido_materno
      email_empleado
      puesto
      telefono
      usuario {
        username
      }
    }
  }
`;

const TOGGLE_ESTADO_USUARIO = gql`
  mutation ToggleEstadoUsuario($id_usuario: Int!, $activo: Boolean!) {
    toggleEstadoUsuario(id_usuario: $id_usuario, activo: $activo) {
      id_usuario
      activo
    }
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface UsuarioEmpleado {
  id_usuario: number;
  username: string;
  activo: boolean;
  rol_id: number;
}

interface Empleado {
  id_empleado: number;
  nombre: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email_empleado?: string;
  puesto: string;
  telefono: string;
  fecha_contratacion: string;
  usuario: UsuarioEmpleado | null; 
}

// ==========================================
// 3. MODALES AUXILIARES
// ==========================================
const ModalEditarEmpleado = ({ isOpen, empleado, onClose }: { isOpen: boolean, empleado: Empleado | null, onClose: () => void }) => {
  const [formData, setFormData] = useState({ 
    nombre: '', 
    apellido_paterno: '',
    apellido_materno: '',
    email_empleado: '',
    puesto: '', 
    telefono: '' 
  });

  useEffect(() => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre || '',
        apellido_paterno: empleado.apellido_paterno || '',
        apellido_materno: empleado.apellido_materno || '',
        email_empleado: empleado.email_empleado || '',
        puesto: empleado.puesto || '',
        telefono: empleado.telefono || ''
      });
    }
  }, [empleado]);

  const [updateEmpleado, { loading, error }] = useMutation(UPDATE_EMPLEADO, {
    refetchQueries: ['GetEmpleadosDirectorio']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleado) return;
    try {
      await updateEmpleado({
        variables: { 
          input: { 
            id_empleado: empleado.id_empleado,
            nombre: formData.nombre.trim(),
            apellido_paterno: formData.apellido_paterno.trim(),
            apellido_materno: formData.apellido_materno.trim(),
            email_empleado: formData.email_empleado.trim(),
            puesto: formData.puesto,
            telefono: formData.telefono.trim()
          } 
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !empleado) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Editar Trabajador</h2>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500"><X size={20} /></button>
        </div>
        
        <div className="p-6">
          <form id="editEmpleadoForm" onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm mb-4">{error.message}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Correo Electrónico</Label>
                <Input name="email_empleado" type="email" value={formData.email_empleado} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="telefono" value={formData.telefono} onChange={handleChange} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Puesto o Especialidad</Label>
              <select name="puesto" value={formData.puesto} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                <option value="Veterinario Titular">Veterinario Titular</option>
                <option value="Veterinario Auxiliar">Veterinario Auxiliar</option>
                <option value="Estilista Canino/Felino">Estilista Canino/Felino</option>
                <option value="Recepcionista">Recepcionista</option>
                <option value="Gerente">Gerente</option>
                <option value="Personal de Limpieza">Personal de Limpieza</option>
              </select>
            </div>
            
            <p className="text-xs text-[#64748B] mt-2">Para cambiar la contraseña o rol, ve al Control de Usuarios.</p>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-black/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="editEmpleadoForm" variant="primary" disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. VISTA PRINCIPAL
// ==========================================
export const EmpleadosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);
  
  const [isModalNewOpen, setIsModalNewOpen] = useState(false);
  const [empleadoAEditar, setEmpleadoAEditar] = useState<Empleado | null>(null);

  const { data, loading, error } = useQuery<{empleados: Empleado[]}>(GET_EMPLEADOS_DIRECTORIO);
  const [toggleEstado, { loading: toggling }] = useMutation(TOGGLE_ESTADO_USUARIO, { refetchQueries: ['GetEmpleadosDirectorio'] });

  const handleToggleEstado = async (id_usuario: number, estadoActual: boolean) => {
    try {
      await toggleEstado({ variables: { id_usuario, activo: !estadoActual } });
      setMenuAbierto(null);
    } catch (err) {
      console.error(err);
    }
  };

  const getAvatarColor = (nombre: string) => {
    const colors = ['bg-indigo-100 text-indigo-600', 'bg-cyan-100 text-cyan-600', 'bg-orange-100 text-orange-600', 'bg-fuchsia-100 text-fuchsia-600'];
    if (!nombre) return colors[0];
    return colors[nombre.charCodeAt(0) % colors.length];
  };

  const empleadosFiltrados = data?.empleados.filter((emp) => {
    const busqueda = searchTerm.toLowerCase();
    
    const nombreCompleto = `${emp.nombre} ${emp.apellido_paterno || ''}`.toLowerCase();

    const coincideBusqueda = 
      nombreCompleto.includes(busqueda) ||
      emp.puesto?.toLowerCase().includes(busqueda) ||
      (emp.usuario?.username?.toLowerCase().includes(busqueda) ?? false);
      
    let coincideFiltro = true;
    if (filtroActivo === 'activos') coincideFiltro = emp.usuario?.activo === true;
    if (filtroActivo === 'suspendidos') coincideFiltro = emp.usuario?.activo === false;
    if (filtroActivo === 'admins') coincideFiltro = emp.usuario?.rol_id === 1;

    return coincideBusqueda && coincideFiltro;
  }) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Briefcase className="text-[#3B82F6]" size={28}/> 
            Directorio de Trabajadores
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Gestiona a los empleados, veterinarios y staff de la clínica.</p>
        </div>
        <Button variant="primary" className="!px-5 !py-2.5 shadow-md" onClick={() => setIsModalNewOpen(true)}>
          <Plus size={18} /> Nuevo Empleado
        </Button>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input icon={Search} type="text" placeholder="Buscar por nombre, puesto o usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#F8FAFC] dark:bg-[#0F172A]" />
        </div>
        
        <div className="relative">
          <Button variant="outline" className="!px-4 !py-2.5 text-[#64748B] dark:text-[#94A3B8] relative w-full sm:w-auto" onClick={() => setMenuFiltrosAbierto(!menuFiltrosAbierto)}>
            <Filter size={18} /> Filtros
            {filtroActivo !== 'todos' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#3B82F6]"></span>}
          </Button>
          
          {menuFiltrosAbierto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuFiltrosAbierto(false)}></div>
              <div className="absolute right-0 top-14 w-52 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-lg border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setFiltroActivo('todos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium ${filtroActivo === 'todos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>Todos los Trabajadores</button>
                <div className="h-px bg-black/5 dark:bg-white/5 my-1"></div>
                <button onClick={() => { setFiltroActivo('activos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${filtroActivo === 'activos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>
                  <ShieldCheck size={14} className="text-emerald-500"/> Activos
                </button>
                <button onClick={() => { setFiltroActivo('suspendidos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${filtroActivo === 'suspendidos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>
                  <ShieldAlert size={14} className="text-rose-500"/> Suspendidos
                </button>
                <div className="h-px bg-black/5 dark:bg-white/5 my-1"></div>
                <button onClick={() => { setFiltroActivo('admins'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${filtroActivo === 'admins' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC]'}`}>
                  <Shield size={14} className="text-purple-500"/> Administradores
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-500 text-rose-600 dark:text-rose-400 p-6 rounded-xl shadow-sm mb-2">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert size={24} />
            <h3 className="text-lg font-bold">Error al cargar el directorio de trabajadores</h3>
          </div>
          <p className="font-medium text-sm">{error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
          <div className="overflow-x-auto overflow-y-visible pb-24 -mb-24">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Trabajador / Puesto</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Contacto</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Credenciales Web</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {empleadosFiltrados.length > 0 ? (
                  empleadosFiltrados.map((empleado) => (
                    <tr key={empleado.id_empleado} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor(empleado.nombre)}`}>
                            {empleado.nombre?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#0F172A] dark:text-white text-base">
                              {empleado.nombre} {empleado.apellido_paterno}
                            </p>
                            <p className="text-xs font-medium text-[#3B82F6]">{empleado.puesto}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-2 text-[#0F172A] dark:text-white font-medium">
                            <Phone size={14} className="text-[#64748B]" /> {empleado.telefono || 'No registrado'}
                          </span>
                          <span className="flex items-center gap-2 text-[#0F172A] dark:text-white font-medium">
                            <Mail size={14} className="text-[#64748B]" /> {empleado.email_empleado || 'Sin correo'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {empleado.usuario ? (
                            <>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-[#0F172A] dark:text-white">@{empleado.usuario.username}</span>
                                {empleado.usuario.rol_id === 1 && (
                                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">Admin</span>
                                )}
                              </div>
                              {empleado.usuario.activo ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                                  <ShieldCheck size={12} /> Cuenta Activa
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold">
                                  <ShieldAlert size={12} /> Suspendida
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs font-medium text-[#64748B] italic">Sin credenciales web</span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right relative">
                        <button 
                          onClick={() => setMenuAbierto(menuAbierto === empleado.id_empleado ? null : empleado.id_empleado)}
                          className="text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors p-1"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {menuAbierto === empleado.id_empleado && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                            <div className="absolute right-8 top-10 w-48 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                              
                              <button 
                                onClick={() => { setEmpleadoAEditar(empleado); setMenuAbierto(null); }}
                                className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                              >
                                <Edit2 size={16} /> Editar Datos
                              </button>

                              {empleado.usuario && (
                                <>
                                  <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                                  <button 
                                    onClick={() => handleToggleEstado(empleado.usuario!.id_usuario, empleado.usuario!.activo)}
                                    disabled={toggling}
                                    className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${empleado.usuario.activo ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                  >
                                    {empleado.usuario.activo ? <Ban size={16} /> : <CheckCircle size={16} />}
                                    {empleado.usuario.activo ? 'Suspender Acceso' : 'Activar Acceso'}
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No se encontraron trabajadores que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <NuevoEmpleadoModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
      <ModalEditarEmpleado isOpen={!!empleadoAEditar} empleado={empleadoAEditar} onClose={() => setEmpleadoAEditar(null)} />
    </div>
  );
};