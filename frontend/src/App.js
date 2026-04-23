import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// COMPONENTES
import Navbar from './components/Navbar';

// PÁGINAS
import Home from './pages/Home';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Empleados from './pages/Empleados'; 
import Estudios from './pages/Estudios'; 
import Solicitudes from './pages/Solicitudes'; 
import ResultadoEstudio from './pages/ResultadoEstudio'; 
import MisMascotas from './pages/MisMascotas'; 

// ESTILOS (Siempre al final)
import './pages/Pages.css'; 

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState(null); 

  const handleLogin = (role) => {
    setIsLogged(true);
    setUserRole(role);
  };

  const handleLogout = () => {
    setIsLogged(false);
    setUserRole(null);
  };

  return (
    <Router>
      {isLogged && <Navbar userRole={userRole} onLogout={handleLogout} />}

      <div className="container-fluid">
        <Routes>
          {/* Ruta Pública: Login */}
          <Route 
            path="/login" 
            element={!isLogged ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          
          {/* Ruta Principal: Home */}
          <Route 
            path="/" 
            element={isLogged ? <Home userRole={userRole} /> : <Navigate to="/login" />} 
          />

          {/* Gestión de Pacientes (Solo Admin) */}
          <Route 
            path="/pacientes" 
            element={isLogged && userRole === 'admin' ? <Pacientes /> : <Navigate to="/" />} 
          />

          {/* Mis Mascotas (Para el Usuario/Dueño) */}
          <Route 
            path="/mascotas" 
            element={isLogged ? <MisMascotas /> : <Navigate to="/login" />} 
          />

          {/* Empleados (Solo Admin) */}
          <Route 
            path="/empleados" 
            element={isLogged && userRole === 'admin' ? <Empleados /> : <Navigate to="/" />} 
          />

          {/* Rutas Comunes */}
          <Route 
            path="/estudios" 
            element={isLogged ? <Estudios userRole={userRole} /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/solicitudes" 
            element={isLogged ? <Solicitudes userRole={userRole} /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/resultados" 
            element={isLogged ? <ResultadoEstudio userRole={userRole} /> : <Navigate to="/login" />} 
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to={isLogged ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;