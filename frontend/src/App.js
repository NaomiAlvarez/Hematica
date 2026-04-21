import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Pacientes from './pages/Pacientes';
import Empleados from './pages/Empleados'; 
import Estudios from './pages/Estudios'; // <--- 1. IMPORTANTE: Importar el archivo

function App() {
  return (
    <Router>
      <Navbar />
      <Routes> {/* 2. Solo usamos un Routes para envolver todo */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/empleados" element={<Empleados />} /> 
        <Route path="/estudios" element={<Estudios />} /> {/* 3. Ruta corregida */}
      </Routes>
    </Router>
  );
}

export default App; // 4. Siempre al final