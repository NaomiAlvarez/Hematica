/*
 * Punto de entrada de React.
 * Ademas de montar <App />, envuelve window.fetch para agregar el Bearer token
 * a las llamadas contra la API de Hematica. Asi las paginas no repiten esa
 * cabecera en cada request protegida.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Guarda una copia del método 'fetch' original del navegador antes de modificarlo
const originalFetch = window.fetch.bind(window);
// Define la dirección del backend de Django
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Modifica el comportamiento global de 'fetch' para interceptar todas las peticiones de red
window.fetch = (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url || '';
  const shouldAttachToken = url.startsWith(apiUrl) || url.startsWith('http://localhost:8000/api/v1');
  const token = localStorage.getItem('token');

  if (!shouldAttachToken || !token) {
    return originalFetch(input, init);
  }

  const headers = new Headers(init.headers || {});
  // Inyecta automáticamente el token de seguridad con el formato 'Bearer' requerido por Django
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Ejecuta la petición original pero ahora con la cabecera de seguridad adjunta
  return originalFetch(input, { ...init, headers });
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Punto de extension para enviar metricas de rendimiento si se requiere.
reportWebVitals();
