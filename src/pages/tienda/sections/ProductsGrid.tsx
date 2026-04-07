import React from 'react';
import { Heart, Loader2, PackageOpen, SearchX } from 'lucide-react';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client/core';

const GET_PRODUCTOS_TIENDA = gql`
  query GetProductosTienda {
    productos {
      id_producto
      nombre
      precio_venta
      stock_actual
      imagen_url
      activo_en_tienda
      categoria
    }
  }
`;

interface ProductoTienda {
  id_producto: number;
  nombre: string;
  precio_venta: number;
  stock_actual: number;
  imagen_url: string;
  activo_en_tienda: boolean;
  categoria: string;
}

interface ProductsGridProps {
  addToCart: (prod: any) => void;
  searchTerm: string;
  activeCategory: string;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ addToCart, searchTerm, activeCategory }) => {
  const { data, loading, error } = useQuery<{productos: ProductoTienda[]}>(GET_PRODUCTOS_TIENDA);

  // Lógica combinada de Categoría y Buscador
  const productos = data?.productos?.filter(p => {
    // 1. Debe estar activo en la tienda
    if (!p.activo_en_tienda) return false;

    // 2. Filtro de Categoría
    const matchCategory = activeCategory === 'Todos' || p.categoria === activeCategory;

    // 3. Filtro de Búsqueda de Texto
    const term = searchTerm.toLowerCase();
    const matchSearch = p.nombre.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term);

    return matchCategory && matchSearch;
  }) || [];

  if (loading) return <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-[#3B82F6]" /></div>;
  if (error) return <div className="text-center py-10 text-rose-500 font-bold">No se pudo cargar el catálogo.</div>;

  // Título Dinámico
  let tituloSeccion = 'Catálogo General';
  if (searchTerm) tituloSeccion = `Resultados para "${searchTerm}"`;
  else if (activeCategory !== 'Todos') tituloSeccion = `Categoría: ${activeCategory}`;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
          {tituloSeccion} <span className="text-sm font-medium text-[#64748B] ml-2">({productos.length})</span>
        </h3>
      </div>
      
      {productos.length === 0 ? (
        <div className="text-center py-20 opacity-50 bg-white dark:bg-[#1E293B] rounded-2xl border border-dashed border-black/10 dark:border-white/10">
          <SearchX size={48} className="mx-auto mb-4 text-[#64748B]" />
          <p className="text-lg font-bold text-[#0F172A] dark:text-white mb-1">No encontramos resultados.</p>
          <p className="text-[#64748B] text-sm">Intenta con otra palabra o elimina los filtros de categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
          {productos.map((prod) => {
            const agotado = prod.stock_actual <= 0;
            return (
              <div key={prod.id_producto} className="bg-[#FFFFFF] dark:bg-[#1E293B] rounded-[16px] border border-black/5 dark:border-white/5 overflow-hidden hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col relative">
                
                {/* Imagen */}
                <div className="relative h-48 bg-white flex items-center justify-center p-4">
                  <img src={prod.imagen_url} alt={prod.nombre} className={`h-full object-contain mix-blend-multiply rounded-lg transition-transform ${agotado ? 'opacity-40' : 'group-hover:scale-105'}`} onError={(e:any)=>{e.target.src="https://placehold.co/300?text=No+Image"}}/>
                  <button className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 text-gray-400 hover:text-rose-500 transition-colors backdrop-blur-sm border border-black/5 shadow-sm">
                    <Heart size={18} />
                  </button>
                  {agotado && (
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-md shadow-lg">Agotado</span>
                    </div>
                  )}
                </div>
                
                {/* Detalles del Producto */}
                <div className="p-4 flex-1 flex flex-col">
                  <p className="text-[10px] uppercase tracking-wider text-[#64748B] mb-1 font-bold">{prod.categoria}</p>
                  <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-tight mb-3 line-clamp-2 flex-1 group-hover:text-[#3B82F6] transition-colors">
                    {prod.nombre}
                  </h4>
                  
                  <div className="mt-auto">
                    <div className="flex items-end gap-2 mb-3">
                      <span className="text-2xl font-black text-[#0F172A] dark:text-white leading-none">${prod.precio_venta.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(prod)}
                      disabled={agotado}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0F172A] hover:bg-[#3B82F6] hover:text-white text-[#3B82F6] disabled:bg-gray-100 disabled:text-gray-400 disabled:border-transparent border border-[#3B82F6]/30 px-4 py-2.5 rounded-[10px] font-bold text-sm transition-all duration-200"
                    >
                      {agotado ? 'Sin inventario' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};