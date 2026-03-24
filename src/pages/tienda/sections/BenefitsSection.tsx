import React from 'react';
import { ShieldCheck, Clock, MapPin } from 'lucide-react';

export const BenefitsSection = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[#3B82F6] shrink-0">
            <Clock size={24} />
            </div>
            <div>
            <h4 className="font-bold text-[#0F172A] dark:text-white">Recoge en 2 horas</h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Cómpralo ahora y pasa por él.</p>
            </div>
        </div>
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
            <ShieldCheck size={24} />
            </div>
            <div>
            <h4 className="font-bold text-[#0F172A] dark:text-white">Garantía Clínica</h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Productos recomendados por vet.</p>
            </div>
        </div>
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-4 rounded-[16px] border border-black/5 dark:border-white/5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
            <MapPin size={24} />
            </div>
            <div>
            <h4 className="font-bold text-[#0F172A] dark:text-white">Clínica Matriz</h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Av. Cuidado Animal #123.</p>
            </div>
        </div>
        </div>
    );
};
