import React, { useState, useEffect } from 'react';
import './Pages.css';

const Solicitudes = ({ userRole }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Nuevo estado para manejar errores

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/solicitudes/');
        
        if (!respuesta.ok) {
          throw new Error('No se pudo conectar con el servidor de Hemática');
        }

        const datos = await respuesta.json();
        setSolicitudes(datos);
      } catch (err) {
        console.error("Error de conexión:", err);
        setError("Error al cargar datos. Verifica que el servidor Django esté activo.");
        setSolicitudes([]); // Vaciamos la tabla para no mostrar datos falsos
      } finally {
        setLoading(false);
      }
    };

    obtenerSolicitudes();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="title-boutique">SOLICITUDES</h1>
          <p className="subtitle-boutique">Gestión de órdenes y servicios de laboratorio</p>
        </div>

        {userRole === 'admin' && (
          <button className="btn-add-boutique">
            <span>+</span> NUEVA SOLICITUD
          </button>
        )}
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p className="subtitle-boutique">Sincronizando con base de datos...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#ef4444' }}>
          <p>{error}</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p className="subtitle-boutique">No hay solicitudes registradas actualmente.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>PACIENTE</th>
                <th>DUEÑO / TUTOR</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id_solicitud}>
                  <td className="id-cell">
                    #{String(sol.id_solicitud).padStart(3, '0')}
                  </td>
                  <td className="name-cell">{sol.paciente_nombre}</td>
                  <td style={{ fontSize: '0.85rem' }}>{sol.dueno}</td>
                  <td>
                    <span className={`status-badge status-${sol.estado.toLowerCase()}`}>
                      {sol.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button className="btn-add-boutique" style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#3b82f6' }}>
                      VER DETALLES
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Solicitudes;