import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ userRole, onLogout, usuario }) => {
  const isAdmin = userRole === 'admin';
  const isVeterinario = userRole === 'veterinario';
  const isUsuario = userRole === 'usuario';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const menuRef = useRef(null);

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

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
            <Link to="/mis-pacientes" className="nav-item">PACIENTES</Link>
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

        {/* ── Dropdown usuario ── */}
        {usuario && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setMenuAbierto(prev => !prev)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                color: '#3b82f6', fontWeight: '600', fontSize: '13px',
                letterSpacing: '0.5px', padding: '0 12px',
                borderLeft: '1px solid #e2e8f0',
              }}
            >
              Hola, {usuario.nombre}
              <span style={{ fontSize: '10px', marginTop: '1px' }}>
                {menuAbierto ? '▲' : '▼'}
              </span>
            </button>

            {menuAbierto && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                background: '#fff', borderRadius: '10px', minWidth: '180px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 999,
              }}>
                <Link
                  to="/editar-cuenta"
                  onClick={() => setMenuAbierto(false)}
                  style={{
                    display: 'block', padding: '12px 16px',
                    fontSize: '13px', fontWeight: '600', color: '#1e293b',
                    textDecoration: 'none', borderBottom: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={e => e.target.style.background = '#f8fafc'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  ✏️ Editar cuenta
                </Link>
                <button
                  onClick={() => { setMenuAbierto(false); onLogout(); }}
                  style={{
                    display: 'block', width: '100%', padding: '12px 16px',
                    fontSize: '13px', fontWeight: '600', color: '#ef4444',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => e.target.style.background = '#fff5f5'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;