import React, { useState, useEffect } from 'react';
import { X, Syringe, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const CREATE_VACUNA = gql`
  mutation CreateVacuna($input: CreateVacunaInput!) {
    createVacuna(createInput: $input) {
      id_vacuna
      nombre_vacuna
    }
  }
`;

const UPDATE_VACUNA = gql`
  mutation UpdateVacuna($input: UpdateVacunaInput!) {
    updateVacuna(updateInput: $input) {
      id_vacuna
      nombre_vacuna
      descripcion
    }
  }
`;

interface Vacuna {
  id_vacuna: number;
  nombre_vacuna: string;
  descripcion: string;
}

interface NuevaVacunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacunaAEditar?: Vacuna | null;
}

export const NuevaVacunaModal: React.FC<NuevaVacunaModalProps> = ({ isOpen, onClose, vacunaAEditar }) => {
  const [formData, setFormData] = useState({
    nombre_vacuna: '',
    descripcion: ''
  });

  const client = useApolloClient();
  const [createVacuna] = useMutation(CREATE_VACUNA);
  const [updateVacuna] = useMutation(UPDATE_VACUNA);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const isEditing = !!vacunaAEditar;

  useEffect(() => {
    if (isOpen && vacunaAEditar) {
      setFormData({
        nombre_vacuna: vacunaAEditar.nombre_vacuna || '',
        descripcion: vacunaAEditar.descripcion || ''
      });
    } else if (isOpen) {
      setFormData({ nombre_vacuna: '', descripcion: '' });
    }
    setErrorMsg(null);
  }, [isOpen, vacunaAEditar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isEditing && vacunaAEditar) {
        await updateVacuna({
          variables: {
            input: {
              id_vacuna: vacunaAEditar.id_vacuna,
              nombre_vacuna: formData.nombre_vacuna.trim(),
              descripcion: formData.descripcion.trim()
            }
          }
        });
      } else {
        await createVacuna({
          variables: {
            input: {
              nombre_vacuna: formData.nombre_vacuna.trim(),
              descripcion: formData.descripcion.trim()
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
      setErrorMsg(err.message || "Ocurrió un error al procesar el biológico.");
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
              <Syringe size={24} className="text-[#3B82F6]"/> {isEditing ? 'Editar Biológico' : 'Nueva Vacuna'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {isEditing ? `Modificando detalles de ${vacunaAEditar.nombre_vacuna}` : 'Registra un nuevo biológico en el catálogo.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="vacunaForm" onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium flex gap-2 items-start shadow-sm">
                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                <CheckCircle size={20} /> {isEditing ? '¡Cambios guardados!' : '¡Vacuna registrada!'}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Vacuna / Biológico</Label>
                <Input name="nombre_vacuna" value={formData.nombre_vacuna} onChange={handleChange} icon={Syringe} placeholder="Ej. Sextuple, Rabia, Leucemia" required disabled={isSubmitting || successMsg} />
              </div>

              <div className="space-y-2">
                <Label>Descripción o Notas Clínicas</Label>
                <Textarea 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  rows={3} 
                  placeholder="Ej. Protege contra Parvovirus, Moquillo, Hepatitis..." 
                  disabled={isSubmitting || successMsg} 
                />
              </div>
            </div>

          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="vacunaForm" variant="primary" disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? "Guardar Cambios" : "Registrar Vacuna")}
          </Button>
        </div>
      </div>
    </div>
  );
};