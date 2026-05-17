/*
 * Barra de navegacion principal.
 * Muestra opciones segun rol, permite cerrar sesion y consulta notificaciones
 * del usuario autenticado para marcarlas como leidas desde el menu.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const Navbar = ({ userRole, onLogout, usuario }) => {
  const isAdmin = userRole === 'admin';
  const isVeterinario = userRole === 'veterinario';
  const isUsuario = userRole === 'usuario';
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);

  // Cierra el menu de usuario al hacer click fuera.
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificacionesAbiertas(false);
      }
    };
    document.addEventListener('mousedown', handleClickFuera);
    return () => document.removeEventListener('mousedown', handleClickFuera);
  }, []);

  useEffect(() => {
    if (!usuario) return;
    let activo = true;

    // Se recarga cada minuto para mostrar avisos nuevos sin refrescar la pagina.
    const cargar = async () => {
      try {
        const res = await fetch(`${API}/auth/notificaciones/`);
        if (!res.ok) return;
        const data = await res.json();
        if (activo) setNotificaciones(data.slice(0, 8));
      } catch (_) {}
    };

    cargar();
    const timer = setInterval(cargar, 60000);
    return () => {
      activo = false;
      clearInterval(timer);
    };
  }, [usuario]);

  const marcarLeida = async (notificacion) => {
    // Actualizacion optimista: la UI se marca leida antes de esperar al backend.
    if (notificacion.leida) return;
    setNotificaciones((actuales) =>
      actuales.map((item) =>
        item.id_notificacion === notificacion.id_notificacion
          ? { ...item, leida: true }
          : item
      )
    );
    try {
      await fetch(`${API}/auth/notificaciones/${notificacion.id_notificacion}/leer/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (_) {}
  };

  const pendientes = notificaciones.filter((item) => !item.leida).length;

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
            <Link to="/dashboard" className="nav-item">DASHBOARD</Link>
            <Link to="/usuarios" className="nav-item">USUARIOS</Link>
            <Link to="/mascotas" className="nav-item">PACIENTES</Link>
            <Link to="/empleados" className="nav-item">EMPLEADOS</Link>
            <Link to="/estudios" className="nav-item">ESTUDIOS</Link>
            <Link to="/solicitudes" className="nav-item">SOLICITUDES</Link>
            <Link to="/resultados" className="nav-item">RESULTADOS</Link>
          </>
        )}

        {usuario && (
          <div ref={notifRef} className="notification-menu">
            <button
              type="button"
              className="notification-button"
              onClick={() => setNotificacionesAbiertas(prev => !prev)}
              title="Notificaciones"
            >
              !
              {pendientes > 0 && <span>{pendientes}</span>}
            </button>
            {notificacionesAbiertas && (
              <div className="notification-dropdown">
                <strong>Notificaciones</strong>
                {notificaciones.length === 0 ? (
                  <p>Sin novedades.</p>
                ) : (
                  notificaciones.map((notificacion) => (
                    <Link
                      key={notificacion.id_notificacion}
                      to={notificacion.url || '/'}
                      className={notificacion.leida ? 'notification-item read' : 'notification-item'}
                      onClick={() => {
                        marcarLeida(notificacion);
                        setNotificacionesAbiertas(false);
                      }}
                    >
                      <span>{notificacion.titulo}</span>
                      <small>{notificacion.mensaje}</small>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Menu del usuario */}
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
