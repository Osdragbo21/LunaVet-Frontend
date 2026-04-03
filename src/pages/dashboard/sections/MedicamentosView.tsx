import React, { useState } from 'react';
import { 
  Pill, Plus, Search, Loader2, Edit2, Trash2, 
  AlertTriangle, X, CheckCircle, Package, AlertCircle 
} from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Importamos el modal
import { NuevoMedicamentoModal } from '../components/NuevoMedicamentoModal';

// ==========================================
// 1. QUERIES Y MUTACIONES (Campo Stock Habilitado)
// ==========================================
const GET_MEDICAMENTOS = gql`
  query GetMedicamentos {
    medicamentos {
      id_medicamento
      nombre
      principio_activo
      presentacion
      stock_farmacia    # Ya está disponible en el backend
    }
  }
`;

const REMOVE_MEDICAMENTO = gql`
  mutation RemoveMedicamento($id: Int!) {
    removeMedicamento(id: $id)
  }
`;

// ==========================================
// 2. INTERFACE (Sincronizada)
// ==========================================
interface Medicamento {
  id_medicamento: number;
  nombre: string;
  principio_activo: string;
  presentacion: string;
  stock_farmacia: number; 
}

// ==========================================
// 3. MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
// ==========================================
const ModalEliminarMedicamento = ({ 
  isOpen, 
  medicamento, 
  onClose 
}: { 
  isOpen: boolean, 
  medicamento: Medicamento | null, 
  onClose: () => void 
}) => {
  const [removeMedicamento, { loading, error }] = useMutation(REMOVE_MEDICAMENTO, {
    refetchQueries: ['GetMedicamentos']
  });

  const handleDelete = async () => {
    if (!medicamento) return;
    try {
      await removeMedicamento({ variables: { id: medicamento.id_medicamento } });
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  if (!isOpen || !medicamento) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar del Catálogo?</h2>
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium">{medicamento.nombre}</p>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6">{medicamento.presentacion}</p>
        
        {error ? (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-bold mb-6 text-left">
            <span className="block mb-1 uppercase tracking-wider text-[10px]">Operación Denegada</span>
            {error.message}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-6 italic">
            "Esta acción solo es posible si el medicamento no tiene recetas previas vinculadas."
          </p>
        )}

        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">
            {error ? "Cerrar" : "Cancelar"}
          </Button>
          {!error && (
            <Button 
              onClick={handleDelete} 
              disabled={loading} 
              className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 flex items-center justify-center gap-2 font-bold"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sí, Eliminar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. VISTA PRINCIPAL
// ==========================================
export const MedicamentosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalNewOpen, setIsModalNewOpen] = useState(false);
  const [medAEditar, setMedAEditar] = useState<Medicamento | null>(null);
  const [medAEliminar, setMedAEliminar] = useState<Medicamento | null>(null);

  const { data, loading, error } = useQuery<{medicamentos: Medicamento[]}>(GET_MEDICAMENTOS);

  const filtered = data?.medicamentos?.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.principio_activo.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Pill className="text-[#3B82F6]" size={28}/> 
            Farmacia Clínica
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            Gestión de stock de medicamentos para prescripción y uso médico.
          </p>
        </div>
        <Button 
          variant="primary" 
          className="!px-6 shadow-lg shadow-blue-500/20" 
          onClick={() => setIsModalNewOpen(true)}
        >
          <Plus size={20} className="mr-2" /> Nuevo Medicamento
        </Button>
      </div>

      {/* Buscador */}
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm">
        <Input 
          icon={Search} 
          placeholder="Buscar por nombre o principio activo..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="bg-[#F8FAFC] dark:bg-[#0F172A]" 
        />
      </div>

      {/* Estados de Carga y Error */}
      {loading && !data && (
        <div className="py-20 flex flex-col items-center justify-center text-[#3B82F6]">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold text-[#64748B]">Consultando inventario de farmacia...</p>
        </div>
      )}
      
      {error && !data && (
        <div className="p-10 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-black/5">
          <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
          <p className="font-bold text-[#0F172A] dark:text-white">Error de Conexión</p>
          <p className="text-sm text-[#64748B] mt-1">{error.message}</p>
        </div>
      )}

      {/* Tabla de Resultados */}
      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto pb-4 -mb-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Medicamento</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Principio Activo</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Existencias</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filtered.length > 0 ? filtered.map((m) => {
                  const stock = m.stock_farmacia;
                  const bajoStock = stock <= 5;
                  
                  return (
                    <tr key={m.id_medicamento} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                            {m.nombre.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-[#0F172A] dark:text-white text-base block">{m.nombre}</span>
                            <span className="text-[10px] text-[#64748B] uppercase font-bold">{m.presentacion}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-slate-300 rounded-lg font-bold text-xs border border-black/5">
                          {m.principio_activo}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center gap-1.5 font-black text-xs px-2.5 py-1 rounded-full w-fit ${bajoStock ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200'}`}>
                            {bajoStock ? <AlertTriangle size={12}/> : <Package size={12}/>}
                            {stock} unidades
                          </span>
                          {bajoStock && <span className="text-[10px] text-amber-600 font-bold animate-pulse">Reabastecer pronto</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-1">
                        <button 
                          onClick={() => setMedAEditar(m)}
                          className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 rounded-xl transition-colors"
                        >
                          <Edit2 size={18}/>
                        </button>
                        <button 
                          onClick={() => setMedAEliminar(m)}
                          className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 rounded-xl transition-colors"
                        >
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-[#64748B]">
                      No hay medicamentos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      <NuevoMedicamentoModal 
        isOpen={isModalNewOpen} 
        onClose={() => setIsModalNewOpen(false)} 
      />
      <NuevoMedicamentoModal 
        isOpen={!!medAEditar} 
        medicamentoAEditar={medAEditar} 
        onClose={() => setMedAEditar(null)} 
      />
      <ModalEliminarMedicamento 
        isOpen={!!medAEliminar} 
        medicamento={medAEliminar} 
        onClose={() => setMedAEliminar(null)} 
      />

    </div>
  );
};