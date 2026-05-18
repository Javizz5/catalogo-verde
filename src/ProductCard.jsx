import React, { useState } from 'react';
import { Package, Image as ImageIcon, MessageCircle } from 'lucide-react';

// Diccionario visual de colores
const COLORES_MAP = {
  'Negro': '#111827', 'Blanco': '#f9fafb', 'Gris': '#9ca3af', 'Plata': '#e5e7eb',
  'Azul': '#1d4ed8', 'Rojo': '#b91c1c', 'Verde': '#15803d', 'Rosa': '#db2777', 'Dorado': '#ca8a04'
};

// 1. Agregamos onImageClick a las propiedades que recibe el componente
export default function ProductCard({ producto, numeroWhatsApp, onImageClick }) {
  const [metodoPago, setMetodoPago] = useState('credito');

  if (!producto) return null;

  const infoPrecios = {
    credito: { valor: producto.credito, sufijo: '', descripcion: 'Monto total a financiar' },
    inicial: { valor: producto.inicial, sufijo: '', descripcion: 'Pago requerido' },
    semanal: { valor: producto.semanal, sufijo: '/semana', descripcion: 'Pagos semanales' },
    quincenal: { valor: producto.quincenal, sufijo: '/quincena', descripcion: 'Pagos quincenales' }
  };

  const opcionesPago = [
    { id: 'credito', label: 'Crédito' },
    { id: 'inicial', label: 'Inicial' },
    { id: 'semanal', label: 'Semanal' },
    { id: 'quincenal', label: 'Quincenal' }
  ];

  // COLORES: Lógica para mostrarlos
  const coloresProducto = producto.colores || [];
  const coloresTexto = coloresProducto.length > 0 ? coloresProducto.join(', ') : 'Consultar';

  // WHATSAPP: Mensaje Profesional
  const numeroLimpio = numeroWhatsApp ? numeroWhatsApp.replace(/\D/g, '') : "584141234567"; 
  const mensaje = encodeURIComponent(
    `👋 ¡Hola, Javier Zambrano!\n\n` +
    `Vengo de su catálogo virtual y me interesa este artículo:\n\n` +
    `📦 *Producto:* ${producto.nombre}\n` +
    `🏷️ *Marca:* ${producto.marca}\n` +
    `🎨 *Color de interés:* ${coloresTexto}\n` +
    `💳 *Modalidad de pago:* ${opcionesPago.find(o => o.id === metodoPago).label} ($${infoPrecios[metodoPago].valor})\n\n` +
    `¿Me confirmarían disponibilidad por favor?`
  );
  const linkWhatsApp = `https://wa.me/${numeroLimpio}?text=${mensaje}`;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-emerald-100 overflow-hidden flex flex-col h-full">
      <div className="h-48 bg-emerald-50/50 flex items-center justify-center relative p-4 group">
        {producto.foto ? (
          // 2. Agregamos el evento onClick y el cursor de lupa a la imagen
          <img 
            src={producto.foto} 
            alt={producto.nombre} 
            onClick={onImageClick}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in" 
          />
        ) : (
          <ImageIcon className="text-emerald-200 w-16 h-16 group-hover:scale-110 transition-transform duration-300" />
        )}
        <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Package size={12} />
            {producto.stock} disponibles
          </span>
        </div>
        <span className="absolute top-3 right-3 bg-white text-gray-600 text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border border-gray-100 pointer-events-none">
          {producto.marca}
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">{producto.nombre}</h3>
        
        {/* Renderizado dinámico de colores reales */}
        <div className="flex items-center gap-2 mb-4 h-6">
          <span className="text-xs text-gray-500 font-medium">Colores:</span>
          <div className="flex gap-1.5">
            {coloresProducto.length > 0 ? (
              coloresProducto.map(color => (
                <div key={color} className="w-4 h-4 rounded-full border border-gray-300 shadow-sm" style={{backgroundColor: COLORES_MAP[color]}} title={color}></div>
              ))
            ) : (
              <span className="text-xs text-gray-400 italic">Variados</span>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-1 rounded-lg flex gap-1 mb-4">
          {opcionesPago.map((opcion) => (
            <button
              key={opcion.id}
              onClick={() => setMetodoPago(opcion.id)}
              className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${
                metodoPago === opcion.id ? 'bg-white text-emerald-700 shadow-sm border border-emerald-100' : 'text-gray-500 hover:text-emerald-600'
              }`}
            >
              {opcion.label}
            </button>
          ))}
        </div>

        <div className="mb-5 flex-1">
          <div>
            <span className="text-3xl font-black text-emerald-800">${infoPrecios[metodoPago].valor}</span>
            <span className="text-sm font-medium text-gray-500">{infoPrecios[metodoPago].sufijo}</span>
            <p className="text-[11px] text-emerald-600 font-bold uppercase tracking-widest mt-0.5">{infoPrecios[metodoPago].descripcion}</p>
          </div>
        </div>

        <a 
          href={linkWhatsApp} target="_blank" rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-95"
        >
          <MessageCircle size={18} />
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}