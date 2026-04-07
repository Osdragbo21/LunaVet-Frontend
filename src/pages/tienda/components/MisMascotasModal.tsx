import React, { useState, useEffect } from 'react';
import { 
  X, PawPrint, Loader2, Info, Edit2, FileText, Plus, 
  Calendar as CalendarIcon, Syringe, Activity, AlertTriangle, 
  ExternalLink, Tag, Thermometer, Weight, HeartPulse
} from 'lucide-react';
import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

// ==========================================
// 1. QUERIES Y MUTACIONES 
// ==========================================

const GET_MI_PERFIL_CLIENTE_WEB = gql`
  query GetMiPerfilClienteWeb {
    clientes {
      id_cliente
      usuario {
        id_usuario
      }
      pacientes {
        id_paciente
        nombre
        especie
        raza
        fecha_nacimiento
        genero
        color
        alergias
      }
    }
  }
`;

const CREATE_PACIENTE = gql`
  mutation CreatePaciente($input: CreatePacienteInput!) {
    createPaciente(createPacienteInput: $input) {
      id_paciente
    }
  }
`;

const UPDATE_PACIENTE = gql`
  mutation UpdatePaciente($input: UpdatePacienteInput!) {
    updatePaciente(updatePacienteInput: $input) {
      id_paciente
    }
  }
`;

const GET_EXPEDIENTE_WEB = gql`
  query GetExpedientePacienteWeb($id: Int!) {
    paciente(id: $id) {
      citas {
        id_cita
        fecha_hora
        motivo
        estado
        consulta {
          diagnostico
          peso_actual
          temperatura
          frecuencia_cardiaca
          archivos {
            url_archivo
            nombre_archivo
            tipo_documento
          }
        }
      }
      hospitalizaciones {
        fecha_ingreso
        fecha_alta
        motivo
        estado
      }
    }
  }
`;

const GET_CARTILLA_WEB = gql`
  query GetCartillaPacienteWeb($paciente_id: Int!) {
    getCartillaPaciente(paciente_id: $paciente_id) {
      id_registro_vac
      fecha_aplicacion
      proxima_dosis
      vacuna {
        nombre_vacuna
      }
    }
  }
`;

// ==========================================
// 2. INTERFACES PARA TYPESCRIPT (SOLUCIÓN A ERRORES VS CODE)
// ==========================================
interface PacienteWeb {
  id_paciente: number;
  nombre: string;
  especie: string;
  raza: string;
  fecha_nacimiento: string;
  genero: string;
  color: string;
  alergias: string | null;
}

interface GetMiPerfilResponse {
  clientes: {
    id_cliente: number;
    usuario: { id_usuario: number } | null;
    pacientes: PacienteWeb[];
  }[];
}

interface GetExpedienteResponse {
  paciente: {
    citas: {
      id_cita: number;
      fecha_hora: string;
      motivo: string;
      estado: string;
      consulta: {
        diagnostico: string;
        peso_actual: number;
        temperatura: number;
        frecuencia_cardiaca: number;
        archivos: {
          url_archivo: string;
          nombre_archivo: string;
          tipo_documento: string;
        }[];
      } | null;
    }[];
    hospitalizaciones: {
      fecha_ingreso: string;
      fecha_alta: string | null;
      motivo: string;
      estado: string;
    }[];
  } | null;
}

interface GetCartillaResponse {
  getCartillaPaciente: {
    id_registro_vac: number;
    fecha_aplicacion: string;
    proxima_dosis: string | null;
    vacuna: {
      nombre_vacuna: string;
    };
  }[];
}

// ==========================================
// 3. FUNCIONES AUXILIARES GLOBALES
// ==========================================
const calcularEdad = (fechaISO: string) => {
  if (!fechaISO) return 'Desconocida';
  const hoy = new Date();
  const nacimiento = new Date(fechaISO);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  if (edad <= 0) {
    let meses = hoy.getMonth() - nacimiento.getMonth();
    if (meses <= 0) meses += 12;
    return `${meses} meses`;
  }
  return `${edad} años`;
};

const getAvatarColor = (nombre: string) => {
  const colors = ['bg-amber-100 text-amber-600', 'bg-blue-100 text-blue-600', 'bg-emerald-100 text-emerald-600', 'bg-purple-100 text-purple-600', 'bg-rose-100 text-rose-600'];
  const index = nombre.charCodeAt(0) % colors.length;
  return colors[index];
};

// ==========================================
// 4. SUB-MODAL: FORMULARIO (CREAR / EDITAR MASCOTA)
// ==========================================
const ModalFormularioMascota = ({ 
  isOpen, onClose, mascotaInicial, clienteId 
}: { 
  isOpen: boolean, onClose: () => void, mascotaInicial: PacienteWeb | null, clienteId: number | null 
}) => {
  const [formData, setFormData] = useState({
    nombre: '', especie: 'Perro', raza: '', fecha_nacimiento: '', genero: 'Macho', color: '', alergias: ''
  });

  const isEditing = !!mascotaInicial;

  useEffect(() => {
    if (isOpen && mascotaInicial) {
      setFormData({
        nombre: mascotaInicial.nombre,
        especie: mascotaInicial.especie,
        raza: mascotaInicial.raza,
        fecha_nacimiento: mascotaInicial.fecha_nacimiento ? mascotaInicial.fecha_nacimiento.substring(0, 10) : '',
        genero: mascotaInicial.genero || 'Macho',
        color: mascotaInicial.color || '',
        alergias: mascotaInicial.alergias || ''
      });
    } else if (isOpen) {
      setFormData({ nombre: '', especie: 'Perro', raza: '', fecha_nacimiento: '', genero: 'Macho', color: '', alergias: '' });
    }
  }, [isOpen, mascotaInicial]);

  const [createPaciente, { loading: loadingC }] = useMutation(CREATE_PACIENTE, { refetchQueries: ['GetMiPerfilClienteWeb'] });
  const [updatePaciente, { loading: loadingU }] = useMutation(UPDATE_PACIENTE, { refetchQueries: ['GetMiPerfilClienteWeb'] });
  const loading = loadingC || loadingU;

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const inputBase = {
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza,
        fecha_nacimiento: formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento).toISOString() : null,
        genero: formData.genero,
        color: formData.color,
        alergias: formData.alergias.trim() !== '' ? formData.alergias : null
      };

      if (isEditing && mascotaInicial) {
        await updatePaciente({ variables: { input: { id_paciente: mascotaInicial.id_paciente, cliente_id: clienteId, ...inputBase } } });
      } else {
        await createPaciente({ variables: { input: { cliente_id: clienteId, ...inputBase } } });
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al guardar la mascota.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <PawPrint className="text-[#3B82F6]" size={20}/> {isEditing ? 'Editar Mascota' : 'Registrar Nueva Mascota'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="mascotaFormWeb" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="nombre" value={formData.nombre} onChange={handleChange} icon={Tag} required />
              </div>
              <div className="space-y-2">
                <Label>Fecha de Nacimiento</Label>
                <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} onChange={handleChange} required className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] focus:ring-2 focus:ring-[#3B82F6]/50 outline-none dark:[color-scheme:dark]" />
              </div>
              <div className="space-y-2">
                <Label>Especie</Label>
                <select name="especie" value={formData.especie} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] outline-none">
                  <option value="Perro">Perro</option><option value="Gato">Gato</option><option value="Ave">Ave</option><option value="Reptil">Reptil</option><option value="Otro">Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Raza</Label>
                <Input name="raza" value={formData.raza} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label>Género</Label>
                <select name="genero" value={formData.genero} onChange={handleChange} className="w-full px-4 py-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/10 dark:border-white/10 rounded-[12px] text-[#0F172A] dark:text-[#F8FAFC] outline-none">
                  <option value="Macho">Macho</option><option value="Hembra">Hembra</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Color / Rasgos</Label>
                <Input name="color" value={formData.color} onChange={handleChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-rose-500 flex items-center gap-1"><AlertTriangle size={14}/> Alergias Clínicas</Label>
              <Textarea name="alergias" value={formData.alergias} onChange={handleChange} rows={2} placeholder="Deja en blanco si no tiene." className="border-rose-200" />
            </div>
          </form>
        </div>

        <div className="px-6 py-5 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A]">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button type="submit" form="mascotaFormWeb" variant="primary" disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Guardar Mascota"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. SUB-MODAL: HISTORIAL CLÍNICO (Sólo Lectura)
// ==========================================
const ModalHistorialMascota = ({ isOpen, onClose, mascota }: { isOpen: boolean, onClose: () => void, mascota: PacienteWeb | null }) => {
  const [activeTab, setActiveTab] = useState<'consultas' | 'vacunas'>('consultas');

  const token = localStorage.getItem('token')?.replace(/['"]+/g, '');
  const authContext = { headers: { Authorization: token ? `Bearer ${token}` : "" } };

  // Usamos las nuevas interfaces aquí
  const { data: dataExp, loading: loadingExp } = useQuery<GetExpedienteResponse>(GET_EXPEDIENTE_WEB, { variables: { id: mascota?.id_paciente }, skip: !isOpen || !mascota, context: authContext });
  const { data: dataVac, loading: loadingVac } = useQuery<GetCartillaResponse>(GET_CARTILLA_WEB, { variables: { paciente_id: mascota?.id_paciente }, skip: !isOpen || !mascota, context: authContext });

  if (!isOpen || !mascota) return null;

  const consultasRealizadas = dataExp?.paciente?.citas?.filter(c => c.consulta) || [];
  const vacunas = dataVac?.getCartillaPaciente || [];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95">
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <FileText className="text-[#3B82F6]" size={24}/> Historial Clínico
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 font-medium">Paciente: {mascota.nombre}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-black/5 rounded-full hover:text-rose-500 transition-colors"><X size={20} /></button>
        </div>

        <div className="flex px-6 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5 shrink-0">
          <button onClick={() => setActiveTab('consultas')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'consultas' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B]'}`}>Consultas Médicas</button>
          <button onClick={() => setActiveTab('vacunas')} className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'vacunas' ? 'border-[#3B82F6] text-[#3B82F6]' : 'border-transparent text-[#64748B]'}`}>Cartilla de Vacunación</button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-[#F1F5F9] dark:bg-[#0F172A]">
          {activeTab === 'consultas' && (
            <div className="space-y-4">
              {loadingExp ? <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={32}/></div> : 
               consultasRealizadas.length > 0 ? consultasRealizadas.map((cita) => (
                <div key={cita.id_cita} className="bg-white dark:bg-[#1E293B] p-5 rounded-2xl border border-black/5 shadow-sm">
                  <div className="flex justify-between items-start mb-3 border-b border-black/5 pb-3">
                    <div>
                      <p className="font-bold text-[#0F172A] dark:text-white">{new Date(cita.fecha_hora).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <p className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider mt-1">{cita.motivo}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <span className="text-xs font-medium text-[#64748B] flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] px-2 py-1 rounded-md border border-black/5"><Weight size={14}/> {cita.consulta?.peso_actual}kg</span>
                      <span className="text-xs font-medium text-[#64748B] flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] px-2 py-1 rounded-md border border-black/5"><Thermometer size={14}/> {cita.consulta?.temperatura}°C</span>
                      <span className="text-xs font-medium text-[#64748B] flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0F172A] px-2 py-1 rounded-md border border-black/5"><HeartPulse size={14}/> {cita.consulta?.frecuencia_cardiaca} lpm</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748B] uppercase mb-1">Diagnóstico Veterinario</p>
                      <p className="text-sm text-[#0F172A] dark:text-white font-medium bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-black/5">{cita.consulta?.diagnostico}</p>
                    </div>
                    {cita.consulta?.archivos && cita.consulta.archivos.length > 0 && (
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-[#64748B] uppercase mb-2">Gabinete / Recetas Adjuntas</p>
                        <div className="flex flex-wrap gap-2">
                          {cita.consulta.archivos.map((arch) => (
                            <a key={arch.url_archivo} href={arch.url_archivo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                              <FileText size={14}/> {arch.nombre_archivo} <ExternalLink size={12}/>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-16 opacity-50">
                  <Activity size={48} className="mx-auto mb-4 text-[#64748B]" />
                  <p className="font-bold text-lg text-[#0F172A] dark:text-white">Sin historial de consultas</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'vacunas' && (
            <div className="space-y-4">
              {loadingVac ? <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-[#3B82F6]" size={32}/></div> : 
               vacunas.length > 0 ? vacunas.map((vac) => {
                 const isVencida = vac.proxima_dosis && new Date(vac.proxima_dosis) < new Date();
                 return (
                  <div key={vac.id_registro_vac} className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-black/5 shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isVencida ? 'bg-rose-100 text-rose-500' : 'bg-emerald-100 text-emerald-500'}`}>
                        <Syringe size={20}/>
                      </div>
                      <div>
                        <p className="font-bold text-[#0F172A] dark:text-white text-base">{vac.vacuna.nombre_vacuna}</p>
                        <p className="text-xs text-[#64748B] font-medium mt-0.5">Aplicada: {new Date(vac.fecha_aplicacion).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-[#64748B]">Próxima Dosis</p>
                      {vac.proxima_dosis ? (
                        <p className={`text-sm font-bold ${isVencida ? 'text-rose-500' : 'text-emerald-600'}`}>{new Date(vac.proxima_dosis).toLocaleDateString()}</p>
                      ) : (
                        <p className="text-sm font-bold text-[#64748B]">No requiere</p>
                      )}
                    </div>
                  </div>
                 )
               }) : (
                <div className="text-center py-16 opacity-50">
                  <Syringe size={48} className="mx-auto mb-4 text-[#64748B]" />
                  <p className="font-bold text-lg text-[#0F172A] dark:text-white">Cartilla vacía</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 6. COMPONENTE PRINCIPAL EXPORTADO (MIS MASCOTAS)
// ==========================================
export const MisMascotasModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  // 1. Identificar al usuario
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token')?.replace(/['"]+/g, '');

  // 2. Traer todos los clientes con su interface tipada para evitar el error de VS Code
  const { data, loading, error } = useQuery<GetMiPerfilResponse>(GET_MI_PERFIL_CLIENTE_WEB, {
    skip: !isOpen || !currentUser,
    context: { headers: { Authorization: token ? `Bearer ${token}` : "" } }
  });

  // 3. Filtrar el cliente que nos pertenece (TypeScript ahora sabe que data.clientes existe)
  const miPerfilCliente = data?.clientes?.find(c => c.usuario?.id_usuario === currentUser?.id_usuario);
  const misMascotas: PacienteWeb[] = miPerfilCliente?.pacientes || [];

  // Estados de los Sub-modales
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [mascotaEditando, setMascotaEditando] = useState<PacienteWeb | null>(null);
  const [mascotaViendoHistorial, setMascotaViendoHistorial] = useState<PacienteWeb | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={onClose}>
        <div className="bg-[#F1F5F9] dark:bg-[#0F172A] rounded-[24px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          
          {/* Header Superior */}
          <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#FFFFFF] dark:bg-[#1E293B] shrink-0 shadow-sm z-10">
            <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
              <PawPrint className="text-[#3B82F6]" size={28}/> Mis Mascotas
            </h2>
            <button onClick={onClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1">
            {loading && <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>}
            
            {error && (
              <div className="text-center py-20">
                <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
                <p className="font-bold text-[#0F172A] dark:text-white text-lg">Error de conexión</p>
                <p className="text-[#64748B]">{error.message}</p>
              </div>
            )}

            {/* Vista si NO se encuentra el cliente en la BD */}
            {!loading && !error && !miPerfilCliente && (
              <div className="text-center py-20 opacity-80">
                <Info size={48} className="mx-auto mb-4 text-amber-500" />
                <p className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">Perfil de cliente no vinculado</p>
                <p className="text-[#64748B] max-w-md mx-auto">Tu cuenta web aún no está vinculada a un expediente clínico físico. Por favor, comunícate con recepción en tu próxima visita.</p>
              </div>
            )}

            {/* Grid de Mascotas (TARJETAS GRANDES Y HERMOSAS) */}
            {!loading && !error && miPerfilCliente && (
              <>
                {misMascotas.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {misMascotas.map(mascota => (
                      <div key={mascota.id_paciente} className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-3xl border border-black/5 dark:border-white/5 shadow-sm hover:shadow-lg transition-shadow flex flex-col relative overflow-hidden group">
                        
                        {/* Decoración de fondo */}
                        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-20 blur-2xl ${getAvatarColor(mascota.nombre)}`}></div>

                        <div className="flex items-start gap-4 mb-6 relative z-10">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner ${getAvatarColor(mascota.nombre)}`}>
                            {mascota.nombre.charAt(0)}
                          </div>
                          <div className="pt-1">
                            <h3 className="font-black text-xl text-[#0F172A] dark:text-white leading-none mb-1">{mascota.nombre}</h3>
                            <p className="text-sm font-bold text-[#3B82F6]">{mascota.especie} • {mascota.raza}</p>
                            <p className="text-xs font-medium text-[#64748B] mt-1">{calcularEdad(mascota.fecha_nacimiento)} • {mascota.genero}</p>
                          </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="mt-auto space-y-2 relative z-10 border-t border-black/5 dark:border-white/5 pt-4">
                          
                          {/* BARRA PRINCIPAL: Historial Médico */}
                          <Button 
                            variant="outline" 
                            onClick={() => setMascotaViendoHistorial(mascota)}
                            className="w-full !py-3 text-sm font-bold flex items-center justify-center gap-2 border-[#3B82F6] text-[#3B82F6] hover:bg-blue-50 dark:hover:bg-blue-500/10 shadow-sm"
                          >
                            <FileText size={16}/> Ver Historial Clínico
                          </Button>
                          
                          {/* Botón Secundario: Editar */}
                          <button 
                            onClick={() => setMascotaEditando(mascota)}
                            className="w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
                          >
                            <Edit2 size={14}/> Editar Información
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-60">
                    <PawPrint size={64} className="mx-auto mb-4 text-[#64748B] dark:text-[#94A3B8]" />
                    <p className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">Aún no tienes mascotas</p>
                    <p className="text-[#64748B] dark:text-[#94A3B8]">Añade a tu primer compañero para comenzar su expediente.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer del Modal (Botón de Agregar) */}
          {!loading && !error && miPerfilCliente && (
            <div className="p-6 bg-[#FFFFFF] dark:bg-[#1E293B] border-t border-black/5 dark:border-white/5 shrink-0 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <Button 
                variant="primary" 
                onClick={() => setIsFormOpen(true)}
                className="w-full sm:w-auto mx-auto flex items-center justify-center gap-2 !py-4 shadow-lg shadow-blue-500/20 text-lg"
              >
                <Plus size={22} /> Agregar Nueva Mascota
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Renderizado Seguro de Sub-Modales */}
      <ModalFormularioMascota 
        isOpen={isFormOpen || !!mascotaEditando} 
        onClose={() => { setIsFormOpen(false); setMascotaEditando(null); }}
        mascotaInicial={mascotaEditando}
        clienteId={miPerfilCliente?.id_cliente || null}
      />

      <ModalHistorialMascota 
        isOpen={!!mascotaViendoHistorial}
        onClose={() => setMascotaViendoHistorial(null)}
        mascota={mascotaViendoHistorial}
      />
    </>
  );
};