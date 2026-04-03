import React, { useState } from 'react';
import { 
  X, Pill, Plus, Trash2, Loader2, CheckCircle, 
  AlertCircle, Weight, Thermometer, HeartPulse 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// ==========================================
// 1. QUERIES Y MUTACIONES
// ==========================================
const GET_MEDICAMENTOS_DROPDOWN = gql`
  query GetMedicamentosDropdown {
    medicamentos {
      id_medicamento
      nombre
      presentacion
    }
  }
`;

// RESTAURADO: Creación de la Consulta
const CREATE_CONSULTA = gql`
  mutation CreateConsulta($input: CreateConsultaInput!) {
    createConsulta(createConsultaInput: $input) {
      id_consulta
      diagnostico
      peso_actual
    }
  }
`;

// La Receta Transaccional
const CREATE_CONSULTA_CON_RECETA = gql`
  mutation CreateReceta($input: CreateRecetaInput!) {
    createReceta(createInput: $input) {
      id_receta
      fecha_emision
    }
  }
`;

const UPDATE_ESTADO_CITA = gql`
  mutation UpdateEstadoCita($id: Int!, $nuevoEstado: String!) {
    updateEstadoCita(id: $id, nuevoEstado: $nuevoEstado) {
      id_cita
      estado
    }
  }
`;

// ==========================================
// 2. INTERFACES DE TYPESCRIPT
// ==========================================
interface MedicamentoDropdown {
  id_medicamento: number;
  nombre: string;
  presentacion: string;
}

interface GetMedicamentosResponse {
  medicamentos: MedicamentoDropdown[];
}

interface DetalleReceta {
  medicamento_id: number;
  nombre_med: string; 
  dosis: string;
  frecuencia: string;
  duracion_dias: number;
}

// NUEVA INTERFAZ PARA TIPAR LA RESPUESTA DE LA MUTACIÓN
interface CreateConsultaResponse {
  createConsulta: {
    id_consulta: number;
    diagnostico: string;
    peso_actual: number;
  };
}

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================
export const NuevaConsultaModal: React.FC<{isOpen: boolean, citaId: number | null, onClose: () => void}> = ({ isOpen, citaId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'receta'>('diagnostico');
  const [customError, setCustomError] = useState<string | null>(null);

  // Estados Restaurados de Signos Vitales y Diagnóstico
  const [peso, setPeso] = useState('');
  const [temp, setTemp] = useState('');
  const [fc, setFc] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estado para la receta
  const [recetaItems, setRecetaItems] = useState<DetalleReceta[]>([]);
  const [currentMed, setCurrentMed] = useState({ id: '', dosis: '', frec: '', dias: '' });

  const { data: medsData } = useQuery<GetMedicamentosResponse>(GET_MEDICAMENTOS_DROPDOWN, { skip: !isOpen });
  
  // INYECTAMOS LA INTERFAZ AQUÍ
  const [createConsulta, { loading: savingConsulta }] = useMutation<CreateConsultaResponse>(CREATE_CONSULTA, {
    refetchQueries: ['GetHistorialConsultas', 'GetExpedientePaciente'] 
  });
  const [createReceta, { loading: savingReceta }] = useMutation(CREATE_CONSULTA_CON_RECETA);
  const [updateEstado, { loading: updatingEstado }] = useMutation(UPDATE_ESTADO_CITA, {
      refetchQueries: ['GetCitasSalaEspera', 'GetHistorialConsultas']
  });

  const saving = savingConsulta || savingReceta || updatingEstado;

  const agregarMedicamento = () => {
    if (!currentMed.id || !currentMed.dosis) return;
    const medInfo = medsData?.medicamentos.find((m) => m.id_medicamento === parseInt(currentMed.id));
    
    if (medInfo) {
        setRecetaItems([...recetaItems, {
          medicamento_id: parseInt(currentMed.id),
          nombre_med: medInfo.nombre,
          dosis: currentMed.dosis,
          frecuencia: currentMed.frec,
          duracion_dias: parseInt(currentMed.dias) || 1
        }]);
        setCurrentMed({ id: '', dosis: '', frec: '', dias: '' });
    }
  };

  const quitarMedicamento = (index: number) => {
    setRecetaItems(recetaItems.filter((_, i) => i !== index));
  };

  const handleFinalizar = async () => {
    if (!citaId) return;

    // Validación UX: Evitar que falle el backend si se brincaron los campos requeridos
    if (!peso || !temp || !fc || !diagnostico || !observaciones) {
      setActiveTab('diagnostico');
      setCustomError('Por favor completa todos los campos de Signos Vitales y Diagnóstico antes de finalizar.');
      return;
    }

    setCustomError(null);

    try {
      // Paso 1: Crear Consulta y obtener su ID Real
      const { data } = await createConsulta({
        variables: {
          input: {
            cita_id: citaId,
            peso_actual: parseFloat(peso),
            temperatura: parseFloat(temp),
            frecuencia_cardiaca: parseInt(fc),
            diagnostico: diagnostico.trim(),
            observaciones: observaciones.trim()
          }
        }
      });
      
      // VALIDACIÓN DE SEGURIDAD PARA TYPESCRIPT
      if (!data) throw new Error("No se obtuvieron datos al crear la consulta.");
      
      const idNuevaConsulta = data.createConsulta.id_consulta;

      // Paso 2: Si agregaron medicinas, Crear Receta usando el ID de la Consulta
      if (recetaItems.length > 0) {
        await createReceta({
          variables: {
            input: {
              consulta_id: idNuevaConsulta, // Usamos la llave correcta
              observaciones_generales: observaciones,
              detalles: recetaItems.map(({ nombre_med, ...resto }) => resto) // Quitamos el nombre para que coincida con el DTO
            }
          }
        });
      }

      // Paso 3: Limpiar la Sala de Espera
      await updateEstado({ variables: { id: citaId, nuevoEstado: 'Completada' } });
      
      // Limpiar estados y cerrar
      setPeso('');
      setTemp('');
      setFc('');
      setDiagnostico('');
      setObservaciones('');
      setRecetaItems([]);
      onClose();

    } catch (err: any) {
      console.error(err);
      
      // Aspiradora de Citas Fantasma
      if (err.message?.includes('llave duplicada') || err.message?.includes('UQ_') || err.message?.includes('unique constraint')) {
        try {
          await updateEstado({ variables: { id: citaId, nuevoEstado: 'Completada' } });
          setCustomError("Esta cita ya fue atendida previamente. Se ha limpiado exitosamente de la Sala de Espera.");
          setTimeout(() => { onClose(); }, 2000);
        } catch (e) {}
      } else {
        setCustomError(err.message || "Ocurrió un error al finalizar el proceso médico.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header con Tabs */}
        <div className="px-6 py-4 border-b border-black/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div className="flex gap-4">
            <button 
                type="button"
                onClick={() => setActiveTab('diagnostico')} 
                className={`pb-2 px-2 font-bold text-sm transition-all ${activeTab === 'diagnostico' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B]'}`}
            >
              1. Diagnóstico
            </button>
            <button 
                type="button"
                onClick={() => setActiveTab('receta')} 
                className={`pb-2 px-2 font-bold text-sm transition-all ${activeTab === 'receta' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B]'}`}
            >
              2. Receta Médica
            </button>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-50 rounded-full text-[#64748B] hover:text-rose-500 transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'diagnostico' ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
              
              {/* Alerta de Errores */}
              {customError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex gap-3 items-start border border-rose-200 dark:border-rose-500/20">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p>{customError}</p>
                </div>
              )}

              {/* Signos Vitales Recuperados */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Signos Vitales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Weight size={14}/> Peso (kg)</Label>
                    <Input name="peso_actual" type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ej. 15.5" required disabled={saving} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Thermometer size={14}/> Temp. (°C)</Label>
                    <Input name="temperatura" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Ej. 38.5" required disabled={saving} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><HeartPulse size={14}/> FC (lpm)</Label>
                    <Input name="frecuencia_cardiaca" type="number" value={fc} onChange={(e) => setFc(e.target.value)} placeholder="Ej. 120" required disabled={saving} />
                  </div>
                </div>
              </div>

              {/* Evaluación Médica */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Evaluación Médica</h3>
                <div className="space-y-2">
                  <Label>Diagnóstico Principal</Label>
                  <Textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)} placeholder="Escribe el diagnóstico médico..." rows={3} disabled={saving} required />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones Generales (Reposo, Dieta, etc.)</Label>
                  <Textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Instrucciones adicionales para el dueño..." rows={3} disabled={saving} required />
                </div>
              </div>

            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              
              {/* Selector de Medicamentos */}
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-black/5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end shadow-sm">
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B]">Medicamento</Label>
                  <select 
                    value={currentMed.id} 
                    onChange={(e) => setCurrentMed({...currentMed, id: e.target.value})} 
                    className="w-full p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#3B82F6]/50 outline-none"
                  >
                    <option value="">Seleccionar del catálogo...</option>
                    {medsData?.medicamentos.map((m) => (
                      <option key={m.id_medicamento} value={m.id_medicamento}>{m.nombre} ({m.presentacion})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B]">Dosis</Label>
                  <Input value={currentMed.dosis} onChange={(e) => setCurrentMed({...currentMed, dosis: e.target.value})} placeholder="1 tab / 5ml" className="h-10 text-sm" />
                </div>
                <Button onClick={agregarMedicamento} variant="primary" className="h-10 !py-0 w-full">
                  <Plus size={18} className="mr-1"/> Añadir
                </Button>
                
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B]">Frecuencia</Label>
                  <Input value={currentMed.frec} onChange={(e) => setCurrentMed({...currentMed, frec: e.target.value})} placeholder="c/12 hrs" className="h-10 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B]">Días</Label>
                  <Input type="number" value={currentMed.dias} onChange={(e) => setCurrentMed({...currentMed, dias: e.target.value})} placeholder="5" className="h-10 text-sm" />
                </div>
              </div>

              {/* Lista de Receta */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-[#64748B] flex items-center gap-2 uppercase tracking-wider"><Pill size={14}/> Medicamentos Prescritos</h3>
                {recetaItems.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-black/5 dark:border-white/5 rounded-2xl bg-black/[0.01]">
                    <Pill size={32} className="mx-auto text-[#94A3B8] mb-2 opacity-30" />
                    <p className="text-sm text-[#94A3B8] italic">No hay medicamentos en la receta aún.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recetaItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 rounded-xl shadow-sm animate-in slide-in-from-top-2">
                        <div>
                          <p className="font-bold text-[#0F172A] dark:text-white text-sm">{item.nombre_med}</p>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">
                            {item.dosis} — {item.frecuencia} durante {item.duracion_dias} días
                          </p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => quitarMedicamento(index)} 
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                            <Trash2 size={18}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          
          {/* Navegación Inteligente */}
          {activeTab === 'diagnostico' ? (
            <Button onClick={() => setActiveTab('receta')} variant="primary" className="flex items-center gap-2">
              Continuar a Receta <ChevronRight size={18}/>
            </Button>
          ) : (
            <Button 
                onClick={handleFinalizar} 
                disabled={saving} 
                variant="primary" 
                className="bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>} 
              Finalizar Consulta
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;