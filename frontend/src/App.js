import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Empleados from './pages/Empleados'; 
import Estudios from './pages/Estudios'; 
import Solicitudes from './pages/Solicitudes'; 
import ResultadoEstudio from './pages/ResultadoEstudio'; 

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container-fluid"> {/* Contenedor para que las tablas no toquen los bordes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pacientes" element={<Pacientes />} />
          <Route path="/empleados" element={<Empleados />} /> 
          <Route path="/estudios" element={<Estudios />} />
          
          {/* --- NUEVAS RUTAS --- */}
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/resultados" element={<ResultadoEstudio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;