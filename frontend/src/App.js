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

          {/* Solo admin */}
          <Route path="/dashboard" element={isLogged && isAdmin ? <Dashboard /> : <Navigate to="/" />} />
          <Route path="/usuarios" element={isLogged && isAdmin ? <Usuarios /> : <Navigate to="/" />} />
          <Route path="/pacientes" element={isLogged && isAdmin ? <Pacientes /> : <Navigate to="/" />} />
          <Route path="/empleados" element={isLogged && isAdmin ? <Empleados /> : <Navigate to="/" />} />

          {/* Admin ve todos los pacientes, usuario ve los suyos */}
          <Route path="/mascotas" element={
            isLogged && (isAdmin || isUsuario)
              ? <MisMascotas usuario={usuario} isAdmin={isAdmin} />
              : <Navigate to="/" />
          } />

          {/* Estudios */}
          <Route path="/estudios" element={
            isLogged
              ? <Estudios userRole={userRole} />
              : <Navigate to="/login" />
          } />

          {/* Solicitudes */}
          <Route path="/solicitudes" element={
            isLogged
              ? <Solicitudes usuario={usuario} isAdmin={isAdmin} isVeterinario={isVeterinario} />
              : <Navigate to="/login" />
          } />

          {/* Resultados */}
          <Route path="/resultados" element={
            isLogged
              ? <ResultadoEstudio usuario={usuario} isAdmin={isAdmin} isVeterinario={isVeterinario} />
              : <Navigate to="/login" />
          } />

          {/* Mis Pacientes — veterinario */}
          <Route path="/mis-pacientes" element={
            isLogged && (isVeterinario || isUsuario)
              ? <MisPacientes usuario={usuario} />
              : <Navigate to="/" />
          } />

          {/* Editar cuenta — todos los roles */}
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
