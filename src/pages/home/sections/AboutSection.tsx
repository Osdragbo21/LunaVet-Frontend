import React from 'react';
import { ShieldCheck, Heart, Activity, Award } from 'lucide-react';

export const AboutSection = () => {
  const pillars = [
    { icon: ShieldCheck, title: "Excelencia Médica", desc: "Protocolos rigurosos y diagnósticos precisos para cada caso." },
    { icon: Heart, title: "Empatía Animal", desc: "Fomentamos el respeto, el amor y el trato libre de miedo." },
    { icon: Activity, title: "Innovación Clínica", desc: "Equipos de laboratorio y quirófanos de última generación." },
    { icon: Award, title: "Atención Integral", desc: "Desde estética hasta hospitalización en un solo lugar." }
  ];

  return (
    <section id="conocenos" className="py-24 bg-[#FFFFFF] dark:bg-[#1E293B] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-4">Conócenos</h2>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-lg">
            Desde nuestra fundación, LunaVet se ha dedicado a brindar medicina de 
            calidad con calidez humana. Trabajamos día a día para mantener familias unidas y mascotas sanas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="p-10 rounded-[20px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 hover:border-[#3B82F6]/50 transition-colors">
            <h3 className="text-2xl font-bold mb-4 text-[#3B82F6]">Nuestra Misión</h3>
            <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Ofrecer servicios médicos veterinarios integrales y de excelencia, garantizando la salud y bienestar de los animales de compañía a través de un equipo médico altamente capacitado y tecnología de vanguardia.
            </p>
          </div>
          <div className="p-10 rounded-[20px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 hover:border-[#3B82F6]/50 transition-colors">
            <h3 className="text-2xl font-bold mb-4 text-[#3B82F6]">Nuestra Visión</h3>
            <p className="text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Ser la clínica veterinaria de referencia nacional por nuestra innovación médica, el trato compasivo hacia nuestros pacientes y la transparencia clínica con sus familias.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, index) => (
            <div key={index} className="p-8 rounded-[16px] bg-[#F8FAFC] dark:bg-[#0F172A] border border-black/5 dark:border-white/5 text-center flex flex-col items-center group hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-white dark:bg-[#1E293B] rounded-full flex items-center justify-center text-[#3B82F6] shadow-md mb-6 group-hover:scale-110 transition-transform">
                <item.icon size={28} />
              </div>
              <h4 className="font-bold text-lg mb-3">{item.title}</h4>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};