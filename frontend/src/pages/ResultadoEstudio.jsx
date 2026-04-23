import React, { useState, useEffect } from 'react';
import './Pages.css';

const ResultadoEstudio = ({ userRole }) => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const obtenerResultados = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/resultados/');
        
        if (!respuesta.ok) {
          throw new Error('Error al conectar con el servidor de resultados');
        }

        const datos = await respuesta.json();
        setResultados(datos);
      } catch (error) {
        console.error("Error de red:", error);
        setError("No se pudieron cargar los resultados. Verifica la conexión con el backend.");
        setResultados([]); // Limpiamos cualquier dato residual
      } finally {
        setLoading(false);
      }
    };
    obtenerResultados();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="title-boutique">RESULTADOS</h1>
        <p className="subtitle-boutique">Informes diagnósticos y reportes clínicos finalizados</p>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
            <p className="subtitle-boutique">Accediendo a expedientes...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
            <p>{error}</p>
        </div>
      ) : resultados.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
            <p className="subtitle-boutique">No hay reportes clínicos registrados todavía.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>FOLIO SOL.</th>
                <th>PACIENTE</th>
                <th>VETERINARIO</th>
                <th>FECHA MUESTRA</th>
                <th>RESUMEN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((res) => (
                <tr key={res.id_resultado}>
                  <td className="id-cell">
                    #{String(res.id_solicitud).padStart(3, '0')}
                  </td>
                  
                  <td className="name-cell">{res.paciente_nombre}</td>
                  
                  <td style={{ fontSize: '0.85rem' }}>{res.veterinario_nombre}</td>
                  
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(res.fecha_muestras).toLocaleDateString()}
                  </td>
                  
                  <td style={{ 
                    fontSize: '0.8rem', 
                    color: '#64748b', 
                    maxWidth: '200px', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap' 
                  }}>
                    {res.reporte_clinico}
                  </td>
                  
                  <td>
                    <button className="btn-add-boutique" style={{ padding: '6px 12px', fontSize: '10px' }}>
                      VER PDF
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

export default ResultadoEstudio;