import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Empleados from './pages/Empleados';
import Estudios from './pages/Estudios';
import Solicitudes from './pages/Solicitudes';
import ResultadoEstudio from './pages/ResultadoEstudio';
import MisMascotas from './pages/MisMascotas';
import MisPacientes from './pages/MisPacientes';
import EditarCuenta from './pages/EditarCuenta';

import './pages/Pages.css';

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [usuario, setUsuario] = useState(null);

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
    localStorage.removeItem('usuario');
  };

  const handleActualizarUsuario = (nuevosDatos) => {
    setUsuario(nuevosDatos);
  };

  const isAdmin = userRole === 'admin';
  const isVeterinario = userRole === 'veterinario';
  const isUsuario = userRole === 'usuario';

  return (
    <Router>
      {isLogged && <Navbar userRole={userRole} onLogout={handleLogout} usuario={usuario} />}
      <div className="container-fluid">
        <Routes>
          <Route path="/login" element={!isLogged ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={isLogged ? <Home userRole={userRole} usuario={usuario} /> : <Navigate to="/login" />} />

          {/* Solo admin */}
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