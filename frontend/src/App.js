/*
 * Componente raiz de Hematica.
 * Reconstruye la sesion desde localStorage, define el rol funcional del usuario
 * y declara las rutas protegidas que puede visitar cada rol.
 */
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Empleados from './pages/Empleados';
import Estudios from './pages/Estudios';
import Solicitudes from './pages/Solicitudes';
import ResultadoEstudio from './pages/ResultadoEstudio';
import Dashboard from './pages/Dashboard';
import MisMascotas from './pages/MisMascotas';
import MisPacientes from './pages/MisPacientes';
import EditarCuenta from './pages/EditarCuenta';
import Usuarios from './pages/Usuarios';
import ResetPassword from './pages/ResetPassword';

import './pages/Pages.css';

// Configura la URL base de la API usando variables de entorno o el localhost por defecto
const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Función que limpia y estandariza el rol que manda el Backend (Django) 
// para que el Frontend de React pueda usarlo fácilmente ('admin', 'veterinario', 'usuario').
const getRoleFromUsuario = (userData) => {
  const descripcion = (userData?.tipo_usuario?.descripcion || '').toLowerCase();
  if (descripcion === 'administrador' || descripcion === 'admin') return 'admin';
  if (descripcion === 'veterinario') return 'veterinario';
  return 'usuario';
};

function App() {
  // Estados globales para controlar el flujo de la sesión en la aplicación
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Efecto inicial para comprobar si existe una sesión previa guardada en el navegador
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCheckingSession(false); // Si no hay token, se cancela la carga y se asume que no está logueado
      return;
    }

    // Si encuentra un token, le consulta al backend si las credenciales siguen vigentes
    const reconstruirSesion = async () => {
      try {
        const res = await fetch(`${API}/auth/me/`);
        if (!res.ok) throw new Error('Sesion expirada');
        const userData = await res.json();
        setIsLogged(true);
        setUserRole(getRoleFromUsuario(userData));
        setUsuario(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
      } catch {
        // Si el token expiró o la sesión no es válida, limpia el almacenamiento por seguridad
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userData');
      } finally {
        setCheckingSession(false);
      }
    };

    reconstruirSesion();
  }, []);

  // Maneja el estado interno cuando un usuario inicia sesión correctamente
  const handleLogin = (role, userData) => {
    setIsLogged(true);
    setUserRole(role);
    setUsuario(userData);
  };

  // Remueve las credenciales y limpia los estados globales al cerrar sesión
  const handleLogout = () => {
    setIsLogged(false);
    setUserRole(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userData');
  };

  // Permite actualizar los datos del usuario en tiempo real desde la edición de cuenta
  const handleActualizarUsuario = (nuevosDatos) => {
    setUsuario(nuevosDatos);
  };

  // Variables booleanas para simplificar la validación de permisos en el enrutador
  const isAdmin = userRole === 'admin';
  const isVeterinario = userRole === 'veterinario';
  const isUsuario = userRole === 'usuario';

  // Si está validando los datos del usuario al recargar la página, detiene el renderizado con una pantalla de espera
  if (checkingSession) {
    return <div className="loading-state">Restaurando sesion...</div>;
  }

  return (
    <Router>
      {isLogged && <Navbar userRole={userRole} onLogout={handleLogout} usuario={usuario} />}
      <div className="container-fluid">
        <Routes>
          <Route path="/login" element={!isLogged ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/reset-password" element={!isLogged ? <ResetPassword /> : <Navigate to="/" />} />
          <Route path="/" element={isLogged ? <Home userRole={userRole} usuario={usuario} /> : <Navigate to="/login" />} />

          {/* Rutas administrativas: solo usuarios con rol admin. */}
          <Route path="/dashboard" element={isLogged && isAdmin ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/usuarios" element={isLogged && isAdmin ? <Usuarios /> : <Navigate to="/" />} />
          <Route path="/pacientes" element={isLogged && isAdmin ? <Pacientes /> : <Navigate to="/" />} />
          <Route path="/empleados" element={isLogged && isAdmin ? <Empleados /> : <Navigate to="/" />} />

          {/* Mascotas visibles para administradores y tutores. */}
          <Route path="/mascotas" element={
            isLogged && (isAdmin || isUsuario)
              ? <MisMascotas usuario={usuario} isAdmin={isAdmin} />
              : <Navigate to="/" />
          } />

          {/* Catalogo de estudios */}
          <Route path="/estudios" element={
            isLogged
              ? <Estudios userRole={userRole} />
              : <Navigate to="/login" />
          } />

          {/* Solicitudes: el backend filtra por alcance de clientes/pacientes. */}
          <Route path="/solicitudes" element={
            isLogged
              ? <Solicitudes usuario={usuario} isAdmin={isAdmin} isVeterinario={isVeterinario} />
              : <Navigate to="/login" />
          } />

          {/* Resultados clinicos */}
          <Route path="/resultados" element={
            isLogged
              ? <ResultadoEstudio usuario={usuario} isAdmin={isAdmin} isVeterinario={isVeterinario} />
              : <Navigate to="/login" />
          } />

          {/* Pacientes vinculados al usuario */}
          <Route path="/mis-pacientes" element={
            isLogged && (isVeterinario || isUsuario)
              ? <MisPacientes usuario={usuario} />
              : <Navigate to="/" />
          } />

          {/* Cuenta del usuario autenticado */}
          <Route path="/editar-cuenta" element={
            isLogged
              ? <EditarCuenta usuario={usuario} onActualizar={handleActualizarUsuario} />
              : <Navigate to="/login" />
          } />

          <Route path="*" element={<Navigate to={isLogged ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
