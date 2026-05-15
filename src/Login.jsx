import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  
  // 1. Añadimos estados para controlar los inputs y posibles errores
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState(false);

  // 2. Lógica real de validación
  const manejarIngreso = (e) => {
    e.preventDefault();
    
    // Aquí validamos usuario y contraseña (más adelante lo conectaremos a tu MongoDB)
    if (usuario === 'admin' && password === 'admin123') {
      // Guardamos la sesión en el navegador
      localStorage.setItem('zaherAuth', 'true');
      setErrorLogin(false);
      navigate('/admin'); // Redirige al panel
    } else {
      // Si falla, mostramos error y limpiamos la clave
      setErrorLogin(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden">

        {/* Cabecera del Login */}
        <div className="bg-emerald-800 p-8 text-center relative overflow-hidden">
          {/* Círculos decorativos de fondo */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-700 rounded-full opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-900 rounded-full opacity-50"></div>

          <h2 className="relative z-10 text-2xl font-bold text-white tracking-wider">
            ACCESO ADMINISTRATIVO
          </h2>
          <p className="relative z-10 text-emerald-200 text-sm mt-2">
            Ingresa tus credenciales para gestionar el inventario
          </p>
        </div>

        {/* Formulario */}
        <div className="p-8">
          <form className="space-y-6" onSubmit={manejarIngreso}>

            {/* Campo de Usuario */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-emerald-600" />
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow outline-none"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-emerald-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-sm transition-shadow outline-none ${errorLogin ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Mensaje de error condicional */}
            {errorLogin && (
              <p className="text-red-500 text-xs font-bold text-center">
                Usuario o contraseña incorrectos.
              </p>
            )}

            {/* Botón de Ingreso */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
            >
              Ingresar al Panel
            </button>
          </form>
        </div>
      </div>

      {/* Botón para volver al catálogo público */}
      <div className="mt-8">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
        >
          &larr; Volver al catálogo público
        </button>
      </div>
    </div>
  );
}