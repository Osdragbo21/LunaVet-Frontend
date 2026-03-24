import React from 'react';
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

export const MetricsGrid = () => {
  // Estos datos vendrán luego de tu Base de Datos (Mapeo de tu Diagrama ER)
    const stats = [
        { title: "Pacientes Activos", value: "1,248", icon: Users, trend: "+12%", color: "text-blue-500", bg: "bg-blue-500/10" },
        { title: "Citas Hoy", value: "24", icon: Calendar, trend: "5 pendientes", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { title: "Stock Bajo", value: "12", icon: AlertCircle, trend: "Revisar", color: "text-rose-500", bg: "bg-rose-500/10" },
        { title: "Ingresos (Mes)", value: "$45k", icon: TrendingUp, trend: "+8.5%", color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
            <div key={index} className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${stat.bg} ${stat.color}`}>
                {stat.trend}
                </span>
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