import React, { useState, useEffect } from 'react';
import './Pages.css'; // USAMOS TU MISMO CSS

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerSolicitudes = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/solicitudes/');
        const datos = await respuesta.json();
        setSolicitudes(datos);
      } catch (error) {
        console.log("Cargando solicitudes demo...");
        const backup = [
          { id_solicitud: "S-1001", paciente_nombre: "Thor", dueno: "Liza Pérez", fecha_solicitud: "2024-05-21", estado: "PENDIENTE" },
          { id_solicitud: "S-1002", paciente_nombre: "Luna", dueno: "Carlos Ruiz", fecha_solicitud: "2024-05-22", estado: "FINALIZADO" }
        ];
        setSolicitudes(backup);
      }
      setLoading(false);
    };
    obtenerSolicitudes();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="title-boutique">SOLICITUDES</h1>
        <p className="subtitle-boutique">Gestión de órdenes y servicios de laboratorio</p>
      </header>

      {loading ? (
        <p className="loading-text">Cargando órdenes...</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>PACIENTE</th>
                <th>DUEÑO</th>
                <th>ESTADO</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id_solicitud}>
                  <td style={{ color: 'white', fontWeight: 'bold' }}>{sol.id_solicitud}</td>
                  <td>{sol.paciente_nombre}</td>
                  <td>{sol.dueno}</td>
                  <td>
                    <span style={{ 
                        color: sol.estado === 'FINALIZADO' ? '#a29bfe' : '#fdcb6e',
                        fontSize: '0.8rem',
                        fontWeight: 'bold'
                    }}>
                        {sol.estado}
                    </span>
                  </td>
                  <td>
                    <button className="btn-table-edit">DETALLES</button>
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