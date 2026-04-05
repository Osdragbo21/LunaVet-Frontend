import React, { useState, useEffect } from 'react';
import { X, Award, DollarSign, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const CREATE_SERVICIO = gql`
  mutation CreateServicio($input: CreateServicioInput!) {
    createServicio(createInput: $input) {
      id_servicio
      nombre_servicio
    }
  }
`;

const UPDATE_SERVICIO = gql`
  mutation UpdateServicio($input: UpdateServicioInput!) {
    updateServicio(updateInput: $input) {
      id_servicio
      nombre_servicio
      descripcion
      costo_base
    }
  }
`;

interface Servicio {
  id_servicio: number;
  nombre_servicio: string;
  descripcion: string;
  costo_base: number;
}

interface NuevoServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicioAEditar?: Servicio | null;
}

export const NuevoServicioModal: React.FC<NuevoServicioModalProps> = ({ isOpen, onClose, servicioAEditar }) => {
  const [formData, setFormData] = useState({
    nombre_servicio: '',
    descripcion: '',
    costo_base: ''
  });

  const client = useApolloClient();
  const [createServicio] = useMutation(CREATE_SERVICIO);
  const [updateServicio] = useMutation(UPDATE_SERVICIO);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const isEditing = !!servicioAEditar;

  useEffect(() => {
    if (isOpen && servicioAEditar) {
      setFormData({
        nombre_servicio: servicioAEditar.nombre_servicio || '',
        descripcion: servicioAEditar.descripcion || '',
        costo_base: servicioAEditar.costo_base?.toString() || '0'
      });
    } else if (isOpen) {
      setFormData({ nombre_servicio: '', descripcion: '', costo_base: '' });
    }
    setErrorMsg(null);
  }, [isOpen, servicioAEditar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isEditing && servicioAEditar) {
        await updateServicio({
          variables: {
            input: {
              id_servicio: servicioAEditar.id_servicio,
              nombre_servicio: formData.nombre_servicio.trim(),
              descripcion: formData.descripcion.trim(),
              costo_base: parseFloat(formData.costo_base) || 0
            }
          }
        });
      } else {
        await createServicio({
          variables: {
            input: {
              nombre_servicio: formData.nombre_servicio.trim(),
              descripcion: formData.descripcion.trim(),
              costo_base: parseFloat(formData.costo_base) || 0
            }
          }
        });
      }
      
      await client.refetchQueries({ include: "active" });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error al procesar el servicio médico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Award size={24} className="text-[#3B82F6]"/> {isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {isEditing ? `Actualizando costos de ${servicioAEditar.nombre_servicio}` : 'Registra un nuevo servicio clínico o estético.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="servicioForm" onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium flex gap-2 items-start shadow-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                <CheckCircle size={20} /> {isEditing ? '¡Cambios guardados!' : '¡Servicio registrado!'}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Nombre del Servicio</Label>
                  <Input name="nombre_servicio" value={formData.nombre_servicio} onChange={handleChange} icon={Award} placeholder="Ej. Consulta General, Baño" required disabled={isSubmitting || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label>Costo Base ($)</Label>
                  <Input name="costo_base" type="number" step="0.01" value={formData.costo_base} onChange={handleChange} icon={DollarSign} placeholder="0.00" required disabled={isSubmitting || successMsg} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descripción del Servicio</Label>
                <Textarea 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Detalla lo que incluye este servicio..." 
                  disabled={isSubmitting || successMsg} 
                />
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="servicioForm" variant="primary" disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? "Guardar Cambios" : "Crear Servicio")}
          </Button>
        </div>
      </div>
    </div>
  );
};