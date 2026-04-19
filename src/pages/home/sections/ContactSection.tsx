import React from 'react';
import { MapPin, Phone, Clock, Mail, Heart } from 'lucide-react';

export const ContactSection = () => {
  return (
    <section id="contacto" className="py-24 bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors border-t border-black/5 dark:border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Encabezado Principal */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-[#0F172A] dark:text-white">Estamos aquí para ayudarte</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-lg">
            Ya sea para agendar una revisión de rutina o atender una urgencia, no dudes en visitarnos o llamarnos. Tu mascota siempre estará en buenas manos.
          </p>
        </div>

        {/* Grid de 3 Tarjetas de Información */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Tarjeta 1: Dirección */}
          <div className="group bg-[#FFFFFF] dark:bg-[#1E293B] p-10 rounded-[24px] shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] mb-6 group-hover:scale-110 transition-transform duration-300">
              <MapPin size={32} />
            </div>
            <h4 className="font-bold text-xl mb-3 text-[#0F172A] dark:text-white">Visítanos</h4>
            <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Av. Cuidado Animal #123<br />
              Col. Centro, CP 50010
            </p>
          </div>

          {/* Tarjeta 2: Teléfono (Destacada) */}
          <div className="group bg-[#FFFFFF] dark:bg-[#1E293B] p-10 rounded-[24px] shadow-md border-2 border-rose-500/20 dark:border-rose-500/20 flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-2 md:hover:-translate-y-3 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6 relative z-10 group-hover:scale-110 transition-transform duration-300">
              <Phone size={32} />
            </div>
            <h4 className="font-bold text-xl mb-3 text-[#0F172A] dark:text-white relative z-10">Urgencias 24/7</h4>
            <p className="text-rose-600 dark:text-rose-400 text-xl font-black relative z-10 tracking-wide">
              (71) 2270-0602
            </p>
            {/* Decoración de fondo sutil */}
            <Heart size={160} className="absolute -bottom-10 -right-10 text-rose-500/5 rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
          </div>

          {/* Tarjeta 3: Horarios */}
          <div className="group bg-[#FFFFFF] dark:bg-[#1E293B] p-10 rounded-[24px] shadow-sm border border-black/5 dark:border-white/5 flex flex-col items-center text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Clock size={32} />
            </div>
            <h4 className="font-bold text-xl mb-3 text-[#0F172A] dark:text-white">Horario Regular</h4>
            <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Lunes a Viernes: 8:00 - 20:00<br />
              Sábados: 9:00 - 17:00
            </p>
          </div>

        </div>

        {/* Footer simple de contacto */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/5 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] text-sm font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer">
            <Mail size={16} />
            contacto@lunavet.com
          </div>
        </div>

      </div>
    </section>
  );
};