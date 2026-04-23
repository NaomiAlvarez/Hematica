import React, { useState, useEffect } from 'react';
import './Pages.css';

const Solicitudes = ({ userRole }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/solicitudes/');
        
        if (!respuesta.ok) {
          throw new Error('No se pudo conectar con el servidor');
        }

        const datos = await respuesta.json();
        setSolicitudes(datos);
      } catch (err) {
        // Datos de respaldo para que no se vea vacío mientras arreglan el CORS
        const backup = [
          { id_solicitud: 1, paciente_nombre: "Firulais", dueno: "Juan Pérez", estado: "PENDIENTE" },
          { id_solicitud: 2, paciente_nombre: "Michi", dueno: "Maria García", estado: "FINALIZADO" }
        ];
        setSolicitudes(backup);
        setError("Mostrando datos de respaldo (Error de conexión con el servidor)");
      } finally {
        setLoading(false);
      }
    };

    obtenerSolicitudes();
  }, []);

  return (
    <div className="page-container">
      {/* HEADER: Ahora alineado a la izquierda como Personal */}
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">SOLICITUDES</h1>
          <p className="subtitle-boutique">Gestión de órdenes y servicios de laboratorio</p>
        </div>

        {/* Botón circular solo con + */}
        <button className="btn-add-boutique">
          <span>+</span>
        </button>
      </header>

      {loading ? (
        <div className="loading-state">
          <p className="subtitle-boutique">Sincronizando con base de datos...</p>
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
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id_solicitud}>
                  <td className="id-cell">
                    #{String(sol.id_solicitud).padStart(3, '0')}
                  </td>
                  <td className="name-cell">{sol.paciente_nombre}</td>
                  <td className="owner-cell">{sol.dueno}</td>
                  <td>
                    <span className={`status-badge status-${sol.estado.toLowerCase()}`}>
                      {sol.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {/* Botón de acción minimalista tipo tabla */}
                    <button className="btn-action view" title="Ver Detalles">🔍</button>
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