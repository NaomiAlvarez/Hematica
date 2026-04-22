import React, { useState, useEffect } from 'react';
import './Pages.css'; // USAMOS TU MISMO CSS

const ResultadoEstudio = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerResultados = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/resultados/');
        const datos = await respuesta.json();
        setResultados(datos);
      } catch (error) {
        console.log("Cargando resultados demo...");
        setResultados([{ 
            id_resultado: "RES-501", 
            paciente_nombre: "Thor", 
            fecha_muestra: "2024-05-21", 
            reporte_clinico: "Hemograma completo - Normal" 
        }]);
      }
      setLoading(false);
    };
    obtenerResultados();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="title-boutique">RESULTADOS</h1>
        <p className="subtitle-boutique">Informes diagnósticos y reportes clínicos</p>
      </header>

      {loading ? (
        <p className="loading-text">Buscando reportes...</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>REPORTE</th>
                <th>PACIENTE</th>
                <th>FECHA</th>
                <th>RESUMEN</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((res) => (
                <tr key={res.id_resultado}>
                  <td style={{ color: 'white', fontWeight: 'bold' }}>{res.id_resultado}</td>
                  <td>{res.paciente_nombre}</td>
                  <td>{res.fecha_muestra}</td>
                  <td style={{ fontSize: '0.85rem', color: '#ccc' }}>{res.reporte_clinico}</td>
                  <td>
                    <button className="btn-table-edit">VER PDF</button>
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