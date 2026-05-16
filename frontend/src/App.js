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

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Traduce la descripcion del backend al rol que usa el frontend para proteger rutas.
const getRoleFromUsuario = (userData) => {
  const descripcion = (userData?.tipo_usuario?.descripcion || '').toLowerCase();
  if (descripcion === 'administrador' || descripcion === 'admin') return 'admin';
  if (descripcion === 'veterinario') return 'veterinario';
  return 'usuario';
};

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCheckingSession(false);
      return;
    }

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
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('userData');
      } finally {
        setCheckingSession(false);
      }
    };

    reconstruirSesion();
  }, []);

  const handleLogin = (role, userData) => {
    setIsLogged(true);
    setUserRole(role);
    setUsuario(userData);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setUserRole(null);
    setUsuario(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userData');
  };

  const handleActualizarUsuario = (nuevosDatos) => {
    setUsuario(nuevosDatos);
  };

  const isAdmin = userRole === 'admin';
  const isVeterinario = userRole === 'veterinario';
  const isUsuario = userRole === 'usuario';

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
