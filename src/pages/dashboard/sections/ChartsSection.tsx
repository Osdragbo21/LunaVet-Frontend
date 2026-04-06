import React, { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import { TrendingUp, Activity, Sigma } from 'lucide-react';

// 1. QUERY ACTUALIZADA: Ahora traemos Citas y Pacientes al mismo tiempo
const GET_DATOS_CHART = gql`
  query GetDatosParaGraficas {
    citas {
      fecha_hora
      estado
    }
    pacientes {
      especie
    }
  }
`;

interface CitaData {
  fecha_hora: string;
  estado: string;
}

interface PacienteData {
  especie: string;
}

interface GetDatosChartResponse {
  citas: CitaData[];
  pacientes: PacienteData[];
}

export const ChartsSection = () => {
  const { data, loading } = useQuery<GetDatosChartResponse>(GET_DATOS_CHART, { fetchPolicy: 'network-only' });

  // =========================================================
  // 1. Gráfica Semanal (Flujo de Consultas con Fechas Reales)
  // =========================================================
  const semanasData = useMemo(() => {
    const hoy = new Date();
    
    // Función auxiliar para formatear fechas como DD/MM
    const formatRango = (d: Date) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;

    const chunks = Array.from({ length: 6 }).map((_, i) => {
      // Calculamos el inicio y fin exacto de los 7 días
      const end = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (i * 7));
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6);
      
      const label = i === 0 ? 'Actual' : `${formatRango(start)} a ${formatRango(end)}`;
      
      return { label, total: 0, start, end };
    }).reverse();

    if (data?.citas) {
      data.citas.forEach((cita) => {
        const fechaCita = new Date(cita.fecha_hora);
        const chunkIndex = chunks.findIndex(c => fechaCita > c.start && fechaCita <= c.end);
        if (chunkIndex !== -1) {
          chunks[chunkIndex].total += 1;
        }
      });
    }
    return chunks;
  }, [data]);

  const maxConsultas = Math.max(...semanasData.map(d => d.total), 1);

  // =========================================================
  // 2. Gráfica de Especies (Datos Reales de Pacientes)
  // =========================================================
  const especiesData = useMemo(() => {
    if (!data?.pacientes) return { total: 0, pctPerros: 0, pctGatos: 0, pctExoticos: 0, grad: 'conic-gradient(#E2E8F0 0% 100%)' };

    let perros = 0, gatos = 0, exoticos = 0;
    
    data.pacientes.forEach(p => {
      const e = (p.especie || '').toLowerCase();
      if (e === 'perro') perros++;
      else if (e === 'gato') gatos++;
      else exoticos++; // Aves, Reptiles, Pequeños Mamíferos, etc.
    });

    const total = data.pacientes.length;
    const pctPerros = total ? Math.round((perros / total) * 100) : 0;
    const pctGatos = total ? Math.round((gatos / total) * 100) : 0;
    const pctExoticos = total ? 100 - pctPerros - pctGatos : 0; // El resto

    // Calculamos el gradiente circular en base a los porcentajes reales
    const grad = total > 0 
      ? `conic-gradient(#3B82F6 0% ${pctPerros}%, #10B981 ${pctPerros}% ${pctPerros + pctGatos}%, #F59E0B ${pctPerros + pctGatos}% 100%)`
      : 'conic-gradient(#1E293B 0% 100%)'; // Gris oscuro si no hay pacientes

    return { total, pctPerros, pctGatos, pctExoticos, grad };
  }, [data]);

  // =========================================================
  // 3. Modelo de Laplace (Proyecto Escolar)
  // =========================================================
  const laplaceTimeData = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map(t => {
      const valorReal = 10 * Math.exp(0.3 * t);
      return { dia: `Día ${t}`, consultas: Math.round(valorReal), exacto: valorReal.toFixed(2) };
    });
  }, []);
  const maxTimeVal = 50; 

  const laplaceFreqData = useMemo(() => {
    return [0.4, 0.6, 0.8, 1.0, 1.5, 2.0].map(s => {
      const amplitud = 10 / (s - 0.3);
      return { s_val: `s=${s}`, amplitud: Number(amplitud.toFixed(2)) };
    });
  }, []);
  const maxFreqVal = 100;

  return (
    <div className="flex flex-col gap-6">
      
      {/* BLOQUE 1: GRÁFICAS ORIGINALES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Flujo Semanal */}
        <div className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col h-full min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Flujo de Consultas</h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Últimas 6 semanas</p>
            </div>
            {loading && <span className="text-xs text-[#3B82F6] font-bold animate-pulse">Sincronizando...</span>}
          </div>
          
          <div className="flex-1 flex items-end gap-2 sm:gap-6 pt-4 pb-2">
            {semanasData.map((semana, index) => {
              const isLast = index === semanasData.length - 1;
              const heightPercent = (semana.total / maxConsultas) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-3 group relative h-full justify-end">
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md z-10 pointer-events-none whitespace-nowrap shadow-lg">
                    {semana.total} citas
                  </div>
                  <div className="w-full flex-1 flex flex-col justify-end relative">
                    <div className={`w-full max-w-[48px] mx-auto transition-all duration-500 ease-out relative ${isLast && semana.total === 0 ? 'bg-transparent' : 'bg-[#E2E8F0] dark:bg-[#334155] rounded-t-md'}`} style={{ height: `${Math.max(heightPercent, isLast && semana.total === 0 ? 1 : 4)}%` }}>
                      {isLast && <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#3B82F6] rounded-full shadow-[0_0_12px_rgba(59,130,246,1)]"></div>}
                    </div>
                  </div>
                  {/* Fecha Formateada */}
                  <span className={`text-[10px] sm:text-xs whitespace-nowrap mt-2 ${isLast ? 'text-[#3B82F6] font-bold' : 'text-[#64748B] dark:text-[#94A3B8] font-medium'}`}>{semana.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Especies (Datos Reales Vinculados) */}
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 rounded-[24px] border border-black/5 dark:border-white/5 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">Pacientes por Especie</h3>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-8">Distribución actual de la clínica</p>
          
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Gráfica Circular de CSS Dinámica */}
            <div className="relative w-40 h-40 rounded-full flex items-center justify-center shadow-inner transition-all duration-1000" style={{ background: especiesData.grad }}>
              <div className="absolute w-28 h-28 bg-[#FFFFFF] dark:bg-[#1E293B] rounded-full flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#0F172A] dark:text-white">{especiesData.total}</p>
                  <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase font-bold tracking-wider">Total</p>
                </div>
              </div>
            </div>
            
            {/* Leyenda Dinámica */}
            <div className="w-full mt-8 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span><span className="font-medium text-[#0F172A] dark:text-white">Perros</span></div>
                <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">{especiesData.pctPerros}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10B981]"></span><span className="font-medium text-[#0F172A] dark:text-white">Gatos</span></div>
                <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">{especiesData.pctGatos}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span><span className="font-medium text-[#0F172A] dark:text-white">Exóticos</span></div>
                <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">{especiesData.pctExoticos}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* BLOQUE 2: PROYECTO DE LAPLACE (Sin Modificaciones) */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-1 rounded-[24px] shadow-lg mt-4">
        <div className="bg-[#FFFFFF] dark:bg-[#1E293B] p-6 sm:p-8 rounded-[22px] border border-black/5 dark:border-white/5 flex flex-col">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4 border-b border-black/5 dark:border-white/10 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-3">
                <Sigma size={14} /> Módulo Matemático
              </div>
              <h3 className="text-2xl font-black text-[#0F172A] dark:text-white flex items-center gap-2">
                Análisis Predictivo Avanzado
              </h3>
              <p className="text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-2xl">
                Proyección de demanda de consultas utilizando modelo de crecimiento exponencial mediante la <strong>Transformada de Laplace</strong>.
              </p>
            </div>
            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] p-4 rounded-xl border border-black/5 dark:border-white/5 flex gap-6 shrink-0">
              <div><p className="text-[10px] uppercase font-bold text-[#64748B]">Ecuación Diferencial</p><p className="font-mono text-[#0F172A] dark:text-white font-bold">dC/dt = 0.3 · C(t)</p></div>
              <div className="w-px bg-black/10 dark:bg-white/10"></div>
              <div><p className="text-[10px] uppercase font-bold text-[#64748B]">Función Transferencia</p><p className="font-mono text-purple-600 dark:text-purple-400 font-bold">C(s) = 10 / (s - 0.3)</p></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="flex flex-col h-full">
              <div className="mb-4 flex justify-between items-end">
                <div>
                  <h4 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5"><TrendingUp size={16} className="text-emerald-500"/> Dominio del Tiempo: C(t)</h4>
                  <p className="text-xs text-[#64748B]">C(t) = 10 e^(0.3t). Proyección a 5 días.</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-[#64748B] font-bold uppercase">Día 5</p>
                  <p className="text-xl font-black text-emerald-500">~45 Consultas</p>
                </div>
              </div>
               <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-l border-black/10 dark:border-white/10 px-2">
                {laplaceTimeData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md z-10 pointer-events-none whitespace-nowrap shadow-lg">{d.exacto}</div>
                      <div className="w-full flex-1 flex flex-col justify-end relative">
                        <div className="w-full max-w-[40px] mx-auto bg-gradient-to-t from-emerald-500/20 to-emerald-500 rounded-t-sm transition-all duration-500" style={{ height: `${(d.consultas / maxTimeVal) * 100}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#64748B]">{d.dia}</span>
                    </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col h-full">
              <div className="mb-4">
                <h4 className="font-bold text-[#0F172A] dark:text-white flex items-center gap-1.5"><Activity size={16} className="text-purple-500"/> Dominio de Laplace: C(s)</h4>
                <p className="text-xs text-[#64748B]">Amplitud de señal en frecuencia (s &gt; 0.3).</p>
              </div>
              <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2 border-b border-l border-black/10 dark:border-white/10 px-2">
                {laplaceFreqData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end">
                      <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A] dark:bg-white text-white dark:text-[#0F172A] text-xs font-bold py-1 px-2 rounded-md z-10 pointer-events-none whitespace-nowrap shadow-lg">C(s) = {d.amplitud}</div>
                      <div className="w-full flex-1 flex flex-col justify-end relative">
                        <div className="w-full max-w-[40px] mx-auto bg-gradient-to-t from-purple-500/20 to-purple-500 rounded-t-sm transition-all duration-500" style={{ height: `${Math.max((d.amplitud / maxFreqVal) * 100, 2)}%` }}></div>
                      </div>
                      <span className="text-[10px] font-bold text-[#64748B]">{d.s_val}</span>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};