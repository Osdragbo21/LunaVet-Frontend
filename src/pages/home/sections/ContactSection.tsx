import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import { Textarea } from '../../../components/ui/Textarea';
import { Button } from '../../../components/ui/Button';

export const ContactSection = () => {
  return (
    <section id="contacto" className="py-24 bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors border-t border-black/5 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Contacto</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-lg">
            ¿Tienes preguntas o una emergencia? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-8 rounded-[24px] shadow-sm border border-black/5 dark:border-white/5">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input type="text" placeholder="Nombre completo" />
                <Input type="email" placeholder="Correo electrónico" />
              </div>
              <Input type="tel" placeholder="Teléfono" />
              <Textarea rows={4} placeholder="Escribe tu mensaje..." />
              <Button type="button" className="w-full">
                Enviar Mensaje
              </Button>
            </form>
          </div>

          <div className="flex flex-col gap-8 justify-between">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Dirección</h4>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">Av. Cuidado Animal #123, Col. Centro, CP 12345</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Teléfono Urgencias</h4>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">(55) 1234-5678</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6] shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Correo</h4>
                  <p className="text-[#64748B] dark:text-[#94A3B8]">contacto@lunavet.com.mx</p>
                </div>
              </div>
            </div>

            <div className="h-48 rounded-[24px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/5 overflow-hidden relative">
              <span className="text-slate-500 font-medium z-10">Mapa Interactivo — Próximamente</span>
              <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'url([https://www.transparenttextures.com/patterns/graphy.png](https://www.transparenttextures.com/patterns/graphy.png))'}}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
