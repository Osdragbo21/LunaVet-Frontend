import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, ShieldCheck, Edit2, Loader2, CheckCircle, Save, AlertTriangle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Label } from '../../../components/ui/Label';
import { Textarea } from '../../../components/ui/Textarea';

import { useQuery, useMutation, useApolloClient } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// 1. QUERIES Y MUTACIONES (Exactamente idénticas a las del Dashboard)
const GET_CLIENTES_DIRECTORIO = gql`
  query GetClientesDirectorio {
    clientes {
      id_cliente
      nombre_completo
      telefono_principal
      direccion
      usuario {
        id_usuario
        username
        activo
      }
    }
  }
`;

const UPDATE_CLIENTE = gql`
  mutation UpdateCliente($input: UpdateClienteInput!) {
    updateCliente(updateClienteInput: $input) {
      id_cliente
      nombre_completo
      telefono_principal
      direccion
    }
  }
`;

// 2. INTERFACES
interface PerfilCliente {
  id_cliente: number;
  nombre_completo: string;
  telefono_principal: string;
  direccion: string;
  usuario: {
    id_usuario: number;
    username: string;
    activo: boolean;
  };
}

interface MiPerfilModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiPerfilModal: React.FC<MiPerfilModalProps> = ({ isOpen, onClose }) => {
  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const apolloClient = useApolloClient();

  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono_principal: '',
    direccion: ''
  });

  // Query idéntica a la del Dashboard
  const { data, loading, error } = useQuery<{ clientes: PerfilCliente[] }>(GET_CLIENTES_DIRECTORIO, {
    skip: !isOpen || !currentUser,
    fetchPolicy: 'cache-and-network'
  });

  const [updatePerfil, { loading: isSaving, error: saveError }] = useMutation(UPDATE_CLIENTE, {
    refetchQueries: ['GetClientesDirectorio']
  });

  const miPerfil = data?.clientes?.find(c => c.usuario?.id_usuario === currentUser?.id_usuario);

  // Sincronizar datos al abrir/cargar
  useEffect(() => {
    if (miPerfil && !isEditing) {
      setFormData({
        nombre_completo: miPerfil.nombre_completo || '',
        telefono_principal: miPerfil.telefono_principal || '',
        direccion: miPerfil.direccion || ''
      });
    }
  }, [miPerfil, isEditing, isOpen]);

  // Manejar edición
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!miPerfil) return;

    try {
      await updatePerfil({
        variables: {
          input: {
            id_cliente: miPerfil.id_cliente,
            nombre_completo: formData.nombre_completo.trim(),
            telefono_principal: formData.telefono_principal.trim(),
            direccion: formData.direccion.trim()
          }
        }
      });
      
      await apolloClient.refetchQueries({ include: "active" });

      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setIsEditing(false);
      }, 2000);

    } catch (err) {
      // El error se maneja visualmente a través del saveError de useMutation
      console.error("Error capturado por el cliente:", err);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={handleClose}>
      <div className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        
        {/* Header Decorativo (Se agregó mb-12 para dar espacio al avatar) */}
        <div className="relative h-28 bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] shrink-0 mb-12">
          <button onClick={handleClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors backdrop-blur-sm z-10">
            <X size={20} />
          </button>
          
          {/* Avatar Flotante (Movido aquí para evitar el recorte del overflow-y-auto) */}
          {miPerfil && (
            <div className="absolute -bottom-10 left-8 w-20 h-20 rounded-full border-4 border-[#FFFFFF] dark:border-[#1E293B] flex items-center justify-center font-bold text-3xl shadow-md bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 z-20">
              {miPerfil.nombre_completo.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Contenedor scrolleable */}
        <div className="px-8 pb-8 pt-0 relative flex-1 overflow-y-auto custom-scrollbar">
          
          {loading && !miPerfil ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#3B82F6]" size={40} /></div>
          ) : error && !miPerfil ? (
            <div className="text-center py-10 text-rose-500 font-bold mt-10">Error al cargar tu perfil.</div>
          ) : miPerfil ? (
            <>
              {/* Botón de Editar Superior */}
              <div className="flex justify-end mb-2">
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-sm font-bold text-[#64748B] dark:text-[#94A3B8] transition-colors"
                  >
                    <Edit2 size={14} /> Editar Información
                  </button>
                )}
              </div>

              {/* Títulos Principales */}
              <div className="mb-6 border-b border-black/5 dark:border-white/5 pb-4">
                <h2 className="text-2xl font-extrabold text-[#0F172A] dark:text-white leading-none mb-1">
                  {isEditing ? 'Actualizar Mis Datos' : miPerfil.nombre_completo}
                </h2>
                {!isEditing && (
                  <p className="text-[#3B82F6] font-bold flex items-center gap-1.5 text-sm">
                    <User size={14} /> @{miPerfil.usuario.username}
                  </p>
                )}
              </div>

              {/* Alertas con captura elegante de errores del backend */}
              {saveError && (
                <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
                  <AlertTriangle size={20} className="shrink-0 mt-0.5 text-amber-500" />
                  <div>
                    <span className="font-bold block mb-1">Aviso del Servidor:</span>
                    {(saveError.message.includes('Unknown type') || saveError.message.includes('Cannot query field'))
                      ? "El equipo de Backend aún no habilita la función para editar clientes. Por favor, notifícalo para que lo agreguen."
                      : saveError.message}
                  </div>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-emerald-200 animate-in zoom-in duration-300">
                  <CheckCircle size={18} /> ¡Información actualizada correctamente!
                </div>
              )}

              {/* Tarjeta Visual (Modo Lectura) */}
              {!isEditing ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">Teléfono Principal</p>
                      <p className="font-bold text-[#0F172A] dark:text-white text-lg">{miPerfil.telefono_principal}</p>
                    </div>
                  </div>

                  <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">Dirección de Envío</p>
                      <p className="font-medium text-[#0F172A] dark:text-white leading-relaxed">{miPerfil.direccion}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-2 justify-center bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-bold">Cuenta verificada y protegida</span>
                  </div>
                </div>
              ) : (
                /* Formulario (Modo Edición) */
                <form id="editPerfilForm" onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <Label>Nombre Completo</Label>
                    <Input 
                      name="nombre_completo" 
                      value={formData.nombre_completo} 
                      onChange={handleChange} 
                      icon={User} 
                      required 
                      disabled={isSaving || successMsg}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono de Contacto</Label>
                    <Input 
                      name="telefono_principal" 
                      type="tel" 
                      value={formData.telefono_principal} 
                      onChange={handleChange} 
                      icon={Phone} 
                      required 
                      disabled={isSaving || successMsg}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Dirección Completa</Label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-[#64748B] dark:text-[#94A3B8]">
                        <MapPin size={20} />
                      </div>
                      <Textarea 
                        name="direccion" 
                        value={formData.direccion} 
                        onChange={handleChange} 
                        rows={3} 
                        className="pl-11"
                        required 
                        disabled={isSaving || successMsg}
                      />
                    </div>
                  </div>
                </form>
              )}
            </>
          ) : (
             <div className="text-center py-10 opacity-60">Perfil no encontrado.</div>
          )}
        </div>

        {/* Footer (Solo visible en modo edición) */}
        {isEditing && (
          <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex justify-end gap-3 bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving || successMsg} className="text-sm !py-2">Cancelar</Button>
            <Button type="submit" form="editPerfilForm" variant="primary" disabled={isSaving || successMsg} className="text-sm !py-2 flex items-center gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar Cambios
            </Button>
          </div>
        )}

      </div>
    </div>
  );
};