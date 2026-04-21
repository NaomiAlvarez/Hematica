import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          {/* 1. Usamos el nombre exacto: hematica.jpeg */}
          <img src="/hematica.jpeg" alt="Hemática Logo" className="logo-img" />
          {/* 2. Añadimos el nombre de la clínica */}
          <span className="nav-logo-text">HEMÁTICA</span>
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/pacientes" className="nav-item">PACIENTES</Link>
        <Link to="/empleados" className="nav-item">EMPLEADOS</Link>
        <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
        <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
        
        <Link to="/login" className="btn-acceso">
          ACCESO PERSONAL
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;