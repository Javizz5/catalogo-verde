import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Catalogo from './Catalogo';
import Login from './Login';
import Admin from './Admin';
import RutaProtegida from './RutaProtegida';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: El catálogo principal */}
        <Route path="/" element={<Catalogo />} />

        {/* RUTA PÚBLICA: Login centralizado */}
        <Route path="/login" element={<Login />} />

        {/* RUTA PRIVADA: Protegida por tu componente de seguridad */}
        <Route
          path="/admin"
          element={
            <RutaProtegida>
              <Admin />
            </RutaProtegida>
          }
        />

        {/* Redirección por si escriben cualquier otra cosa */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;