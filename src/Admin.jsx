import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, ArrowLeft, Package, DollarSign, Edit, Plus, Trash2, Hash, LayoutDashboard, MessageCircle, Lock, CheckCircle, AlertTriangle, Image as ImageIcon, Tag, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const COLORES_MAP = {
  'Negro': '#111827', 'Blanco': '#f9fafb', 'Gris': '#9ca3af', 'Plata': '#e5e7eb',
  'Azul': '#1d4ed8', 'Rojo': '#b91c1c', 'Verde': '#15803d', 'Rosa': '#db2777', 'Dorado': '#ca8a04'
};

export default function Admin() {
  const navigate = useNavigate();
  const camaraRef = useRef(null);
  const galeriaRef = useRef(null);
  
  const [productos, setProductos] = useState([]);
  const [productoEditando, setProductoEditando] = useState(null);
  
  const [whatsapp, setWhatsapp] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [nuevaCatStr, setNuevaCatStr] = useState("");

  const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '' });
  const [modalBorrar, setModalBorrar] = useState({ visible: false, id: null });

  // Conexión dinámica con el backend de Render
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resProd, resConf, resCat] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/config`).catch(() => ({ json: () => ({ whatsapp: "" }) })),
        fetch(`${API_URL}/categorias`).catch(() => ({ json: () => ({ lista: [] }) }))
      ]);
      
      const datosProd = await resProd.json();
      setProductos(Array.isArray(datosProd) ? datosProd : []);
      
      const config = await resConf.json();
      setWhatsapp(config.whatsapp || "");
      
      const cats = await resCat.json();
      setCategorias(cats.lista || []);
    } catch (error) { 
      console.error("Error al cargar datos del servidor:", error); 
    }
  };

  const mostrarNotificacion = (mensaje) => {
    setNotificacion({ visible: true, mensaje });
    setTimeout(() => setNotificacion({ visible: false, mensaje: '' }), 3000); 
  };

  const nuevoProducto = () => {
    setProductoEditando({
      nombre: '', marca: '', stock: '', credito: '', inicial: '', semanal: '', quincenal: '', 
      foto: null, categoria: categorias[0] || 'General', colores: []
    });
  };

  const manejarFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProductoEditando({ ...productoEditando, foto: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const toggleColor = (color) => {
    const actuales = productoEditando.colores || [];
    if (actuales.includes(color)) {
      setProductoEditando({...productoEditando, colores: actuales.filter(c => c !== color)});
    } else {
      setProductoEditando({...productoEditando, colores: [...actuales, color]});
    }
  };

  const guardarCambios = async () => {
    const productoAEnviar = {
      ...productoEditando,
      stock: parseInt(productoEditando.stock) || 0,
      credito: parseFloat(productoEditando.credito) || 0,
      inicial: parseFloat(productoEditando.inicial) || 0,
      semanal: parseFloat(productoEditando.semanal) || 0,
      quincenal: parseFloat(productoEditando.quincenal) || 0,
    };

    const esEdicion = !!productoAEnviar.id;
    const metodo = esEdicion ? 'PUT' : 'POST';
    const url = esEdicion ? `${API_URL}/productos/${productoAEnviar.id}` : `${API_URL}/productos`;
    
    // Optimistic UI update
    if (esEdicion) setProductos(productos.map(p => p.id === productoAEnviar.id ? productoAEnviar : p));
    else setProductos([...productos, { ...productoAEnviar, id: 'temp-' + Date.now() }]);
    
    setProductoEditando(null); 
    mostrarNotificacion("Sincronizando con la nube...");

    try {
      await fetch(url, { 
        method: metodo, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(productoAEnviar) 
      });
      cargarDatos(); 
      mostrarNotificacion("¡Guardado exitoso!");
    } catch (error) { 
      cargarDatos(); 
      mostrarNotificacion("Error al guardar");
    }
  };

  const confirmarEliminacion = async () => {
    const idParaBorrar = modalBorrar.id;
    setProductos(productos.filter(p => p.id !== idParaBorrar));
    setModalBorrar({ visible: false, id: null });
    
    try {
      await fetch(`${API_URL}/productos/${idParaBorrar}`, { method: 'DELETE' });
      mostrarNotificacion("Producto eliminado");
    } catch (error) { 
      cargarDatos(); 
    }
  };

  const guardarConfiguracionGlobal = async (nuevoWp, nuevasCats) => {
    try {
      if (nuevoWp !== null) {
        setWhatsapp(nuevoWp);
        await fetch(`${API_URL}/config`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ whatsapp: nuevoWp }) 
        });
      }
      if (nuevasCats !== null) {
        setCategorias(nuevasCats);
        await fetch(`${API_URL}/categorias`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ lista: nuevasCats }) 
        });
      }
      mostrarNotificacion("Configuración actualizada");
    } catch (e) { 
      console.error(e); 
    }
  };

  const agregarCategoria = () => {
    if (nuevaCatStr.trim() && !categorias.includes(nuevaCatStr.trim())) {
      guardarConfiguracionGlobal(null, [...categorias, nuevaCatStr.trim()]);
      setNuevaCatStr("");
    }
  };

  const eliminarCategoria = (catAEliminar) => {
    if(window.confirm(`¿Seguro que deseas borrar la categoría ${catAEliminar}?`)) {
      guardarConfiguracionGlobal(null, categorias.filter(c => c !== catAEliminar));
    }
  };

  const ElementosUI = () => (
    <>
      <div className={`fixed bottom-6 right-6 sm:bottom-10 sm:right-10 bg-emerald-800 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[100] transform transition-all duration-300 ${notificacion.visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
        <CheckCircle size={24} className="text-emerald-300" />
        <span className="font-bold text-sm tracking-wide">{notificacion.mensaje}</span>
      </div>
      {modalBorrar.visible && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm"><AlertTriangle size={32} /></div>
            <h3 className="text-xl font-black text-gray-800 mb-2">¿Eliminar Producto?</h3>
            <p className="text-gray-500 text-sm font-medium mb-8">Esta acción es permanente y afectará el catálogo público.</p>
            <div className="flex gap-3">
              <button onClick={() => setModalBorrar({ visible: false, id: null })} className="flex-1 bg-gray-50 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors">Cancelar</button>
              <button onClick={confirmarEliminacion} className="flex-1 bg-red-500 text-white font-bold py-3.5 rounded-xl hover:bg-red-600 shadow-lg transition-all">Sí, Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (!productoEditando) {
    return (
      <div className="min-h-screen bg-gray-50 pb-12 font-sans text-gray-800 relative">
        <ElementosUI />
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-emerald-700 font-bold hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all">
              <ArrowLeft size={20} /> <span className="hidden sm:inline">Ver Catálogo</span>
            </button>
            <div className="flex items-center gap-2">
              <LayoutDashboard size={20} className="text-emerald-600 hidden sm:block" />
              <h1 className="font-black text-gray-800 tracking-tight uppercase text-xs sm:text-sm">Gestión Zaher Tech</h1>
            </div>
            <button onClick={nuevoProducto} className="bg-emerald-700 text-white p-2 sm:px-4 sm:py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-md">
              <Plus size={20} /> <span className="hidden sm:inline">Nuevo Producto</span>
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 mt-6 sm:mt-10 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WHATSAPP */}
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><MessageCircle size={24} /></div>
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">WhatsApp de Contacto</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Vínculo directo para clientes</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+58..." className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-700 text-sm" />
                <button onClick={() => guardarConfiguracionGlobal(whatsapp, null)} className="bg-emerald-100 text-emerald-700 p-3 rounded-xl hover:bg-emerald-700 hover:text-white transition-colors"><Save size={20} /></button>
              </div>
            </div>

            {/* CATEGORÍAS */}
            <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><Tag size={24} /></div>
                <div>
                  <h2 className="font-bold text-gray-800 text-sm">Categorías Activas</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">Filtros del catálogo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={nuevaCatStr} onChange={(e) => setNuevaCatStr(e.target.value)} placeholder="Nueva categoría..." className="w-full p-3 bg-gray-50 border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-700 text-sm" />
                <button onClick={agregarCategoria} className="bg-emerald-700 text-white p-3 rounded-xl hover:bg-emerald-800 transition-colors"><Plus size={20} /></button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {categorias.map(c => (
                  <span key={c} className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border border-gray-200">
                    {c} <X size={14} className="cursor-pointer hover:text-red-500" onClick={() => eliminarCategoria(c)}/>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-emerald-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px] sm:min-w-full">
                <thead className="bg-emerald-50/50 text-emerald-800 text-[10px] sm:text-[11px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-4 py-5 text-center w-20">Img</th>
                    <th className="px-6 py-5">Producto / Cat</th>
                    <th className="px-6 py-5 text-center">Stock</th>
                    <th className="px-6 py-5">Precio</th>
                    <th className="px-6 py-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productos.map((prod) => (
                    <tr key={prod.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="px-4 py-4"><div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 overflow-hidden mx-auto shadow-inner">{prod.foto ? <img src={prod.foto} className="w-full h-full object-cover" /> : <Package size={22} />}</div></td>
                      <td className="px-6 py-4"><div><p className="font-bold text-gray-800 text-sm">{prod.nombre}</p><p className="text-[10px] text-emerald-600 font-black uppercase mt-0.5">{prod.marca} • {prod.categoria || 'Sin Cat'}</p></div></td>
                      <td className="px-6 py-4 text-center"><span className={`text-[11px] font-black px-3 py-1.5 rounded-full ${prod.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{prod.stock} UN</span></td>
                      <td className="px-6 py-4"><p className="font-black text-gray-800">${prod.credito}</p></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => setProductoEditando(prod)} className="p-3 text-emerald-600 hover:bg-emerald-100 rounded-2xl transition-all"><Edit size={20} /></button>
                          <button onClick={() => setModalBorrar({ visible: true, id: prod.id })} className="p-3 text-red-400 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans relative">
      <ElementosUI />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between">
          <button onClick={() => setProductoEditando(null)} className="flex items-center gap-2 text-gray-500 font-bold hover:text-emerald-700 transition-all p-2 rounded-xl"><ArrowLeft size={20} /> <span className="hidden sm:inline">Descartar</span></button>
          <div className="text-center"><p className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-0.5">{productoEditando.id ? 'Editando Item' : 'Creando Nuevo'}</p><h1 className="font-bold text-gray-800 truncate text-sm sm:text-base leading-none">{productoEditando.nombre || 'Información General'}</h1></div>
          <button onClick={guardarCambios} className="bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-800 shadow-lg transition-all text-sm"><Save size={18} /> <span className="hidden sm:inline">Guardar Cambios</span></button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-emerald-100 text-center">
            <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-4">Imagen del Producto</label>
            <div className="aspect-square bg-emerald-50/50 rounded-3xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center overflow-hidden relative group transition-all">
              {productoEditando.foto ? (
                <><img src={productoEditando.foto} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-emerald-900/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 transition-all p-4"><button onClick={() => camaraRef.current.click()} className="w-full bg-white text-emerald-800 text-xs font-bold py-2.5 rounded-xl shadow-sm">Nueva Foto</button><button onClick={() => galeriaRef.current.click()} className="w-full bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl">Elegir Archivo</button></div></>
              ) : (
                <div className="flex flex-col gap-3 w-full px-6"><button onClick={() => camaraRef.current.click()} className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><Camera size={18} /> Usar Cámara</button><button onClick={() => galeriaRef.current.click()} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"><ImageIcon size={18} /> Desde Galería</button></div>
              )}
            </div>
            <input type="file" ref={camaraRef} onChange={manejarFoto} accept="image/*" capture="environment" className="hidden" />
            <input type="file" ref={galeriaRef} onChange={manejarFoto} accept="image/*" className="hidden" />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-emerald-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Identificación</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Nombre comercial" value={productoEditando.nombre} onChange={(e) => setProductoEditando({...productoEditando, nombre: e.target.value})} className="w-2/3 p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-800 text-sm" />
                  <input type="text" placeholder="Marca" value={productoEditando.marca} onChange={(e) => setProductoEditando({...productoEditando, marca: e.target.value})} className="w-1/3 p-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-800 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Stock y Cat</label>
                <div className="flex gap-2 flex-col">
                  <select value={productoEditando.categoria || categorias[0]} onChange={(e) => setProductoEditando({...productoEditando, categoria: e.target.value})} className="w-full p-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-700 text-sm appearance-none">
                    {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="relative"><Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="number" placeholder="Cantidad" value={productoEditando.stock} onChange={(e) => setProductoEditando({...productoEditando, stock: e.target.value})} className="w-full pl-9 p-3.5 bg-gray-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-emerald-500 font-bold text-gray-800 text-sm" /></div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Variaciones de Color</label>
              <div className="flex flex-wrap gap-2">
                {Object.keys(COLORES_MAP).map(color => {
                  const isSelected = (productoEditando.colores || []).includes(color);
                  return (
                    <button key={color} onClick={() => toggleColor(color)} className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all flex items-center gap-2 ${isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-gray-100 bg-white text-gray-500 hover:border-gray-200'}`}>
                      <span className="w-3 h-3 rounded-full border border-gray-200 shadow-sm" style={{backgroundColor: COLORES_MAP[color]}}></span> {color}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6"><h2 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2"><DollarSign size={14} /> Estructura de Costos</h2><div className="h-px w-full bg-gray-100"></div></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="group"><label className="block text-[10px] font-black text-emerald-700 uppercase mb-2 ml-2">Precio de Venta</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span><input type="number" value={productoEditando.credito} onChange={(e) => setProductoEditando({...productoEditando, credito: e.target.value})} className="w-full pl-8 p-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500 font-black text-gray-800" /></div></div>
                <div className="group"><label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-2">Cuota Semanal</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span><input type="number" value={productoEditando.semanal} onChange={(e) => setProductoEditando({...productoEditando, semanal: e.target.value})} className="w-full pl-8 p-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-gray-600" /></div></div>
              </div>
              <div className="space-y-4">
                <div className="group"><label className="block text-[10px] font-black text-emerald-700 uppercase mb-2 ml-2">Pago Inicial</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span><input type="number" value={productoEditando.inicial} onChange={(e) => setProductoEditando({...productoEditando, inicial: e.target.value})} className="w-full pl-8 p-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500 font-black text-gray-800" /></div></div>
                <div className="group"><label className="block text-[10px] font-black text-gray-500 uppercase mb-2 ml-2">Cuota Quincenal</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span><input type="number" value={productoEditando.quincenal} onChange={(e) => setProductoEditando({...productoEditando, quincenal: e.target.value})} className="w-full pl-8 p-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500 font-bold text-gray-600" /></div></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}