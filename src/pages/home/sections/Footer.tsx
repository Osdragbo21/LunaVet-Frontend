import React from 'react';
import { Clock, Activity } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#F8FAFC] dark:bg-[#0F172A] py-12 border-t border-black/10 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img src="/Logo_LunaVet.png" alt="LunaVet Logo" className="w-8 h-8 object-contain" onError={(e: any) => { e.target.onerror = null; e.target.src = "[https://cdn-icons-png.flaticon.com/512/1864/1864509.png](https://cdn-icons-png.flaticon.com/512/1864/1864509.png)"; }} />
            <span className="font-bold text-xl text-[#0F172A] dark:text-white">LunaVet</span>
          </div>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Formando familias felices y mascotas sanas con excelencia médica y valores humanos.
          </p>
        </div>
        
        <div>
          <h4 className="font-bold mb-4 text-[#0F172A] dark:text-white">Enlaces Rápidos</h4>
          <ul className="space-y-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            <li><a href="#inicio" className="hover:text-[#3B82F6]">Inicio</a></li>
            <li><a href="#conocenos" className="hover:text-[#3B82F6]">Conócenos</a></li>
            <li><a href="#servicios" className="hover:text-[#3B82F6]">Servicios Médicos</a></li>
            <li><a href="#contacto" className="hover:text-[#3B82F6]">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-[#0F172A] dark:text-white">Horario de Atención</h4>
          <ul className="space-y-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            <li className="flex items-center gap-2"><Clock size={16} /> Lunes a Viernes: 8:00 AM - 8:00 PM</li>
            <li className="flex items-center gap-2"><Clock size={16} /> Sábados: 9:00 AM - 5:00 PM</li>
            <li className="flex items-center gap-2 text-rose-500"><Activity size={16} /> Urgencias 24/7</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
