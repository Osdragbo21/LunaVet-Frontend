import React, { useMemo, useState } from 'react';
import { 
  BarChart2, TrendingUp, DollarSign, ShoppingCart, 
  CreditCard, Banknote, Smartphone, Store, Globe, Loader2, Calendar, Receipt
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';

import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

// Reutilizamos la misma query del Historial para que cargue instantáneamente desde la caché
const GET_HISTORIAL_VENTAS = gql`
  query GetHistorialVentas {
    ventas {
      id_venta
      fecha_venta
      total
      metodo_pago
      tipo_venta
      estado_pedido
      detalles {
        cantidad
      }
    }
  }
`;

interface Venta {
  id_venta: number;
  fecha_venta: string;
  total: number;
  metodo_pago: string;
  tipo_venta: string;
  estado_pedido: string;
  detalles: { cantidad: number }[];
}

export const EstadisticasVentasView = () => {
  const [rangoDias, setRangoDias] = useState(30); // Por defecto últimos 30 días
  const { data, loading, error } = useQuery<{ventas: Venta[]}>(GET_HISTORIAL_VENTAS);

  // ==========================================
  // MOTOR DE CÁLCULOS Y AGRUPACIONES (Frontend)
  // ==========================================
  const stats = useMemo(() => {
    if (!data?.ventas) return null;

    const hoy = new Date();
    const limiteFecha = new Date(hoy.getTime() - (rangoDias * 24 * 60 * 60 * 1000));

    // 1. Filtramos ventas válidas dentro del rango de tiempo
    const ventasActivas = data.ventas.filter(v => {
      const fechaVenta = new Date(v.fecha_venta);
      return v.estado_pedido !== 'Cancelada' && fechaVenta >= limiteFecha;
    });

    // 2. KPIs Principales
    const ingresosTotales = ventasActivas.reduce((acc, v) => acc + v.total, 0);
    const totalTickets = ventasActivas.length;
    const ticketPromedio = totalTickets > 0 ? ingresosTotales / totalTickets : 0;
    const articulosVendidos = ventasActivas.reduce((acc, v) => 
      acc + v.detalles.reduce((sum, det) => sum + det.cantidad, 0)
    , 0);

    // 3. Agrupación por Método de Pago
    const porMetodo = ventasActivas.reduce((acc: any, v) => {
      acc[v.metodo_pago] = (acc[v.metodo_pago] || 0) + v.total;
      return acc;
    }, {});

    // 4. Agrupación por Canal de Venta (Física vs Online)
    const porCanal = ventasActivas.reduce((acc: any, v) => {
      const canal = v.tipo_venta || 'Fisica';
      acc[canal] = (acc[canal] || 0) + v.total;
      return acc;
    }, {});

    // 5. Agrupación por Día para la Gráfica de Barras
    const ventasPorDiaMap = ventasActivas.reduce((acc: any, v) => {
      const fecha = new Date(v.fecha_venta).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
      acc[fecha] = (acc[fecha] || 0) + v.total;
      return acc;
    }, {});

    // Formatear datos para la gráfica
    const ultimosDias = Array.from({length: Math.min(rangoDias, 14)}).map((_, i) => {
      const d = new Date(hoy.getTime() - (i * 24 * 60 * 60 * 1000));
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    }).reverse();

    const graficaBarras = ultimosDias.map(dia => ({
      label: dia,
      total: ventasPorDiaMap[dia] || 0
    }));

    const maxVentaDia = Math.max(...graficaBarras.map(d => d.total), 1); // Evitar división por 0

    return {
      ingresosTotales, totalTickets, ticketPromedio, articulosVendidos,
      porMetodo, porCanal, graficaBarras, maxVentaDia
    };
  }, [data, rangoDias]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#3B82F6]">
        <Loader2 size={48} className="animate-spin mb-4" />
        <p className="font-bold text-[#64748B]">Calculando métricas...</p>
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-rose-50 text-rose-600 rounded-xl font-bold">Error: {error.message}</div>;
  }

  if (!stats) return null;

  // Calculadoras de porcentajes para barras de progreso
  const getPorcentaje = (valor: number, total: number) => total > 0 ? `${((valor / total) * 100).toFixed(1)}%` : '0%';

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#0F172A] flex flex-col gap-6 relative min-h-full">
      
      {/* Encabezado y Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <BarChart2 className="text-[#3B82F6]" size={28}/> 
            Estadísticas de Ventas
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1">Análisis financiero y de rendimiento de la clínica.</p>
        </div>
        
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-1.5 rounded-xl border border-black/5 dark:border-white/5 flex shadow-sm">
          <button onClick={() => setRangoDias(7)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rangoDias === 7 ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] hover:bg-black/5 dark:hover:bg-white/5'}`}>7 Días</button>
          <button onClick={() => setRangoDias(30)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rangoDias === 30 ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] hover:bg-black/5 dark:hover:bg-white/5'}`}>30 Días</button>
          <button onClick={() => setRangoDias(365)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${rangoDias === 365 ? 'bg-[#3B82F6] text-white shadow-md' : 'text-[#64748B] hover:bg-black/5 dark:hover:bg-white/5'}`}>1 Año</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Ingresos Brutos</p>
          <h3 className="text-3xl font-black text-[#0F172A] dark:text-white">${stats.ingresosTotales.toFixed(2)}</h3>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rounded-full flex items-center justify-center mb-4">
            <Receipt size={24} />
          </div>
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Ventas Procesadas</p>
          <h3 className="text-3xl font-black text-[#0F172A] dark:text-white">{stats.totalTickets} <span className="text-base font-medium text-[#64748B] ml-1">tickets</span></h3>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 rounded-full flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Ticket Promedio</p>
          <h3 className="text-3xl font-black text-[#0F172A] dark:text-white">${stats.ticketPromedio.toFixed(2)}</h3>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[20px] border border-black/5 dark:border-white/5 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart size={24} />
          </div>
          <p className="text-sm font-medium text-[#64748B] dark:text-[#94A3B8] mb-1">Artículos Vendidos</p>
          <h3 className="text-3xl font-black text-[#0F172A] dark:text-white">{stats.articulosVendidos} <span className="text-base font-medium text-[#64748B] ml-1">ítems</span></h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfica Principal: Tendencia de Ingresos */}
        <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Tendencia de Ingresos</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Evolución de ventas en los últimos días del rango.</p>
            </div>
            <Calendar className="text-[#64748B]" size={20} />
          </div>
          
          <div className="flex-1 flex items-end gap-2 sm:gap-4 pt-8">
            {stats.graficaBarras.map((bar, i) => {
              const heightPercent = bar.total > 0 ? (bar.total / stats.maxVentaDia) * 100 : 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                  {/* Tooltip Hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md z-10 pointer-events-none whitespace-nowrap">
                    ${bar.total.toFixed(2)}
                  </div>
                  {/* Barra */}
                  <div 
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ease-out relative overflow-hidden ${bar.total > 0 ? 'bg-[#3B82F6] group-hover:bg-[#2563EB]' : 'bg-[#E2E8F0] dark:bg-[#334155]'}`}
                    style={{ height: `${Math.max(heightPercent, 2)}%` }} // Mínimo 2% para que se vea la barra gris
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <span className="text-[10px] font-medium text-[#64748B] dark:text-[#94A3B8]">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Paneles Secundarios: Origen y Método */}
        <div className="flex flex-col gap-6">
          
          {/* Métodos de Pago */}
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-6">Ingresos por Método</h3>
            <div className="space-y-5">
              {[
                { nombre: 'Efectivo', icon: Banknote, color: 'bg-emerald-500', key: 'Efectivo' },
                { nombre: 'Tarjeta', icon: CreditCard, color: 'bg-blue-500', key: 'Tarjeta' },
                { nombre: 'Transferencia', icon: Smartphone, color: 'bg-purple-500', key: 'Transferencia' }
              ].map(metodo => {
                const valor = stats.porMetodo[metodo.key] || 0;
                const porcentaje = getPorcentaje(valor, stats.ingresosTotales);
                return (
                  <div key={metodo.key}>
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
                        <metodo.icon size={16} className="text-[#64748B]"/> {metodo.nombre}
                      </span>
                      <span className="text-sm font-bold text-[#64748B]">${valor.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${metodo.color} rounded-full transition-all duration-1000`} style={{ width: porcentaje }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Canales de Venta */}
          <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex-1">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-6">Canal de Venta</h3>
            
            <div className="space-y-6">
              {/* Física */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-[#1E293B] rounded-full flex items-center justify-center text-blue-500 shadow-sm">
                    <Store size={20}/>
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-white leading-tight">Clínica</p>
                    <p className="text-xs font-medium text-[#3B82F6]">{getPorcentaje(stats.porCanal['Fisica'] || 0, stats.ingresosTotales)} del total</p>
                  </div>
                </div>
                <p className="font-black text-lg text-[#0F172A] dark:text-white">${(stats.porCanal['Fisica'] || 0).toFixed(2)}</p>
              </div>

              {/* Online */}
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-500/10 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-[#1E293B] rounded-full flex items-center justify-center text-purple-500 shadow-sm">
                    <Globe size={20}/>
                  </div>
                  <div>
                    <p className="font-bold text-[#0F172A] dark:text-white leading-tight">Tienda Online</p>
                    <p className="text-xs font-medium text-purple-500">{getPorcentaje(stats.porCanal['Online'] || 0, stats.ingresosTotales)} del total</p>
                  </div>
                </div>
                <p className="font-black text-lg text-[#0F172A] dark:text-white">${(stats.porCanal['Online'] || 0).toFixed(2)}</p>
              </div>
            </div>
            
          </div>

        </div>
      </div>
    </div>
  );
};