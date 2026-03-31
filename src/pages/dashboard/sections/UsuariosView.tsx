import React, { useState } from 'react';
import { Search, Plus, Shield, ShieldAlert, ShieldCheck, CheckCircle, Ban, Loader2, MoreVertical } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoUsuarioModal } from '../components/NuevoUsuarioModal';

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

interface Usuario {
  id_usuario: number;
  username: string;
  activo: boolean;
  rol_id: number;
}

export const UsuariosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState<number | null>(null);

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

  const usuariosFiltrados = data?.usuarios?.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase())) || [];

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

      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm">
        <Input icon={Search} type="text" placeholder="Buscar por usuario..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {loading && <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
      
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-visible">
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
              {usuariosFiltrados.map((usuario) => {
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
                          <div className="absolute right-8 top-10 w-44 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-black/5 dark:border-white/10 py-2 z-20 overflow-hidden">
                            <button onClick={() => handleSuspender(usuario.id_usuario, usuario.activo)} disabled={toggling} className={`w-full text-left px-4 py-2.5 text-sm font-medium flex items-center gap-2 ${usuario.activo ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                              {usuario.activo ? <Ban size={16}/> : <CheckCircle size={16}/>}
                              {usuario.activo ? 'Suspender Acceso' : 'Activar Acceso'}
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <NuevoUsuarioModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};