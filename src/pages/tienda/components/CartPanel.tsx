import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2, CheckCircle, AlertTriangle, Clock, Store } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { CartItem } from '../hooks/useTienda';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: number, delta: number) => void;
  removeFromCart: (id: number) => void;
  total: number;
  checkout: () => void;
  isCheckingOut: boolean;
  checkoutError: any;
  successOrder: number | null;
  setSuccessOrder: (val: number | null) => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  isOpen, onClose, cart, updateQuantity, removeFromCart, total, checkout, isCheckingOut, checkoutError, successOrder, setSuccessOrder
}) => {

  // TRUCO: Congelamos el total para que no se ponga en $0.00 cuando se vacíe el carrito
  const [frozenTotal, setFrozenTotal] = useState(total);

  useEffect(() => {
    if (!successOrder) {
      setFrozenTotal(total);
    }
  }, [total, successOrder]);

  const handleClose = () => {
    if (successOrder) setSuccessOrder(null);
    onClose();
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[60] transition-opacity ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} onClick={handleClose}></div>

      <div className={`fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#FFFFFF] dark:bg-[#1E293B] shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="px-6 py-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-[#F8FAFC] dark:bg-[#0F172A] shrink-0">
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <ShoppingBag className="text-[#3B82F6]" size={24}/> Tu Carrito
          </h2>
          <button onClick={handleClose} className="p-2 bg-black/5 dark:bg-white/5 rounded-full text-[#64748B] hover:text-rose-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          
          {successOrder ? (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle size={40} />
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-white mb-2">¡Pedido Generado!</h3>
              <p className="text-[#64748B] dark:text-[#94A3B8] mb-6 font-medium">
                Tu orden <strong>#{successOrder}</strong> ha sido enviada a la clínica.
              </p>
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl mb-6 text-sm text-amber-700 dark:text-amber-400 flex flex-col gap-2">
                <div className="flex items-center justify-center gap-1.5 font-bold"><Store size={16}/> Pago en Mostrador</div>
                {/* AQUÍ ESTÁ LA MAGIA: Usamos frozenTotal */}
                <p>Por favor, acude a la clínica para realizar el pago de <strong className="text-lg">${frozenTotal.toFixed(2)}</strong> y recoger tus productos.</p>
              </div>
              <Button variant="outline" onClick={handleClose}>Continuar Explorando</Button>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <ShoppingBag size={64} className="mb-4 text-[#64748B] dark:text-[#94A3B8]"/>
              <p className="font-bold text-lg text-[#0F172A] dark:text-white mb-1">El carrito está vacío</p>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Agrega productos del catálogo para continuar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checkoutError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg text-sm font-medium flex gap-2 items-start mb-4">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p>{checkoutError.message}</p>
                </div>
              )}

              {cart.map((item) => (
                <div key={item.id_producto} className="flex items-center gap-4 bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-2xl border border-black/5 dark:border-white/5">
                  <img src={item.imagen_url || ''} alt={item.nombre} className="w-16 h-16 rounded-xl object-cover bg-white" onError={(e:any) => { e.target.src = "https://placehold.co/100?text=Img"; }}/>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] dark:text-white text-sm truncate mb-1">{item.nombre}</p>
                    <p className="text-sm font-black text-[#3B82F6]">${item.precio_venta.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeFromCart(item.id_producto)} className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 p-1 rounded-md transition-colors"><Trash2 size={16} /></button>
                    
                    <div className="flex items-center gap-2 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-lg px-1 py-0.5 border border-black/5 dark:border-white/5">
                      <button onClick={() => updateQuantity(item.id_producto, -1)} className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"><Minus size={14} /></button>
                      <span className="w-4 text-center text-sm font-bold text-[#0F172A] dark:text-white">{item.cantidad}</span>
                      <button onClick={() => updateQuantity(item.id_producto, 1)} disabled={item.cantidad >= item.stock_actual} className="w-6 h-6 flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:hover:text-white disabled:opacity-30 transition-colors"><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer del Carrito */}
        {!successOrder && cart.length > 0 && (
          <div className="p-6 bg-[#F8FAFC] dark:bg-[#0F172A] border-t border-black/5 dark:border-white/5 shrink-0 space-y-4">
            <div className="flex justify-between items-center text-[#64748B] dark:text-[#94A3B8] text-sm">
              <span>Subtotal estimado</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-[#0F172A] dark:text-white text-lg">Total a pagar en sucursal</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">${total.toFixed(2)}</span>
            </div>

            <Button variant="primary" onClick={checkout} disabled={isCheckingOut} className="w-full shadow-lg shadow-[#3B82F6]/20 flex items-center justify-center gap-2 !py-4">
              {isCheckingOut ? <Loader2 size={20} className="animate-spin" /> : <><ShoppingBag size={20}/> Generar Pedido</>}
            </Button>
            <p className="text-center text-[10px] text-[#64748B] flex items-center justify-center gap-1 uppercase tracking-wider font-bold">
              <Clock size={12}/> Preparación y cobro en clínica
            </p>
          </div>
        )}
      </div>
    </>
  );
};