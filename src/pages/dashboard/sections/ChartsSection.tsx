import React from 'react';

interface ChartItem {
    label: string;
    value: number;
}

interface ChartsSectionProps {
    graficaCitas: ChartItem[];
    graficaEspecies: ChartItem[];
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({ graficaCitas, graficaEspecies }) => {
    
    // 1. Lógica Gráfica de Barras (Encontrar el valor máximo para calcular la altura en %)
    const maxCitas = Math.max(...graficaCitas.map(item => item.value), 1); // Evitar división por cero

    // 2. Lógica Gráfica de Dona (Calcular gradiente cónico dinámico)
    const totalPacientes = graficaEspecies.reduce((acc, curr) => acc + curr.value, 0);
    
    // Colores de identidad JOZ Team para especies
    const coloresEspecies = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']; 
    
    let currentPercentage = 0;
    const gradientStops = graficaEspecies.map((especie, index) => {
        const percentage = (especie.value / totalPacientes) * 100;
        const start = currentPercentage;
        const end = currentPercentage + percentage;
        currentPercentage = end;
        return `${coloresEspecies[index % coloresEspecies.length]} ${start}% ${end}%`;
    }).join(', ');

    const conicGradient = `conic-gradient(${gradientStops})`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica de Barras Dinámica */}
        <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex justify-between items-center mb-6">
            <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Flujo de Consultas</h3>
                <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Últimos 6 meses</p>
            </div>
            </div>
            
            <div className="h-64 flex items-end gap-2 sm:gap-4 md:gap-8 pt-4">
            {graficaCitas.map((bar, i) => {
                const heightPercent = (bar.value / maxCitas) * 100;
                const isLast = i === graficaCitas.length - 1; // Resaltar el mes actual
                
                return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                    <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md z-10">
                    {bar.value}
                    </div>
                    {/* Altura inyectada dinámicamente vía estilo en línea */}
                    <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-lg transition-all duration-500 ease-out min-h-[4px] 
                    ${isLast ? 'bg-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-[#E2E8F0] dark:bg-[#334155] hover:bg-[#94A3B8] dark:hover:bg-[#475569]'}`}
                    ></div>
                    <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">{bar.label}</span>
                </div>
                );
            })}
            </div>
        </div>

        {/* Gráfica de Donut Dinámica */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Pacientes por Especie</h3>
            <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-8">Distribución actual</p>
            
            <div className="flex-1 flex flex-col items-center justify-center">
            {/* El gradiente se arma con la matemática calculada arriba */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner" style={{ background: conicGradient }}>
                <div className="absolute w-28 h-28 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-full flex items-center justify-center shadow-sm">
                <div className="text-center">
                    <p className="text-2xl font-bold text-[#0F172A] dark:text-white">{totalPacientes}</p>
                    <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Total</p>
                </div>
                </div>
            </div>

            <div className="w-full mt-8 space-y-3">
                {graficaEspecies.map((especie, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: coloresEspecies[idx % coloresEspecies.length] }}></span>
                    <span className="font-medium text-[#0F172A] dark:text-white">{especie.label}</span>
                    </div>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">
                    {Math.round((especie.value / totalPacientes) * 100)}%
                    </span>
                </div>
                ))}
            </div>
            </div>
        </div>

        </div>
    );
};