import React, { useState } from 'react';
import { X, Activity, Thermometer, Weight, HeartPulse, FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// 1. MUTACIÓN ORIGINAL: Para guardar el diagnóstico
const CREATE_CONSULTA = gql`
  mutation CreateConsulta($input: CreateConsultaInput!) {
    createConsulta(createConsultaInput: $input) {
      id_consulta
      diagnostico
      peso_actual
    }
  }
`;

// 2. MUTACIÓN PARA ACTUALIZAR ESTADO DE LA CITA
const UPDATE_ESTADO_CITA = gql`
  mutation UpdateEstadoCita($id: Int!, $nuevoEstado: String!) {
    updateEstadoCita(id: $id, nuevoEstado: $nuevoEstado) {
      id_cita
      estado
    }
  }
`;

interface NuevaConsultaModalProps {
  isOpen: boolean;
  citaId: number | null;
  onClose: () => void;
}

export const NuevaConsultaModal: React.FC<NuevaConsultaModalProps> = ({ isOpen, citaId, onClose }) => {
  const [formData, setFormData] = useState({
    peso_actual: '',
    temperatura: '',
    frecuencia_cardiaca: '',
    diagnostico: '',
    observaciones: ''
  });

  const [customError, setCustomError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const [createConsulta, { loading: savingConsulta }] = useMutation(CREATE_CONSULTA, {
    refetchQueries: ['GetHistorialConsultas', 'GetExpedientePaciente'] 
  });

  const [updateEstadoCita, { loading: updatingEstado }] = useMutation(UPDATE_ESTADO_CITA, {
    refetchQueries: ['GetCitasSalaEspera', 'GetCitasAgenda'] // Esto limpiará la sala de espera
  });

  const isLoading = savingConsulta || updatingEstado;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);
    if (!citaId) return;

    try {
      // PASO 1: Guardamos la consulta médica
      await createConsulta({
        variables: {
          input: {
            cita_id: citaId,
            peso_actual: parseFloat(formData.peso_actual),
            temperatura: parseFloat(formData.temperatura),
            frecuencia_cardiaca: parseInt(formData.frecuencia_cardiaca),
            diagnostico: formData.diagnostico.trim(),
            observaciones: formData.observaciones.trim()
          }
        }
      });

      // PASO 2: Actualizamos la cita a "Completada"
      await updateEstadoCita({
        variables: { id: citaId, nuevoEstado: 'Completada' }
      });

      setSuccessMsg(true);
      setTimeout(() => {
        setFormData({ peso_actual: '', temperatura: '', frecuencia_cardiaca: '', diagnostico: '', observaciones: '' });
        setSuccessMsg(false);
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      
      // Si el error es de llave duplicada (Cita fantasma ya atendida)
      if (err.message.includes('llave duplicada') || err.message.includes('UQ_') || err.message.includes('unique constraint')) {
        try {
          // FORZAMOS EL PASO 2 PARA LIMPIAR LA SALA DE ESPERA
          await updateEstadoCita({
            variables: { id: citaId, nuevoEstado: 'Completada' }
          });
          
          setCustomError("Esta cita ya tenía una consulta previa. Se ha limpiado exitosamente de la Sala de Espera.");
          
          setTimeout(() => {
            setCustomError(null);
            onClose();
          }, 2500);

        } catch (updateErr: any) {
          // Si el backend no tiene habilitado UpdateEstadoCita, mostramos este error
          setCustomError("El paciente ya fue atendido, pero falta que el Backend habilite la mutación 'updateEstadoCita' para limpiar la sala.");
        }
      } else {
        setCustomError(err.message || "Ocurrió un error al guardar la consulta.");
      }
    }
  };

  if (!isOpen || !citaId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Activity size={24} className="text-[#3B82F6]" /> Registrar Consulta
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Ingresa los signos vitales y el diagnóstico del paciente.</p>
          </div>
          <button onClick={onClose} disabled={isLoading || successMsg} className="p-2 bg-black/5 dark:bg-white/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <form id="consultaForm" onSubmit={handleSubmit} className="space-y-6">

            {/* Renderizado de Error Personalizado */}
            {customError && (
              <div className={`p-4 text-sm font-bold rounded-xl border flex gap-3 items-start shadow-sm ${customError.includes('limpiado') ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                <p>{customError}</p>
              </div>
            )}

            {successMsg && (
              <div className="p-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-center flex items-center justify-center gap-2 border border-emerald-200 animate-in zoom-in duration-300">
                <CheckCircle size={20} /> ¡Consulta guardada y paciente retirado de Sala de Espera!
              </div>
            )}

            {/* Signos Vitales */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Signos Vitales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Weight size={14}/> Peso (kg)</Label>
                  <Input name="peso_actual" type="number" step="0.01" value={formData.peso_actual} onChange={handleChange} placeholder="Ej. 15.5" required disabled={isLoading || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Thermometer size={14}/> Temp. (°C)</Label>
                  <Input name="temperatura" type="number" step="0.1" value={formData.temperatura} onChange={handleChange} placeholder="Ej. 38.5" required disabled={isLoading || successMsg} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><HeartPulse size={14}/> FC (lpm)</Label>
                  <Input name="frecuencia_cardiaca" type="number" value={formData.frecuencia_cardiaca} onChange={handleChange} placeholder="Ej. 120" required disabled={isLoading || successMsg} />
                </div>
              </div>
            </div>

            {/* Evaluación */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Evaluación Médica</h3>
              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                <Textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange} rows={2} placeholder="Escribe el diagnóstico principal..." required disabled={isLoading || successMsg} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><FileText size={14}/> Observaciones y Plan</Label>
                <Textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} placeholder="Tratamiento recomendado, medicamentos, dieta..." required disabled={isLoading || successMsg} />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isLoading || successMsg} className="!w-full sm:!w-auto">Cancelar</Button>
          <Button type="submit" form="consultaForm" variant="primary" disabled={isLoading || successMsg} className="!w-full sm:!w-auto flex items-center justify-center gap-2">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Consulta"}
          </Button>
        </div>

      </div>
    </div>
  );
};