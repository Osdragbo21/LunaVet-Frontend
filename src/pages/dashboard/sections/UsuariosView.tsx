import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, Shield, ShieldAlert, ShieldCheck, 
  CheckCircle, Ban, Loader2, MoreVertical, Filter, 
  Edit2, X, Lock, User
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoUsuarioModal } from '../components/NuevoUsuarioModal';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_USUARIOS = gql`
  query GetUsuariosDirectorio {
    usuarios {
      id_usuario
      username
      activo
      rol_id
    }
  }
`;

const TOGGLE_ESTADO = gql`
  mutation ToggleEstadoUsuario($id_usuario: Int!, $activo: Boolean!) {
    toggleEstadoUsuario(id_usuario: $id_usuario, activo: $activo) {
      id_usuario
      activo
    }
  }
`;

const UPDATE_USUARIO = gql`
  mutation UpdateUsuario($input: UpdateUsuarioInput!) {
    updateUsuario(updateUsuarioInput: $input) {
      id_usuario
      username
      rol_id
      activo
    }
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface Usuario {
  id_usuario: number;
  username: string;
  activo: boolean;
  rol_id: number;
}

// ==========================================
// 3. MODAL DE EDICIÓN DE USUARIO
// ==========================================
const ModalEditarUsuario = ({ isOpen, usuario, onClose }: { isOpen: boolean, usuario: Usuario | null, onClose: () => void }) => {
  const [formData, setFormData] = useState({ password: '', rol_id: '2' });

  useEffect(() => {
    if (usuario) {
      setFormData({
        password: '', // Siempre vacío por seguridad. Solo se llena si se quiere cambiar.
        rol_id: usuario.rol_id.toString()
      });
    }
  }, [usuario]);

  const [updateUsuario, { loading, error }] = useMutation(UPDATE_USUARIO, {
    refetchQueries: ['GetUsuariosDirectorio']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    try {
      await updateUsuario({
        variables: {
          input: {
            id_usuario: usuario.id_usuario,
            // Solo enviamos la contraseña si el admin escribió una nueva
            ...(formData.password.trim() !== '' && { password_hash: formData.password }),
            rol_id: parseInt(formData.rol_id)
          }
        }
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !usuario) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Editar Usuario</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Modificando credenciales de: @{usuario.username}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6">
          <form id="editUserForm" onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm mb-4">{error.message}</div>}
            
            <div className="space-y-2">
              <Label>Nombre de Usuario</Label>
              <Input name="username" value={usuario.username} disabled icon={User} className="opacity-60 cursor-not-allowed" />
              <p className="text-[10px] text-amber-600 font-medium">El nombre de usuario no puede modificarse.</p>
            </div>

            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <Input name="password" type="text" value={formData.password} onChange={handleChange} icon={Lock} placeholder="Dejar en blanco para conservar la actual" />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Shield size={16}/> Nivel de Permisos (Rol)</Label>
              <select name="rol_id" value={formData.rol_id} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                <option value="1">Administrador (Control Total)</option>
                <option value="2">Empleado / Veterinario</option>
                <option value="3" disabled>Cliente (Registrado desde Directorio)</option>
              </select>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="editUserForm" disabled={loading} variant="primary" className="flex items-center gap-2">
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
export const UsuariosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);
  
  // ESTADOS DEL FILTRO
  const [filtroActivo, setFiltroActivo] = useState('todos');
  const [menuFiltrosAbierto, setMenuFiltrosAbierto] = useState(false);

  // ESTADO PARA EDICIÓN
  const [usuarioAEditar, setUsuarioAEditar] = useState<Usuario | null>(null);

  const { data, loading, error } = useQuery<{usuarios: Usuario[]}>(GET_USUARIOS);
  const [toggleEstado, { loading: toggling }] = useMutation(TOGGLE_ESTADO, { refetchQueries: ['GetUsuariosDirectorio'] });

  const getRolData = (rol_id: number) => {
    switch(rol_id) {
      case 1: return { nombre: 'Administrador', bg: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' };
      case 2: return { nombre: 'Empleado', bg: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' };
      case 3: return { nombre: 'Cliente', bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' };
      default: return { nombre: 'Desconocido', bg: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleSuspender = async (id: number, estadoActual: boolean) => {
    try {
      await toggleEstado({ variables: { id_usuario: id, activo: !estadoActual }});
      setMenuAbierto(null);
    } catch (e) {
      console.error(e);
    }
  };

  const usuariosFiltrados = data?.usuarios?.filter(u => {
    // 1. Buscador
    const matchSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    // 2. Filtro Activo
    let matchFilter = true;
    if (filtroActivo === 'activos') matchFilter = u.activo === true;
    if (filtroActivo === 'suspendidos') matchFilter = u.activo === false;
    if (filtroActivo === 'admins') matchFilter = u.rol_id === 1;
    if (filtroActivo === 'empleados') matchFilter = u.rol_id === 2;
    if (filtroActivo === 'clientes') matchFilter = u.rol_id === 3;

    return matchSearch && matchFilter;
  }) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Shield className="text-[#3B82F6]" size={28}/> 
            Control de Accesos y Usuarios
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Administra quién puede entrar al sistema y sus niveles de permiso.</p>
        </div>
        <Button variant="primary" className="!px-5 !py-2.5 shadow-md" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Nuevo Acceso
        </Button>
      </div>

      {/* Buscador y Botón de Filtros */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input 
            icon={Search} 
            type="text" 
            placeholder="Buscar por usuario..." 
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
              <div className="absolute right-0 top-14 w-52 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-black/5 dark:border-white/10 py-2 z-20 animate-in fade-in zoom-in-95 duration-100">
                <button onClick={() => { setFiltroActivo('todos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'todos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Todos los Usuarios</button>
                
                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>
                
                <button onClick={() => { setFiltroActivo('activos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${filtroActivo === 'activos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <ShieldCheck size={14} className={filtroActivo === 'activos' ? 'text-[#3B82F6]' : 'text-emerald-500'}/> Cuentas Activas
                </button>
                <button onClick={() => { setFiltroActivo('suspendidos'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-2 ${filtroActivo === 'suspendidos' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                  <ShieldAlert size={14} className={filtroActivo === 'suspendidos' ? 'text-[#3B82F6]' : 'text-rose-500'}/> Suspendidos
                </button>

                <div className="h-px bg-black/5 dark:bg-white/5 my-1 w-full"></div>

                <button onClick={() => { setFiltroActivo('admins'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'admins' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Administradores</button>
                <button onClick={() => { setFiltroActivo('empleados'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'empleados' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Empleados</button>
                <button onClick={() => { setFiltroActivo('clientes'); setMenuFiltrosAbierto(false); }} className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${filtroActivo === 'clientes' ? 'text-[#3B82F6] bg-blue-50 dark:bg-blue-500/10' : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5'}`}>Clientes Web</button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
      
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
          <div className="overflow-x-auto overflow-y-visible pb-24 -mb-24">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Usuario</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Nivel de Acceso</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Estado del Sistema</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Administrar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuario) => {
                    const rol = getRolData(usuario.rol_id);
                    return (
                      <tr key={usuario.id_usuario} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-bold text-[#0F172A] dark:text-white">@{usuario.username}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${rol.bg}`}>{rol.nombre}</span>
                        </td>
                        <td className="px-6 py-4">
                          {usuario.activo ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-bold"><ShieldCheck size={14}/> Activo</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-bold"><ShieldAlert size={14}/> Suspendido</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right relative">
                          <button onClick={() => setMenuAbierto(menuAbierto === usuario.id_usuario ? null : usuario.id_usuario)} className="text-[#64748B] p-1"><MoreVertical size={18} /></button>
                          
                          {menuAbierto === usuario.id_usuario && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuAbierto(null)}></div>
                              <div className="absolute right-8 top-10 w-48 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-black/5 dark:border-white/10 py-2 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                
                                {/* Botón EDITAR agregado */}
                                <button 
                                  onClick={() => { setUsuarioAEditar(usuario); setMenuAbierto(null); }} 
                                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F8FAFC] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                                >
                                  <Edit2 size={16}/> Editar Usuario
                                </button>

                                <div className="h-px bg-black/5 dark:bg-white/5 w-full my-1"></div>

                                {/* Botón Suspender/Activar */}
                                <button 
                                  onClick={() => handleSuspender(usuario.id_usuario, usuario.activo)} 
                                  disabled={toggling} 
                                  className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${usuario.activo ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                >
                                  {usuario.activo ? <Ban size={16}/> : <CheckCircle size={16}/>}
                                  {usuario.activo ? 'Suspender Acceso' : 'Activar Acceso'}
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
                    <td colSpan={4} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                      No se encontraron usuarios con esos filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Renderizado de Modales */}
      <NuevoUsuarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ModalEditarUsuario isOpen={!!usuarioAEditar} usuario={usuarioAEditar} onClose={() => setUsuarioAEditar(null)} />
    </div>
  );
};