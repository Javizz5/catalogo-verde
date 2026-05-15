import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Catalogo from './Catalogo';
import Login from './Login';
import Admin from './Admin';
import RutaProtegida from './RutaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: El catálogo que ven los clientes */}
        <Route path="/" element={<Catalogo />} />

        {/* RUTA PÚBLICA: La pantalla para iniciar sesión */}
        <Route path="/login" element={<Login />} />

        {/* RUTA PRIVADA: El panel de administración protegido */}
        <Route
          path="/admin"
          element={
            <RutaProtegida>
              <Admin />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;