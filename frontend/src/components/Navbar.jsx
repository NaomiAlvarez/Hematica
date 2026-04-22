// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/hematica.jpeg" alt="Logo" className="logo-img" />
          <span className="nav-logo-text">HEMÁTICA</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/pacientes" className="nav-item">PACIENTES</Link>
        <Link to="/empleados" className="nav-item">EMPLEADOS</Link>
        <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
        <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
        <Link to="/resultados" className="nav-item">RESULTADOS</Link>
        
        <Link to="/login" className="btn-acceso">ACCESO</Link>
      </div>
    </nav>
  );
};

export default Navbar;