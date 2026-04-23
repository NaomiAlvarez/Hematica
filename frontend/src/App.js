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

  const isAdmin = userRole === 'admin';
  const isUsuario = userRole === 'usuario' || userRole === 'veterinario';

  return (
    <Router>
      {isLogged && <Navbar userRole={userRole} onLogout={handleLogout} />}
      <div className="container-fluid">
        <Routes>
          <Route path="/login" element={!isLogged ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/" element={isLogged ? <Home userRole={userRole} usuario={usuario} /> : <Navigate to="/login" />} />

          {/* Solo admin */}
          <Route path="/pacientes" element={isLogged && isAdmin ? <Pacientes /> : <Navigate to="/" />} />
          <Route path="/empleados" element={isLogged && isAdmin ? <Empleados /> : <Navigate to="/" />} />

          {/* Admin ve todos, usuario ve los suyos */}
          <Route path="/mascotas" element={isLogged ? <MisMascotas usuario={usuario} isAdmin={isAdmin} /> : <Navigate to="/login" />} />
          <Route path="/estudios" element={isLogged ? <Estudios userRole={userRole} /> : <Navigate to="/login" />} />
          <Route path="/solicitudes" element={isLogged ? <Solicitudes usuario={usuario} isAdmin={isAdmin} /> : <Navigate to="/login" />} />
          <Route path="/resultados" element={isLogged ? <ResultadoEstudio usuario={usuario} isAdmin={isAdmin} /> : <Navigate to="/login" />} />

          <Route path="*" element={<Navigate to={isLogged ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;