import React, { useState } from 'react';
import { X, User, Lock, Shield, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const CREATE_USUARIO = gql`
  mutation CreateUsuario($input: CreateUsuarioInput!) {
    createUsuario(createUsuarioInput: $input) {
      id_usuario
      username
      rol_id
      activo
    }
  }
`;

interface NuevoUsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoUsuarioModal: React.FC<NuevoUsuarioModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rol_id: '2' // Por defecto: Empleado
  });

  const [createUsuario, { loading, error }] = useMutation(CREATE_USUARIO, {
    refetchQueries: ['GetUsuariosDirectorio']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUsuario({
        variables: {
          input: {
            username: formData.username.trim(),
            password_hash: formData.password, // En tu backend se debe encriptar
            rol_id: parseInt(formData.rol_id)
          }
        }
      });
      setFormData({ username: '', password: '', rol_id: '2' });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Nuevo Acceso</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Crea credenciales para tu equipo.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6">
          <form id="userForm" onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm mb-4">{error.message}</div>}
            
            <div className="space-y-2">
              <Label>Nombre de Usuario</Label>
              <Input name="username" value={formData.username} onChange={handleChange} icon={User} required />
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <Input name="password" type="text" value={formData.password} onChange={handleChange} icon={Lock} placeholder="Contraseña segura" required />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Shield size={16}/> Nivel de Permisos (Rol)</Label>
              <select name="rol_id" value={formData.rol_id} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none">
                <option value="1">Administrador (Control Total)</option>
                <option value="2">Empleado / Veterinario</option>
                <option value="3" disabled>Cliente (Registrar desde Directorio)</option>
              </select>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="userForm" disabled={loading} variant="primary" className="flex items-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Crear Usuario"}
          </Button>
        </div>

      </div>
    </div>
  );
};