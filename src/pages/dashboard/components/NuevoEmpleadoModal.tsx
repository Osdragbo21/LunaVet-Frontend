import React, { useState } from 'react';
import { X, User, Lock, Phone, Briefcase, Loader2, ShieldCheck, Calendar as CalendarIcon, Shield, Mail, CheckCircle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ¡NUEVA SÚPER-MUTACIÓN DEL BACKEND! 
// Todo en un solo paso (Credenciales + Perfil de RH)
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

// ==========================================
// INTERFACES PARA TYPESCRIPT
// ==========================================
interface RegisterNewEmpleadoResponse {
  registerNewEmpleado: {
    id_empleado: number;
    nombre: string;
    puesto: string;
    usuario: {
      username: string;
      rol: {
        nombre: string;
      };
    };
  };
}

interface NuevoEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoEmpleadoModal: React.FC<NuevoEmpleadoModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    username: '',
    password_hash: '',
    rol_id: '2', // 2 = Empleado, 1 = Admin
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    email_empleado: '',
    puesto: 'Veterinario Titular',
    telefono: '',
    fecha_contratacion: new Date().toISOString().split('T')[0]
  });

  const client = useApolloClient();
  
  // Inyectamos la nueva mutación
  const [registerNewEmpleado] = useMutation<RegisterNewEmpleadoResponse>(REGISTER_NEW_EMPLEADO);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setIsSubmitting(true);

    try {
      // 🚀 EJECUCIÓN DIRECTA EN UN SOLO PASO
      await registerNewEmpleado({
        variables: {
          input: {
            username: formData.username.trim(),
            password_hash: formData.password_hash,
            rol_id: parseInt(formData.rol_id),
            nombre: formData.nombre.trim(),
            apellido_paterno: formData.apellido_paterno.trim(),
            apellido_materno: formData.apellido_materno.trim(),
            telefono: formData.telefono.trim(),
            email_empleado: formData.email_empleado.trim(),
            puesto: formData.puesto,
            fecha_contratacion: new Date(formData.fecha_contratacion).toISOString()
          }
        }
      });
      
      // Forzamos la recarga de las tablas de fondo
      await client.refetchQueries({
        include: "active",
      });

      // Mostramos el mensaje de éxito y cerramos
      setSuccessMsg(true);
      setTimeout(() => {
        setFormData({
          username: '', password_hash: '', rol_id: '2', 
          nombre: '', apellido_paterno: '', apellido_materno: '', email_empleado: '',
          puesto: 'Veterinario Titular', telefono: '', fecha_contratacion: new Date().toISOString().split('T')[0]
        });
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("Error al registrar empleado:", err);
      if (err.message.includes('llave duplicada') || err.message.includes('unique constraint') || err.message.includes('UQ_')) {
        setGeneralError("El nombre de usuario o correo ya está en uso. Intenta con otro.");
      } else {
        setGeneralError(err.message || "Ocurrió un error al registrar al trabajador.");
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
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">Registrar Nuevo Trabajador</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Crea su perfil de staff y sus accesos al sistema.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="empleadoForm" onSubmit={handleSubmit} className="space-y-8">
            
            {generalError && (
              <div className="p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-lg border border-rose-200">
                <Shield size={16} className="inline mr-2" /> {generalError}
              </div>
            )}

            {/* Mensaje de Éxito */}
            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-emerald-200 animate-in zoom-in duration-300">
                <CheckCircle size={20} /> ¡Trabajador registrado y enlazado con éxito!
              </div>
            )}

            {/* SECCIÓN 1: Credenciales y Permisos */}
            <div className="p-5 bg-blue-50/50 dark:bg-blue-500/5 rounded-[20px] border border-blue-100 dark:border-blue-500/10 space-y-4">
              <div className="flex items-center gap-2 text-[#3B82F6] font-bold mb-2">
                <ShieldCheck size={20} />
                <h3>Credenciales y Nivel de Acceso</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Input name="username" value={formData.username} onChange={handleChange} icon={User} placeholder="Ej. juan.vet" required className="bg-white dark:bg-[#0F172A]" disabled={isSubmitting || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label>Contraseña Temporal</Label>
                  <Input name="password_hash" type="text" value={formData.password_hash} onChange={handleChange} icon={Lock} placeholder="Contraseña inicial" required className="bg-white dark:bg-[#0F172A]" disabled={isSubmitting || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1"><Shield size={14}/> Permisos</Label>
                  <select name="rol_id" value={formData.rol_id} onChange={handleChange} disabled={isSubmitting || successMsg} className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none disabled:opacity-50">
                    <option value="2">Staff / Empleado</option>
                    <option value="1">Administrador</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: Datos de Recursos Humanos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[#0F172A] dark:text-white font-bold mb-2">
                <Briefcase size={20} className="text-[#64748B]" />
                <h3>Información del Trabajador</h3>
              </div>

              {/* Fila de Nombres */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Nombre(s)</Label>
                  <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={User} placeholder="Ej. Juan Carlos" required disabled={isSubmitting || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label>Apellido Paterno</Label>
                  <Input name="apellido_paterno" value={formData.apellido_paterno} onChange={handleChange} required disabled={isSubmitting || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label>Apellido Materno</Label>
                  <Input name="apellido_materno" value={formData.apellido_materno} onChange={handleChange} required disabled={isSubmitting || successMsg} />
                </div>
              </div>

              {/* Fila de Contacto y Trabajo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input name="email_empleado" type="email" value={formData.email_empleado} onChange={handleChange} icon={Mail} placeholder="correo@ejemplo.com" required disabled={isSubmitting || successMsg} />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono de Contacto</Label>
                  <Input name="telefono" type="tel" value={formData.telefono} onChange={handleChange} icon={Phone} placeholder="Ej. 555 123 4567" required disabled={isSubmitting || successMsg} />
                </div>

                <div className="space-y-2">
                  <Label>Puesto o Especialidad</Label>
                  <select name="puesto" value={formData.puesto} onChange={handleChange} disabled={isSubmitting || successMsg} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 appearance-none disabled:opacity-50">
                    <option value="Veterinario Titular">Veterinario Titular</option>
                    <option value="Veterinario Auxiliar">Veterinario Auxiliar</option>
                    <option value="Estilista Canino/Felino">Estilista Canino/Felino</option>
                    <option value="Recepcionista">Recepcionista</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Personal de Limpieza">Personal de Limpieza</option>
                  </select>
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
                    className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer dark:[color-scheme:dark] disabled:opacity-50" 
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="empleadoForm" disabled={isSubmitting || successMsg} variant="primary" className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (successMsg ? <CheckCircle size={18} /> : "Registrar Trabajador")}
          </Button>
        </div>

      </div>
    </div>
  );
};