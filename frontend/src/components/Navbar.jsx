import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userRole, onLogout }) => {
  const isAdmin = userRole === 'admin';

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/hematica.jpeg" alt="Hematica Logo" className="logo-img" />
          <span className="nav-logo-text">HEMÁTICA</span>
        </Link>
      </div>

      <div className="nav-links">
        {/* Usuario normal y veterinario */}
        {!isAdmin && (
          <>
            <Link to="/mascotas" className="nav-item">MIS MASCOTAS</Link>
            <Link to="/solicitudes" className="nav-item">MIS SOLICITUDES</Link>
            <Link to="/resultados" className="nav-item">MIS RESULTADOS</Link>
          </>
        )}

        {/* Solo admin */}
        {isAdmin && (
          <>
            <Link to="/mascotas" className="nav-item">PACIENTES</Link>
            <Link to="/empleados" className="nav-item">EMPLEADOS</Link>
            <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
            <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
            <Link to="/resultados" className="nav-item">RESULTADOS</Link>
          </>
        )}

        <button className="btn-acceso" onClick={onLogout}>
          CERRAR SESIÓN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;