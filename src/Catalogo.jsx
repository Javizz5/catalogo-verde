import React, { useState, useEffect } from 'react';
import { Search, Menu } from 'lucide-react';
import ProductCard from './ProductCard';

function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState(['General']);
  const [busqueda, setBusqueda] = useState(""); 
  const [whatsapp, setWhatsapp] = useState(""); 
  const [catSeleccionada, setCatSeleccionada] = useState("Todas");

  // 1. CAMBIO CLAVE: Usamos la variable de entorno de Vite
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        // 2. Ajustamos las rutas para que coincidan con tu main.py de FastAPI
        const [resProd, resConf, resCat] = await Promise.all([
          fetch(`${API_URL}/productos`),
          fetch(`${API_URL}/config`),
          fetch(`${API_URL}/categorias`)
        ]);
        
        const datos_reales = await resProd.json();
        const config = await resConf.json();
        const cats = await resCat.json();
        
        setWhatsapp(config.whatsapp);
        setCategorias(cats.lista || ['General']);
        
        // 3. Adaptación de datos con protección (por si marca o stock vienen vacíos)
        const productosAdaptados = datos_reales.map(prod => ({
            ...prod, 
            disponible: prod.stock || 0,
            marca: prod.marca || "Zaher Tech" 
        }));
        setProductos(productosAdaptados);
      } catch (error) {
        console.error("Error cargando el catálogo:", error);
      }
    };
    obtenerDatos();
  }, [API_URL]);

  // DOBLE FILTRO: Por texto (Nombre/Marca) Y por categoría
  const productosFiltrados = productos.filter(p => {
    const nombre = p.nombre ? p.nombre.toLowerCase() : "";
    const marca = p.marca ? p.marca.toLowerCase() : "";
    const busquedaLower = busqueda.toLowerCase();

    const coincideTexto = nombre.includes(busquedaLower) || marca.includes(busquedaLower);
    const coincideCat = catSeleccionada === "Todas" || p.categoria === catSeleccionada;
    
    return coincideTexto && coincideCat;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button className="md:hidden p-2 hover:bg-emerald-700 rounded-md transition-colors">
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-bold tracking-wider">MI CATÁLOGO</h1>
            </div>
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <input 
                  type="text" 
                  placeholder="Buscar marcas, productos..." 
                  value={busqueda} 
                  onChange={(e) => setBusqueda(e.target.value)} 
                  className="w-full bg-emerald-900/50 text-white placeholder-emerald-200 rounded-full py-2 pl-4 pr-10 outline-none focus:ring-2 focus:ring-emerald-400 border border-emerald-700" 
                />
                <Search className="absolute right-3 top-2.5 text-emerald-300" size={20} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Catálogo de Productos</h2>
            <p className="text-gray-500 mt-2">Disponibilidad inmediata y financiamiento.</p>
          </div>
          <div className="md:hidden w-full relative">
            <input 
              type="text" 
              placeholder="Buscar..." 
              value={busqueda} 
              onChange={(e) => setBusqueda(e.target.value)} 
              className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-4 pr-10 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm" 
            />
            <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          </div>
        </div>

        {/* PESTAÑAS DE CATEGORÍAS DESLIZABLES */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-4 scrollbar-hide">
          <button 
            onClick={() => setCatSeleccionada("Todas")} 
            className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all ${catSeleccionada === "Todas" ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Todas
          </button>
          {categorias.map(cat => (
            <button 
              key={cat} 
              onClick={() => setCatSeleccionada(cat)} 
              className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-sm transition-all ${catSeleccionada === cat ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((prod) => (
              <ProductCard key={prod.id} producto={prod} numeroWhatsApp={whatsapp} />
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-gray-400 font-medium italic">No se encontraron productos.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Catalogo;