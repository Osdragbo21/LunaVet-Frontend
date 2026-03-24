import React from 'react';
import { CalendarCheck, PawPrint, Stethoscope, ShieldCheck } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export const ProcessSection = () => {
    const steps = [
        { step: "PASO 1", title: "Cita", desc: "Agenda por teléfono o web seleccionando el servicio.", icon: CalendarCheck },
        { step: "PASO 2", title: "Recepción", desc: "Creamos el expediente de tu mascota en el sistema.", icon: PawPrint },
        { step: "PASO 3", title: "Evaluación", desc: "Nuestros médicos realizan un chequeo general exhaustivo.", icon: Stethoscope },
        { step: "PASO 4", title: "Tratamiento", desc: "Recibes la receta digital o el tratamiento en clínica.", icon: ShieldCheck }
    ];

    return (
        <section className="py-24 bg-[#FFFFFF] dark:bg-[#1E293B] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4">¿Cómo funciona?</h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-lg">
                El proceso de atención en LunaVet es ágil y transparente. Sigue estos pasos para que tu mascota reciba la mejor atención.
            </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-0.5 bg-black/5 dark:bg-white/5 z-0"></div>
            
            {steps.map((item, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[#F8FAFC] dark:bg-[#0F172A] border-[6px] border-[#FFFFFF] dark:border-[#1E293B] rounded-full flex items-center justify-center text-[#3B82F6] shadow-md mb-6">
                    <item.icon size={32} />
                </div>
                <span className="text-xs font-bold text-[#3B82F6] tracking-widest mb-2">{item.step}</span>
                <h4 className="font-bold text-xl mb-2">{item.title}</h4>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">{item.desc}</p>
                </div>
            ))}
            </div>

            <div className="mt-16 flex justify-center">
            <Button variant="outline">Solicitar Información</Button>
            </div>
        </div>
        </section>
    );
};
