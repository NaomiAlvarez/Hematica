import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userRole, onLogout, usuario }) => {
  const isAdmin = userRole === 'admin';
  const isVeterinario = userRole === 'veterinario';
  const isUsuario = userRole === 'usuario';

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/hematica.jpeg" alt="Hematica Logo" className="logo-img" />
          <span className="nav-logo-text">HEMÁTICA</span>
        </Link>
      </div>

      <div className="nav-links">

        {isUsuario && (
          <>
            <Link to="/mascotas" className="nav-item">MIS MASCOTAS</Link>
            <Link to="/solicitudes" className="nav-item">MIS SOLICITUDES</Link>
            <Link to="/resultados" className="nav-item">MIS RESULTADOS</Link>
          </>
        )}

        {isVeterinario && (
          <>
            <Link to="/mis-pacientes" className="nav-item">Pacientes</Link>
            <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
            <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
            <Link to="/resultados" className="nav-item">RESULTADOS</Link>
            
          </>
        )}

        {isAdmin && (
          <>
            <Link to="/mascotas" className="nav-item">PACIENTES</Link>
            <Link to="/empleados" className="nav-item">EMPLEADOS</Link>
            <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
            <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
            <Link to="/resultados" className="nav-item">RESULTADOS</Link>
            
          </>
        )}

        {/* Nombre del usuario en sesión */}
        {usuario && (
          <span style={{
            color: '#3b82f6',
            fontWeight: '600',
            fontSize: '13px',
            letterSpacing: '0.5px',
            padding: '0 12px',
            borderLeft: '1px solid #e2e8f0'
          }}>
            {usuario.nombre}
          </span>
        )}

        <button className="btn-acceso" onClick={onLogout}>
          CERRAR SESIÓN
        </button>
      </div>
    </nav>
  );
};

export default Navbar;