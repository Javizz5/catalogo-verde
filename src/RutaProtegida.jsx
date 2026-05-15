import { Navigate } from 'react-router-dom';

export default function RutaProtegida({ children }) {
  // Por ahora simularemos que el usuario NO ha iniciado sesión (false)
  // Más adelante, esto verificará la base de datos
  const estaAutenticado = true; 

  if (!estaAutenticado) {
    // Si no está autenticado, lo patea a la pantalla de login
    return <Navigate to="/login" replace/>;
  }

  // Si está autenticado, lo deja pasar al panel de admin
  return children;
}