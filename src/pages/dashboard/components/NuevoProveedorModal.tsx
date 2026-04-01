import React, { useState } from 'react';
import { X, Truck, User, Phone, Mail, MapPin, Loader2, CheckCircle, Building } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Mutación exacta proporcionada por el Backend
const CREATE_PROVEEDOR = gql`
  mutation CreateProveedor($input: CreateProveedorInput!) {
    createProveedor(createInput: $input) {
      id_proveedor
      nombre_empresa
      contacto_nombre
    }
  }
`;

interface NuevoProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NuevoProveedorModal: React.FC<NuevoProveedorModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombre_empresa: '',
    contacto_nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  const client = useApolloClient();
  const [createProveedor] = useMutation(CREATE_PROVEEDOR);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await createProveedor({
        variables: {
          input: {
            nombre_empresa: formData.nombre_empresa.trim(),
            contacto_nombre: formData.contacto_nombre.trim(),
            telefono: formData.telefono.trim(),
            email: formData.email.trim(),
            direccion: formData.direccion.trim()
          }
        }
      });
      
      // Forzamos recarga de la tabla y del dropdown de inventario
      await client.refetchQueries({ include: "active" });

      setSuccessMsg(true);
      setTimeout(() => {
        setFormData({ nombre_empresa: '', contacto_nombre: '', telefono: '', email: '', direccion: '' });
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error al registrar el proveedor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2"><Truck size={24} className="text-[#3B82F6]"/> Registrar Proveedor</h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Añade una nueva empresa distribuidora al directorio.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="proveedorForm" onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium">{errorMsg}</div>}
            {successMsg && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2"><CheckCircle size={20} /> ¡Proveedor registrado con éxito!</div>}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Empresa</Label>
                <Input name="nombre_empresa" value={formData.nombre_empresa} onChange={handleChange} icon={Building} placeholder="Ej. Distribuidora Veterinaria Sur" required disabled={isSubmitting || successMsg} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Agente / Contacto</Label>
                  <Input name="contacto_nombre" value={formData.contacto_nombre} onChange={handleChange} icon={User} placeholder="Ej. Carlos Mendoza" required disabled={isSubmitting || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label>Teléfono de Contacto</Label>
                  <Input name="telefono" type="tel" value={formData.telefono} onChange={handleChange} icon={Phone} placeholder="Ej. 555 999 8888" required disabled={isSubmitting || successMsg} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Correo Electrónico</Label>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} placeholder="Ej. ventas@vetsur.com" required disabled={isSubmitting || successMsg} />
              </div>

              <div className="space-y-2">
                <Label>Dirección Fiscal / Bodega</Label>
                <div className="relative">
                  <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-[#64748B]">
                    <MapPin size={20} />
                  </div>
                  <Textarea name="direccion" value={formData.direccion} onChange={handleChange} rows={2} placeholder="Av. Central 404, Ciudad..." required className="pl-11" disabled={isSubmitting || successMsg} />
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="proveedorForm" variant="primary" disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (successMsg ? <CheckCircle size={18} /> : "Guardar Proveedor")}
          </Button>
        </div>
      </div>
    </div>
  );
};