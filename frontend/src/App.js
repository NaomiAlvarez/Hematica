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
import './pages/Pages.css'; 

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [userRole, setUserRole] = useState(null); // Guardará 'admin' o 'usuario'

  // Función que el Login llamará al tener éxito
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
      {/* Pasamos el rol y el logout al Navbar */}
      {isLogged && <Navbar userRole={userRole} onLogout={handleLogout} />}

      <div className="container-fluid">
        <Routes>
          <Route 
            path="/login" 
            element={!isLogged ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          
          <Route 
            path="/" 
            element={isLogged ? <Home userRole={userRole} /> : <Navigate to="/login" />} 
          />

          <Route 
            path="/pacientes" 
            element={isLogged ? <Pacientes userRole={userRole} /> : <Navigate to="/login" />} 
          />

          {/* Solo el admin debería poder entrar a empleados */}
          <Route 
            path="/empleados" 
            element={isLogged && userRole === 'admin' ? <Empleados /> : <Navigate to="/" />} 
          />

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

          <Route path="*" element={<Navigate to={isLogged ? "/" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;