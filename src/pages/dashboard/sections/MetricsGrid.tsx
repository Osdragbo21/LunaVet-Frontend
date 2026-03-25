import React from 'react';
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

interface MetricsGridProps {
    metrics: {
        totalPacientesActivos: number;
        citasHoy: number;
        productosStockBajo: number;
        ingresosMes: number;
    }
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
    
    // Formateador de moneda para los ingresos
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
    };

    const stats = [
        { title: "Pacientes Activos", value: metrics.totalPacientesActivos, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Citas Hoy", value: metrics.citasHoy, icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Stock Bajo", value: metrics.productosStockBajo, icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-500/10" },
        { title: "Ingresos (Mes)", value: formatCurrency(metrics.ingresosMes), icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
            <div key={index} className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
                </div>
            </div>
            <div>
                <h3 className="text-3xl font-bold text-[#0F172A] dark:text-white mb-1">{stat.value}</h3>
                <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8]">{stat.title}</p>
            </div>
            </div>
        ))}
        </div>
    );
};