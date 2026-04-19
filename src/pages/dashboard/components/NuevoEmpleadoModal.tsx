import React, { useState } from 'react';
import { X, User, Lock, Phone, Briefcase, Loader2, ShieldCheck, Calendar as CalendarIcon, Shield, Mail, CheckCircle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useMutation, useApolloClient } from '@apollo/client/react';
// REGLA ESTRICTA APLICADA:
import { gql } from '@apollo/client';

const REGISTER_NEW_EMPLEADO = gql`
  mutation RegisterNewEmpleado($input: RegisterEmpleadoInput!) {
    registerNewEmpleado(input: $input) {
      id_empleado
      nombre
      puesto
      usuario {
        username
        rol {
          nombre
        }
      }
    }
  }
`;

interface NuevoEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoEmpleadoModal: React.FC<NuevoEmpleadoModalProps> = ({ isOpen, onClose }) => {
  const client = useApolloClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. ADAPTACIÓN AL PAYLOAD DEL BACKEND
  const [formData, setFormData] = useState({
    username: '',
    password_hash: '', // Requerido por el backend
    rol_id: '2', // Por defecto 2 (Empleado Operativo)
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    email_empleado: '',
    puesto: '',
    fecha_contratacion: new Date().toISOString().split('T')[0]
  });

  const [registerNewEmpleado] = useMutation(REGISTER_NEW_EMPLEADO);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await registerNewEmpleado({
        variables: {
          input: {
            username: formData.username.trim(),
            password_hash: formData.password_hash.trim(),
            rol_id: Number(formData.rol_id), // ¡REGLA DE ORO! Conversión estricta a número
            nombre: formData.nombre.trim(),
            apellido_paterno: formData.apellido_paterno.trim(),
            apellido_materno: formData.apellido_materno.trim(),
            telefono: formData.telefono.trim(),
            email_empleado: formData.email_empleado.trim(),
            puesto: formData.puesto.trim(),
            fecha_contratacion: new Date(formData.fecha_contratacion).toISOString()
          }
        }
      });

      await client.refetchQueries({ include: "active" });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setFormData({
          username: '', password_hash: '', rol_id: '2', nombre: '',
          apellido_paterno: '', apellido_materno: '', telefono: '',
          email_empleado: '', puesto: '', fecha_contratacion: new Date().toISOString().split('T')[0]
        });
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al registrar el empleado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-black/5 dark:border-white/5">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <ShieldCheck size={24} className="text-[#3B82F6]"/> Alta de Personal
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Registra un nuevo trabajador alineado a las reglas del sistema.</p>
          </div>
          <button onClick={onClose} disabled={isSubmitting || successMsg} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="empleadoForm" onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm border border-rose-200">{errorMsg}</div>
            )}
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle size={20} /> ¡Empleado registrado correctamente!
              </div>
            )}

            {/* Credenciales y Rol */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 rounded-xl">
              <div className="space-y-2">
                <Label>Usuario</Label>
                <Input name="username" value={formData.username} onChange={handleChange} placeholder="Ej. juan.vet" icon={User} required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label>Contraseña</Label>
                <Input type="password" name="password_hash" value={formData.password_hash} onChange={handleChange} placeholder="••••••••" icon={Lock} required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1"><Shield size={14} className="text-[#3B82F6]"/> Nivel de Acceso</Label>
                <select 
                  name="rol_id" 
                  value={formData.rol_id} 
                  onChange={handleChange} 
                  required 
                  disabled={isSubmitting || successMsg} 
                  className="w-full px-4 py-[11px] bg-white dark:bg-[#1E293B] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none text-sm"
                >
                  <option value="2">2 - Empleado / Veterinario</option>
                  <option value="1">1 - Administrador</option>
                </select>
              </div>
            </div>

            {/* Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nombre(s)</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Juan" required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Paterno</Label>
                <Input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} placeholder="Pérez" required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label>Apellido Materno</Label>
                <Input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} placeholder="García" disabled={isSubmitting || successMsg} />
              </div>
            </div>

            {/* Contacto y Contratación */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Correo</Label>
                <Input type="email" name="email_empleado" value={formData.email_empleado} onChange={handleChange} icon={Mail} placeholder="juan@lunavet.com" required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input name="telefono" value={formData.telefono} onChange={handleChange} icon={Phone} placeholder="10 dígitos" required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label>Puesto</Label>
                <Input name="puesto" value={formData.puesto} onChange={handleChange} icon={Briefcase} placeholder="Cirujano" required disabled={isSubmitting || successMsg} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><CalendarIcon size={14}/> Fecha de Ingreso</Label>
                <input 
                  type="date" 
                  name="fecha_contratacion"
                  value={formData.fecha_contratacion}
                  onChange={handleChange}
                  required
                  disabled={isSubmitting || successMsg}
                  className="w-full px-4 py-[11px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer dark:[color-scheme:dark] disabled:opacity-50 text-sm" 
                />
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="empleadoForm" disabled={isSubmitting || successMsg} variant="primary" className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Crear Empleado"}
          </Button>
        </div>
      </div>
    </div>
  );
};