import React, { useState, useEffect } from 'react';
import { X, Pill, Tag, FileText, Loader2, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';

import { useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. MUTACIONES ACTUALIZADAS CON STOCK
// ==========================================
const CREATE_MEDICAMENTO = gql`
  mutation CreateMedicamento($input: CreateMedicamentoInput!) {
    createMedicamento(createInput: $input) {
      id_medicamento
      nombre
      presentacion
      stock_farmacia
    }
  }
`;

const UPDATE_MEDICAMENTO = gql`
  mutation UpdateMedicamento($input: UpdateMedicamentoInput!) {
    updateMedicamento(updateInput: $input) {
      id_medicamento
      nombre
      principio_activo
      presentacion
      stock_farmacia
    }
  }
`;

// ==========================================
// 2. INTERFACES
// ==========================================
interface Medicamento {
  id_medicamento: number;
  nombre: string;
  principio_activo: string;
  presentacion: string;
  stock_farmacia: number;
}

interface NuevoMedicamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicamentoAEditar?: Medicamento | null;
}

export const NuevoMedicamentoModal: React.FC<NuevoMedicamentoModalProps> = ({ isOpen, onClose, medicamentoAEditar }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    principio_activo: '',
    presentacion: '',
    stock_farmacia: '' // Estado para el stock inicial o actual
  });

  const client = useApolloClient();
  const [createMedicamento] = useMutation(CREATE_MEDICAMENTO);
  const [updateMedicamento] = useMutation(UPDATE_MEDICAMENTO);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const isEditing = !!medicamentoAEditar;

  // Sincronizar datos al abrir para editar
  useEffect(() => {
    if (isOpen && medicamentoAEditar) {
      setFormData({
        nombre: medicamentoAEditar.nombre,
        principio_activo: medicamentoAEditar.principio_activo,
        presentacion: medicamentoAEditar.presentacion,
        stock_farmacia: medicamentoAEditar.stock_farmacia.toString()
      });
    } else if (isOpen) {
      setFormData({ nombre: '', principio_activo: '', presentacion: '', stock_farmacia: '0' });
    }
    setErrorMsg(null);
  }, [isOpen, medicamentoAEditar]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const payload = {
        nombre: formData.nombre.trim(),
        principio_activo: formData.principio_activo.trim(),
        presentacion: formData.presentacion.trim(),
        stock_farmacia: parseInt(formData.stock_farmacia) || 0
      };

      if (isEditing) {
        await updateMedicamento({
          variables: {
            input: {
              id_medicamento: medicamentoAEditar.id_medicamento,
              ...payload
            }
          }
        });
      } else {
        await createMedicamento({
          variables: {
            input: payload
          }
        });
      }
      
      // Refrescamos las queries activas para actualizar la tabla de farmacia
      await client.refetchQueries({ include: "active" });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Ocurrió un error al procesar el medicamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Pill size={24} className="text-[#3B82F6]"/> {isEditing ? 'Editar Fármaco' : 'Alta de Medicamento'}
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
              {isEditing ? `Ajustando detalles de ${medicamentoAEditar.nombre}` : 'Agrega un nuevo insumo a la farmacia clínica.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="medForm" onSubmit={handleSubmit} className="space-y-6">
            
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm font-bold flex gap-3 items-start shadow-sm animate-in shake-1">
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}
            
            {successMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                <CheckCircle size={20} /> {isEditing ? 'Inventario actualizado' : 'Medicamento guardado con éxito'}
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Nombre Comercial / Marca</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={Tag} placeholder="Ej. Amoxicilina" required disabled={isSubmitting || successMsg} />
              </div>

              <div className="space-y-2">
                <Label>Principio Activo</Label>
                <Input name="principio_activo" value={formData.principio_activo} onChange={handleChange} icon={FileText} placeholder="Ej. Amoxicilina Trihidrato" required disabled={isSubmitting || successMsg} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Presentación</Label>
                  <Input name="presentacion" value={formData.presentacion} onChange={handleChange} icon={Pill} placeholder="Ej. Tabletas 500mg" required disabled={isSubmitting || successMsg} />
                </div>

                {/* CAMPO DE STOCK AÑADIDO */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Package size={14}/> {isEditing ? 'Stock Actual' : 'Stock Inicial'}</Label>
                  <Input 
                    name="stock_farmacia" 
                    type="number" 
                    value={formData.stock_farmacia} 
                    onChange={handleChange} 
                    placeholder="0" 
                    min="0"
                    required 
                    disabled={isSubmitting || successMsg} 
                    className="bg-amber-50/30 dark:bg-amber-500/5 border-amber-200/50"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-black/5 dark:border-white/5">
               <p className="text-[11px] text-[#64748B] leading-relaxed flex items-start gap-2">
                 <Info size={14} className="shrink-0 mt-0.5 text-[#3B82F6]"/>
                 Nota: El stock de farmacia se descontará automáticamente cuando el veterinario registre una receta o aplicación en la consulta.
               </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="medForm" variant="primary" disabled={isSubmitting || successMsg} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (isEditing ? "Guardar Cambios" : "Registrar Medicamento")}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente Info para notas rápidas
const Info = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>
);