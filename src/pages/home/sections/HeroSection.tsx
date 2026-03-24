import React from 'react';
import { PawPrint } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const HeroSection = () => {
  return (
    <section id="inicio" className="relative pt-20 lg:pt-0 min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="Cats_form3.jpeg" 
          alt="Clínica Veterinaria" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC]/90 via-[#F8FAFC]/70 to-transparent dark:from-[#0F172A]/95 dark:via-[#0F172A]/80 dark:to-transparent"></div>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-[#3B82F6] rounded-full blur-sm animate-pulse" style={{ animationDuration: '3s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-6 h-6 bg-[#3B82F6]/60 rounded-full blur-md animate-ping" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-white rounded-full blur-[2px] animate-bounce" style={{ animationDuration: '5s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center justify-between gap-12 mt-12 lg:mt-0">
        <div className="w-full lg:w-1/2 flex flex-col items-start">
          <div className="bg-white/60 dark:bg-[#1E293B]/60 backdrop-blur-xl p-8 lg:p-12 rounded-[24px] border border-white/20 shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] text-sm font-bold mb-6">
              <PawPrint size={16} /> Clínica Veterinaria Integral
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6 text-[#0F172A] dark:text-white">
              Cuidamos a tu mejor amigo como si <br className="hidden lg:block"/>
              <span className="text-[#3B82F6]">fuera nuestro.</span>
            </h1>
            <p className="text-lg text-[#64748B] dark:text-[#94A3B8] mb-8 font-medium">
              En LunaVet cultivamos la salud, el bienestar y el amor por los animales a través de medicina veterinaria de excelencia y trato humano.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary">Agendar Cita</Button>
              <Button variant="outline">Conócenos</Button>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center relative">
          <div className="relative w-72 h-72 lg:w-[450px] lg:h-[450px]">
            <div className="absolute -inset-10 rounded-full blur-[60px] bg-[#3B82F6]/30 dark:bg-[#3B82F6]/40 animate-pulse"></div>
            <img 
              src="Cat_warm.jpeg" 
              alt="Doctora LunaVet" 
              className="relative z-10 w-full h-full object-cover rounded-full border-8 border-white dark:border-[#1E293B] shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
