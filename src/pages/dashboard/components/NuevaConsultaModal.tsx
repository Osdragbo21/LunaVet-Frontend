import React, { useState, useRef } from 'react';
import { 
  X, Pill, Plus, Trash2, Loader2, CheckCircle, 
  AlertCircle, Weight, Thermometer, HeartPulse,
  UploadCloud, FileText, Image as ImageIcon, Paperclip, ChevronRight
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

const CREATE_CONSULTA = gql`
  mutation CreateConsulta($input: CreateConsultaInput!) {
    createConsulta(createConsultaInput: $input) {
      id_consulta
      diagnostico
      peso_actual
    }
  }
`;

const CREATE_CONSULTA_CON_RECETA = gql`
  mutation CreateReceta($input: CreateRecetaInput!) {
    createReceta(createInput: $input) {
      id_receta
    }
  }
`;

const UPLOAD_ARCHIVO_CONSULTA = gql`
  mutation UploadArchivoConsulta($input: CreateArchivoConsultaInput!) {
    createArchivoConsulta(createInput: $input) {
      id_archivo
      nombre_archivo
      url_archivo
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
  const [activeTab, setActiveTab] = useState<'diagnostico' | 'receta' | 'archivos'>('diagnostico');
  const [customError, setCustomError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Signos Vitales y Diagnóstico (Restaurados tal cual los tenías)
  const [peso, setPeso] = useState('');
  const [temp, setTemp] = useState('');
  const [fc, setFc] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  // Estados para la receta y archivos
  const [recetaItems, setRecetaItems] = useState<DetalleReceta[]>([]);
  const [currentMed, setCurrentMed] = useState({ id: '', dosis: '', frec: '', dias: '' });
  const [archivosLocales, setArchivosLocales] = useState<File[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);

  const { data: medsData } = useQuery<GetMedicamentosResponse>(GET_MEDICAMENTOS_DROPDOWN, { skip: !isOpen });
  
  const [createConsulta, { loading: savingConsulta }] = useMutation<CreateConsultaResponse>(CREATE_CONSULTA, {
    refetchQueries: ['GetHistorialConsultas', 'GetExpedientePaciente'] 
  });
  const [createReceta, { loading: savingReceta }] = useMutation(CREATE_CONSULTA_CON_RECETA);
  const [uploadArchivo] = useMutation(UPLOAD_ARCHIVO_CONSULTA);
  const [updateEstado, { loading: updatingEstado }] = useMutation(UPDATE_ESTADO_CITA, {
      refetchQueries: ['GetCitasSalaEspera', 'GetHistorialConsultas']
  });

  const saving = savingConsulta || savingReceta || updatingEstado || isUploadingFiles;

  // Lógica de Medicamentos
  const agregarMedicamento = () => {
    if (!currentMed.id || !currentMed.dosis) return;
    const medInfo = medsData?.medicamentos.find((m) => m.id_medicamento === parseInt(currentMed.id));
    if (medInfo) {
        setRecetaItems([...recetaItems, { medicamento_id: parseInt(currentMed.id), nombre_med: medInfo.nombre, dosis: currentMed.dosis, frecuencia: currentMed.frec, duracion_dias: parseInt(currentMed.dias) || 1 }]);
        setCurrentMed({ id: '', dosis: '', frec: '', dias: '' });
    }
  };

  const quitarMedicamento = (index: number) => setRecetaItems(recetaItems.filter((_, i) => i !== index));

  // Lógica de Archivos (Drag & Drop)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setArchivosLocales([...archivosLocales, ...Array.from(e.target.files)]);
    }
  };
  const removeFile = (index: number) => setArchivosLocales(archivosLocales.filter((_, i) => i !== index));

  // Simulación de subida al Cloud Storage (AWS/Firebase)
  const mockUploadToBucket = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://firebasestorage.googleapis.com/v0/b/lunavet-cloud/o/${encodeURIComponent(file.name)}?alt=media`);
      }, 600); // Simulamos el delay de red
    });
  };

  const handleFinalizar = async () => {
    if (!citaId) return;

    if (!peso || !temp || !fc || !diagnostico || !observaciones) {
      setActiveTab('diagnostico');
      setCustomError('Completa los Signos Vitales y la Evaluación Médica antes de finalizar.');
      return;
    }
    setCustomError(null);

    try {
      // 1. Crear Consulta
      const { data } = await createConsulta({
        variables: {
          input: { cita_id: citaId, peso_actual: parseFloat(peso), temperatura: parseFloat(temp), frecuencia_cardiaca: parseInt(fc), diagnostico: diagnostico.trim(), observaciones: observaciones.trim() }
        }
      });
      if (!data) throw new Error("No se obtuvieron datos de la consulta.");
      const idNuevaConsulta = data.createConsulta.id_consulta;

      // 2. Crear Receta (Si hay)
      if (recetaItems.length > 0) {
        await createReceta({
          variables: { input: { consulta_id: idNuevaConsulta, observaciones_generales: observaciones, detalles: recetaItems.map(({ nombre_med, ...resto }) => resto) } }
        });
      }

      // 3. Subir y Registrar Archivos (Gabinete)
      if (archivosLocales.length > 0) {
        setIsUploadingFiles(true);
        for (const file of archivosLocales) {
          const fileUrl = await mockUploadToBucket(file);
          await uploadArchivo({
            variables: {
              input: {
                consulta_id: idNuevaConsulta,
                nombre_archivo: file.name,
                url_archivo: fileUrl,
                tipo_documento: file.type.startsWith('image/') ? 'Radiografía/Imagen' : 'Laboratorio/PDF'
              }
            }
          });
        }
        setIsUploadingFiles(false);
      }

      // 4. Completar cita y cerrar
      await updateEstado({ variables: { id: citaId, nuevoEstado: 'Completada' } });
      
      setPeso(''); setTemp(''); setFc(''); setDiagnostico(''); setObservaciones(''); setRecetaItems([]); setArchivosLocales([]);
      onClose();

    } catch (err: any) {
      console.error(err);
      setIsUploadingFiles(false);
      setCustomError(err.message || "Error al procesar la consulta.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header Tabs */}
        <div className="px-6 py-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex gap-6 min-w-max">
            <button onClick={() => setActiveTab('diagnostico')} className={`pb-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'diagnostico' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
              1. Diagnóstico
            </button>
            <button onClick={() => setActiveTab('receta')} className={`pb-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'receta' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
              2. Receta Médica
            </button>
            <button onClick={() => setActiveTab('archivos')} className={`pb-2 font-bold text-sm transition-all whitespace-nowrap ${activeTab === 'archivos' ? 'text-[#3B82F6] border-b-2 border-[#3B82F6]' : 'text-[#64748B] dark:text-[#94A3B8]'}`}>
              3. Gabinete y Archivos
            </button>
          </div>
          <button onClick={onClose} className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-rose-500 transition-colors"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {customError && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-bold flex gap-3 items-start border border-rose-200 dark:border-rose-500/20">
              <AlertCircle size={20} className="shrink-0 mt-0.5" /><p>{customError}</p>
            </div>
          )}

          {/* ==========================================
              TAB 1: DIAGNÓSTICO (ESTILOS ORIGINALES RESTAURADOS)
              ========================================== */}
          {activeTab === 'diagnostico' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Signos Vitales */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">
                  SIGNOS VITALES
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Weight size={14}/> Peso (kg)</Label>
                    <Input name="peso_actual" type="number" step="0.01" value={peso} onChange={(e) => setPeso(e.target.value)} placeholder="Ej. 15.5" required disabled={saving} className="bg-[#F8FAFC] dark:bg-[#0F172A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Thermometer size={14}/> Temp. (°C)</Label>
                    <Input name="temperatura" type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} placeholder="Ej. 38.5" required disabled={saving} className="bg-[#F8FAFC] dark:bg-[#0F172A]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><HeartPulse size={14}/> FC (lpm)</Label>
                    <Input name="frecuencia_cardiaca" type="number" value={fc} onChange={(e) => setFc(e.target.value)} placeholder="Ej. 120" required disabled={saving} className="bg-[#F8FAFC] dark:bg-[#0F172A]" />
                  </div>
                </div>
              </div>

              {/* Evaluación Médica */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">
                  EVALUACIÓN MÉDICA
                </h3>
                <div className="space-y-2">
                  <Label>Diagnóstico</Label>
                  <Textarea 
                    value={diagnostico} 
                    onChange={(e) => setDiagnostico(e.target.value)} 
                    rows={3} 
                    disabled={saving} 
                    required 
                    placeholder="Escribe el diagnóstico principal..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones y Plan</Label>
                  <Textarea 
                    value={observaciones} 
                    onChange={(e) => setObservaciones(e.target.value)} 
                    rows={3} 
                    disabled={saving} 
                    required 
                    placeholder="Tratamiento recomendado, medicamentos, dieta..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: RECETA MÉDICA
              ========================================== */}
          {activeTab === 'receta' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-black/5 dark:border-white/5 grid grid-cols-1 md:grid-cols-4 gap-3 items-end shadow-sm">
                <div className="md:col-span-2 space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B] dark:text-[#94A3B8]">Medicamento</Label>
                  <select value={currentMed.id} onChange={(e) => setCurrentMed({...currentMed, id: e.target.value})} className="w-full p-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E293B] text-sm text-[#0F172A] dark:text-white focus:ring-2 focus:ring-[#3B82F6]/50 outline-none">
                    <option value="">Seleccionar del catálogo...</option>
                    {medsData?.medicamentos.map((m) => (<option key={m.id_medicamento} value={m.id_medicamento}>{m.nombre} ({m.presentacion})</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B] dark:text-[#94A3B8]">Dosis</Label>
                  <Input value={currentMed.dosis} onChange={(e) => setCurrentMed({...currentMed, dosis: e.target.value})} placeholder="1 tab / 5ml" className="h-10 text-sm bg-white dark:bg-[#1E293B]" />
                </div>
                <Button onClick={agregarMedicamento} variant="primary" className="h-10 !py-0 w-full"><Plus size={18} className="mr-1"/> Añadir</Button>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B] dark:text-[#94A3B8]">Frecuencia</Label>
                  <Input value={currentMed.frec} onChange={(e) => setCurrentMed({...currentMed, frec: e.target.value})} placeholder="c/12 hrs" className="h-10 text-sm bg-white dark:bg-[#1E293B]" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase font-black text-[#64748B] dark:text-[#94A3B8]">Días</Label>
                  <Input type="number" value={currentMed.dias} onChange={(e) => setCurrentMed({...currentMed, dias: e.target.value})} placeholder="5" className="h-10 text-sm bg-white dark:bg-[#1E293B]" />
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-bold text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 uppercase tracking-wider"><Pill size={14}/> Medicamentos Prescritos</h3>
                {recetaItems.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-black/10 dark:border-white/10 rounded-2xl bg-black/[0.01]">
                    <Pill size={32} className="mx-auto text-[#94A3B8] mb-2 opacity-30" />
                    <p className="text-sm text-[#94A3B8] italic">No hay medicamentos en la receta aún.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recetaItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 rounded-xl shadow-sm">
                        <div>
                          <p className="font-bold text-sm text-[#0F172A] dark:text-white">{item.nombre_med}</p>
                          <p className="text-xs font-medium mt-0.5 text-[#64748B] dark:text-[#94A3B8]">{item.dosis} — {item.frecuencia} durante {item.duracion_dias} días</p>
                        </div>
                        <button onClick={() => quitarMedicamento(index)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: GABINETE Y ARCHIVOS
              ========================================== */}
          {activeTab === 'archivos' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center">
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Gabinete de Estudios</h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Adjunta radiografías, resultados de laboratorio o fotografías clínicas del paciente.</p>
              </div>

              {/* Zona Drag & Drop simulada */}
              <div 
                className="relative border-2 border-dashed border-[#3B82F6]/50 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
                <div className="w-16 h-16 bg-white dark:bg-[#1E293B] rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud size={32} className="text-[#3B82F6]" />
                </div>
                <h4 className="font-bold text-[#0F172A] dark:text-white mb-1">Haz clic para subir documentos</h4>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Soporta JPG, PNG y PDF (Máx. 10MB)</p>
              </div>

              {/* Lista de archivos preparados para subir */}
              {archivosLocales.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 uppercase tracking-wider">
                    <Paperclip size={14}/> Archivos listos para adjuntar ({archivosLocales.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {archivosLocales.map((file, index) => {
                      const isImage = file.type.startsWith('image/');
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-lg ${isImage ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                              {isImage ? <ImageIcon size={20}/> : <FileText size={20}/>}
                            </div>
                            <div className="truncate">
                              <p className="font-bold text-sm text-[#0F172A] dark:text-white truncate">{file.name}</p>
                              <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button onClick={() => removeFile(index)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0"><Trash2 size={16}/></button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-black/5 dark:border-white/5 flex justify-between gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <div className="flex gap-2">
            {activeTab === 'diagnostico' && <Button onClick={() => setActiveTab('receta')} variant="outline">Siguiente: Receta <ChevronRight size={18}/></Button>}
            {activeTab === 'receta' && <Button onClick={() => setActiveTab('archivos')} variant="outline">Siguiente: Gabinete <ChevronRight size={18}/></Button>}
            
            <Button onClick={handleFinalizar} disabled={saving} variant="primary" className="bg-emerald-500 hover:bg-emerald-600 border-emerald-500 text-white flex items-center gap-2">
              {saving ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>} 
              {isUploadingFiles ? 'Subiendo Archivos...' : 'Finalizar Consulta'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};