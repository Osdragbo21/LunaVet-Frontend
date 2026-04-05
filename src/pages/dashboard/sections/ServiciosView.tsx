import React, { useState } from 'react';
import { Award, Plus, Search, Loader2, Edit2, Trash2, AlertTriangle, X } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

import { useQuery, useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

import { NuevoServicioModal } from '../components/NuevoServicioModal';

const GET_SERVICIOS = gql`
  query GetServicios {
    servicios {
      id_servicio
      nombre_servicio
      descripcion
      costo_base
    }
  }
`;

const REMOVE_SERVICIO = gql`
  mutation RemoveServicio($id: Int!) {
    removeServicio(id: $id)
  }
`;

interface Servicio {
  id_servicio: number;
  nombre_servicio: string;
  descripcion: string;
  costo_base: number;
}

const ModalEliminarServicio = ({ isOpen, servicio, onClose }: { isOpen: boolean, servicio: Servicio | null, onClose: () => void }) => {
  const [removeServicio, { loading, error }] = useMutation(REMOVE_SERVICIO, {
    refetchQueries: ['GetServicios']
  });

  const handleDelete = async () => {
    if (!servicio) return;
    try {
      await removeServicio({ variables: { id: servicio.id_servicio } });
      onClose();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  if (!isOpen || !servicio) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 p-6 text-center">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-4">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#0F172A] dark:text-white mb-2">¿Eliminar Servicio?</h2>
        <p className="text-[#64748B] dark:text-[#94A3B8] mb-6 font-medium">{servicio.nombre_servicio}</p>
        
        {error ? (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-sm font-bold mb-6 text-left">
            <span className="block mb-1 uppercase tracking-wider text-[10px]">Operación Denegada</span>
            {error.message}
          </div>
        ) : (
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-6 italic">
            "Esta acción no se completará si el servicio ya ha sido facturado en alguna venta previa por temas contables."
          </p>
        )}

        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-1/2">
            {error ? "Cerrar" : "Cancelar"}
          </Button>
          {!error && (
            <Button onClick={handleDelete} disabled={loading} className="w-1/2 bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30 flex items-center justify-center gap-2 font-bold">
              {loading ? <Loader2 size={18} className="animate-spin" /> : "Sí, Eliminar"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export const ServiciosView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalNewOpen, setIsModalNewOpen] = useState(false);
  const [servicioAEditar, setServicioAEditar] = useState<Servicio | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);

  const { data, loading, error } = useQuery<{servicios: Servicio[]}>(GET_SERVICIOS);

  const filtered = data?.servicios?.filter(s => 
    s.nombre_servicio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.descripcion && s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <Award className="text-[#3B82F6]" size={28}/> 
            Catálogo de Servicios
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">
            Administra los servicios clínicos, de estética y sus costos base.
          </p>
        </div>
        <Button variant="primary" className="!px-6 shadow-lg shadow-blue-500/20" onClick={() => setIsModalNewOpen(true)}>
          <Plus size={20} className="mr-2" /> Nuevo Servicio
        </Button>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 shadow-sm">
        <Input 
          icon={Search} 
          placeholder="Buscar servicio por nombre..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="bg-[#F8FAFC] dark:bg-[#0F172A]" 
        />
      </div>

      {loading && !data && (
        <div className="py-20 flex flex-col items-center justify-center text-[#3B82F6]">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-bold text-[#64748B]">Cargando servicios...</p>
        </div>
      )}
      
      {error && !data && (
        <div className="p-10 text-center bg-white dark:bg-[#1E293B] rounded-3xl border border-black/5">
          <AlertTriangle size={48} className="mx-auto text-amber-500 mb-4" />
          <p className="font-bold text-[#0F172A] dark:text-white">Error de Conexión</p>
          <p className="text-sm text-[#64748B] mt-1">{error.message}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="overflow-x-auto pb-4 -mb-4">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-black/5 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Servicio</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] w-1/2">Descripción</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8]">Costo Base</th>
                  <th className="px-6 py-4 font-bold text-[#64748B] dark:text-[#94A3B8] text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filtered.length > 0 ? filtered.map((servicio) => (
                  <tr key={servicio.id_servicio} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center shadow-inner">
                          <Award size={20}/>
                        </div>
                        <span className="font-bold text-[#0F172A] dark:text-white text-base">{servicio.nombre_servicio}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#64748B] dark:text-[#94A3B8] font-medium whitespace-normal max-w-xl">
                        {servicio.descripcion || <span className="italic opacity-50">Sin descripción registrada</span>}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
                        ${servicio.costo_base?.toFixed(2) || '0.00'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                      <button 
                        onClick={() => setServicioAEditar(servicio)}
                        className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 rounded-xl transition-colors"
                        title="Editar Servicio"
                      >
                        <Edit2 size={18}/>
                      </button>
                      <button 
                        onClick={() => setServicioAEliminar(servicio)}
                        className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 rounded-xl transition-colors"
                        title="Eliminar de Catálogo"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center opacity-50">
                        <Award size={48} className="mb-4 text-[#64748B]"/>
                        <p className="text-[#64748B] dark:text-[#94A3B8] text-lg font-bold">No se encontraron servicios</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales de Gestión */}
      <NuevoServicioModal isOpen={isModalNewOpen} onClose={() => setIsModalNewOpen(false)} />
      <NuevoServicioModal isOpen={!!servicioAEditar} servicioAEditar={servicioAEditar} onClose={() => setServicioAEditar(null)} />
      <ModalEliminarServicio isOpen={!!servicioAEliminar} servicio={servicioAEliminar} onClose={() => setServicioAEliminar(null)} />

    </div>
  );
};