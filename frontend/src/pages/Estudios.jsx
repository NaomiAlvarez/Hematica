import React, { useState, useEffect } from 'react';
import './Pages.css';

const Estudios = () => {
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerEstudios = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/estudios/');
        const datos = await respuesta.json();
        setEstudios(datos);
      } catch (error) {
        const backup = [
          { id_catalogo: 1, nombre: "Hemograma Completo", precio: "250.00" },
          { id_catalogo: 2, nombre: "Perfil Bioquímico (6)", precio: "450.00" },
          { id_catalogo: 3, nombre: "Urinalisis", precio: "180.00" },
          { id_catalogo: 4, nombre: "Prueba de Parvovirus", precio: "320.00" }
        ];
        setEstudios(backup);
      }
      setLoading(false);
    };
    obtenerEstudios();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">CATÁLOGO DE ESTUDIOS</h1>
          <p className="subtitle-boutique">Servicios de análisis clínico especializados</p>
        </div>
        
        {/* BOTÓN ADMINISTRADOR */}
        <button className="btn-add-main">
          <span className="plus-icon">+</span> NUEVO ESTUDIO
        </button>
      </header>

      {loading ? (
        <div className="loading-state">
          <p className="subtitle-boutique">Sincronizando catálogo...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>NOMBRE DEL ESTUDIO</th>
                <th>PRECIO UNITARIO</th>
                <th>ESTADO</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {estudios.map((est) => (
                <tr key={est.id_catalogo}>
                  <td className="id-cell">
                    #{est.id_catalogo.toString().padStart(3, '0')}
                  </td>
                  <td className="name-cell">{est.nombre}</td>
                  <td className="price-cell">${est.precio} MXN</td>
                  <td>
                    <span className="status-badge status-disponible">DISPONIBLE</span>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-action edit" title="Editar Precio o Nombre">✎</button>
                    <button className="btn-action delete" title="Eliminar del Catálogo">🗑</button>
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

export default Estudios;