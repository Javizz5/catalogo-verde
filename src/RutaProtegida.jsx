import React from 'react';
import { Navigate } from 'react-router-dom';

export default function RutaProtegida({ children }) {
  // Busca el "pase VIP" en la memoria del navegador
  const isAuthenticated = localStorage.getItem('zaherAuth') === 'true';

  if (!isAuthenticated) {
    // Si no tiene el pase, lo manda de regreso al login
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, lo deja pasar al componente que está protegiendo (tu Admin)
  return children;
}