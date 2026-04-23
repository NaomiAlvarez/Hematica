import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ onLogout, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) onLogout();
    // Al cerrar sesión, lo mandamos de vuelta al nuevo login azul
    navigate('/login');
  };

  return (
    <>
      {/* NAVBAR SUPERIOR PRINCIPAL */}
      <nav className="navbar">
        <div className="nav-logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src="/hematica.jpeg" alt="Logo" className="logo-img" />
            <span className="nav-logo-text">HEMÁTICA</span>
          </Link>
        </div>

        <div className="nav-links">
          {/* SECCIÓN DINÁMICA: Si es admin ve Pacientes, si es usuario ve Mis Mascotas */}
          {userRole === 'admin' ? (
            <>
              <Link to="/pacientes" className="nav-item">PACIENTES</Link>
              <Link to="/empleados" className="nav-item">EMPLEADOS</Link>
            </>
          ) : (
            <>
              <Link to="/mascotas" className="nav-item">MIS MASCOTAS</Link>
            </>
          )}

          {/* SECCIÓN COMPARTIDA */}
          <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
          <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
          <Link to="/resultados" className="nav-item">RESULTADOS</Link>
        </div>
      </nav>

      {/* BOTÓN SALIR: Posicionado fijo abajo a la izquierda vía CSS */}
      <button onClick={handleLogout} className="btn-logout-bottom-left">
        <span style={{ marginRight: '8px', fontSize: '1.2rem' }}>←</span> 
        SALIR
      </button>
    </>
  );
};

export default Navbar;