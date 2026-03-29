import React, { useState } from 'react';
import { X, Activity, Thermometer, HeartPulse, Weight, FileText, Loader2 } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const CREATE_CONSULTA = gql`
  mutation CreateConsulta($input: CreateConsultaInput!) {
    createConsulta(createConsultaInput: $input) {
      id_consulta
      diagnostico
      peso_actual
      cita {
        id_cita
        estado
      }
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

  const [createConsulta, { loading, error }] = useMutation(CREATE_CONSULTA, {
    refetchQueries: ['GetExpedientePaciente', 'GetCitasAgenda'] // Actualizamos expediente y agenda
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citaId) return;

    try {
      await createConsulta({
        variables: {
          input: {
            cita_id: citaId,
            peso_actual: parseFloat(formData.peso_actual),
            temperatura: parseFloat(formData.temperatura),
            frecuencia_cardiaca: parseInt(formData.frecuencia_cardiaca),
            diagnostico: formData.diagnostico,
            observaciones: formData.observaciones
          }
        }
      });
      setFormData({ peso_actual: '', temperatura: '', frecuencia_cardiaca: '', diagnostico: '', observaciones: '' });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <Activity className="text-[#3B82F6]" size={20}/> Registrar Consulta
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Ingresa los signos vitales y el diagnóstico del paciente.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="consultaForm" onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-rose-50 text-rose-600 rounded-lg text-sm">{error.message}</div>}

            {/* Signos Vitales */}
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-4 border-b border-black/5 dark:border-white/5 pb-2">Signos Vitales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Weight size={14}/> Peso (kg)</Label>
                  <Input name="peso_actual" type="number" step="0.01" value={formData.peso_actual} onChange={handleChange} required placeholder="Ej. 15.2" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Thermometer size={14}/> Temp. (°C)</Label>
                  <Input name="temperatura" type="number" step="0.1" value={formData.temperatura} onChange={handleChange} required placeholder="Ej. 38.5" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><HeartPulse size={14}/> FC (lpm)</Label>
                  <Input name="frecuencia_cardiaca" type="number" value={formData.frecuencia_cardiaca} onChange={handleChange} required placeholder="Ej. 110" />
                </div>
              </div>
            </div>

            {/* Diagnóstico */}
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider mb-4 border-b border-black/5 dark:border-white/5 pb-2">Evaluación Médica</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Diagnóstico</Label>
                  <Textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange} required rows={3} placeholder="Describe el diagnóstico principal..." />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><FileText size={14}/> Observaciones y Plan</Label>
                  <Textarea name="observaciones" value={formData.observaciones} onChange={handleChange} required rows={3} placeholder="Instrucciones, dieta, siguientes pasos..." />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="consultaForm" variant="primary" disabled={loading} className="flex items-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Consulta"}
          </Button>
        </div>
      </div>
    </div>
  );
};