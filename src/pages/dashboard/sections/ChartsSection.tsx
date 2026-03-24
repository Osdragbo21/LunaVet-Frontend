import React from 'react';

export const ChartsSection = () => {
  // Datos simulados de la DB
    const barData = [
        { label: 'Ene', h: 'h-[40%]', val: '120' },
        { label: 'Feb', h: 'h-[60%]', val: '180' },
        { label: 'Mar', h: 'h-[45%]', val: '140' },
        { label: 'Abr', h: 'h-[80%]', val: '240' },
        { label: 'May', h: 'h-[65%]', val: '190' },
        { label: 'Jun', h: 'h-[90%]', val: '280', active: true }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Barras Simulada (Citas por Mes - Tabla 'citas') */}
        <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Flujo de Consultas</h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Últimos 6 meses</p>
            </div>
            <button className="text-sm font-medium text-[#3B82F6] hover:underline">Ver reporte</button>
            </div>
            
            <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-8 pt-4">
            {barData.map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md">
                    {bar.val}
                </div>
                <div className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ease-out ${bar.h} ${bar.active ? 'bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-[#E2E8F0] dark:bg-[#334155] hover:bg-[#94A3B8] dark:hover:bg-[#475569]'}`}></div>
                <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">{bar.label}</span>
                </div>
            ))}
            </div>
        </div>

        {/* Gráfica de Donut Simulada (Especies - Tabla 'pacientes') */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Pacientes por Especie</h3>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-8">Distribución actual</p>
            
            <div className="flex-1 flex flex-col items-center justify-center">
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" style={{ background: 'conic-gradient(#3B82F6 0% 55%, #10B981 55% 85%, #F59E0B 85% 100%)' }}>
                <div className="absolute w-28 h-28 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-full flex items-center justify-center shadow-sm">
                <div className="text-center">
                    <p className="text-2xl font-bold text-[#0F172A] dark:text-white">1.2k</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Total</p>
                </div>
                </div>
            </div>

            <div className="w-full mt-8 space-y-3">
                <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span>
                    <span className="font-medium text-[#0F172A] dark:text-white">Perros</span>
                </div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">55%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                    <span className="font-medium text-[#0F172A] dark:text-white">Gatos</span>
                </div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">30%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                    <span className="font-medium text-[#0F172A] dark:text-white">Exóticos</span>
                </div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">15%</span>
                </div>
            </div>
            </div>
        </div>

        </div>
    );
};
