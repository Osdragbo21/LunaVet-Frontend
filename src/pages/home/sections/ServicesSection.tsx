import React, { useState } from 'react';
import { Stethoscope, Syringe, Scissors, Activity } from 'lucide-react';

const servicesData = {
    consultas: {
        title: "Consultas Generales y Especialidad",
        subtitle: "Atención preventiva y diagnósticos precisos.",
        desc: "Evaluación completa del estado de salud de tu mascota en un ambiente libre de estrés. Contamos con especialistas en dermatología, cardiología y nutrición.",
        points: ["Revisión física completa", "Control de peso y dieta", "Diagnóstico temprano", "Especialistas certificados"]
    },
    vacunas: {
        title: "Esquema de Vacunación",
        subtitle: "Protección desde el primer día.",
        desc: "Aplicación de vacunas esenciales para cachorros y refuerzos anuales para adultos. Llevamos el control exacto en nuestra cartilla digital LunaVet.",
        points: ["Vacuna Múltiple / Rabia", "Desparasitación interna", "Prevención de pulgas y garrapatas", "Recordatorios automáticos"]
    },
    cirugias: {
        title: "Cirugías y Hospitalización",
        subtitle: "Quirófano equipado con tecnología de punta.",
        desc: "Realizamos desde esterilizaciones de rutina hasta procedimientos quirúrgicos complejos, con monitoreo continuo y área de recuperación especializada.",
        points: ["Esterilización segura", "Anestesia inhalada", "Monitoreo 24/7", "Cuidados intensivos"]
    },
    estetica: {
        title: "Estética y Spa Canino/Felino",
        subtitle: "Higiene y belleza para tu mejor amigo.",
        desc: "Baños terapéuticos, cortes de raza, limpieza dental sin anestesia y corte de uñas, realizados por estilistas profesionales que aman a los animales.",
        points: ["Cortes especializados", "Baños medicados", "Limpieza de oídos", "Tratamiento anti-nudos"]
    }
    };

    type TabKey = keyof typeof servicesData;

    export const ServicesSection = () => {
    const [activeTab, setActiveTab] = useState<TabKey>('consultas');

    const tabs: { id: TabKey, icon: React.ElementType, label: string }[] = [
        { id: 'consultas', icon: Stethoscope, label: 'Consultas' },
        { id: 'vacunas', icon: Syringe, label: 'Vacunación' },
        { id: 'cirugias', icon: Activity, label: 'Cirugías' },
        { id: 'estetica', icon: Scissors, label: 'Estética' }
    ];

    return (
        <section id="servicios" className="py-24 bg-[#F8FAFC] dark:bg-[#0F172A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold mb-4">Nuestros Servicios</h2>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-lg">
                Acompañamos a tus mascotas en cada etapa de su vida con programas médicos diseñados para sus necesidades.
            </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
            {tabs.map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
                    ${activeTab === tab.id 
                    ? 'bg-[#3B82F6] text-white shadow-lg' 
                    : 'bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                <tab.icon size={18} /> {tab.label}
                </button>
            ))}
            </div>

            <div className="max-w-4xl mx-auto bg-white dark:bg-[#1E293B] rounded-[24px] p-8 lg:p-12 shadow-sm border border-black/5 dark:border-white/5 transition-all">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#3B82F6]/10 rounded-full flex items-center justify-center text-[#3B82F6]">
                {activeTab === 'consultas' && <Stethoscope size={32} />}
                {activeTab === 'vacunas' && <Syringe size={32} />}
                {activeTab === 'cirugias' && <Activity size={32} />}
                {activeTab === 'estetica' && <Scissors size={32} />}
                </div>
                <div>
                <h3 className="text-2xl font-bold">{servicesData[activeTab].title}</h3>
                <p className="text-[#3B82F6] font-medium">{servicesData[activeTab].subtitle}</p>
                </div>
            </div>
            
            <p className="text-[#64748B] dark:text-[#94A3B8] mb-8 leading-relaxed text-lg">
                {servicesData[activeTab].desc}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesData[activeTab].points.map((point, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#3B82F6]"></div>
                    <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">{point}</span>
                </div>
                ))}
            </div>
            </div>
        </div>
        </section>
    );
};