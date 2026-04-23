import React, { useState, useEffect } from 'react';
import './Pages.css'; // IMPORTACIÓN CORRETA SEGÚN TU ESTRUCTURA

const MisMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerMisMascotas = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/pacientes/');
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setMascotas(datos);
        }
      } catch (error) {
        const backup = [
          { id_paciente: 1, nombre: "Firulais", especie_nombre: "Canino", raza_nombre: "Labrador", edad: 3 },
          { id_paciente: 2, nombre: "Michi", especie_nombre: "Felino", raza_nombre: "Siamés", edad: 2 }
        ];
        setMascotas(backup);
      }
      setLoading(false);
    };
    obtenerMisMascotas();
  }, []);

  return (
    /* page-container es la que pone el fondo gris/blanco y quita el azul */
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">MIS MASCOTAS</h1>
          <p className="subtitle-boutique">Gestión de tus ejemplares y expedientes</p>
        </div>
        
        {/* Usamos tu clase de botón azul rey del CSS */}
        <button className="btn-add-boutique">
          <span>+</span> REGISTRAR MASCOTA
        </button>
      </header>

      {loading ? (
        <div className="loading-state">
          <p className="subtitle-boutique">Cargando...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>ESPECIE / RAZA</th>
                <th>EDAD</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.map((m) => (
                <tr key={m.id_paciente}>
                  <td className="name-cell">
                    <span className="patient-name">{m.nombre}</span>
                  </td>
                  <td>{m.especie_nombre} - {m.raza_nombre}</td>
                  <td>{m.edad} años</td>
                  <td className="actions-cell">
                    <button className="btn-action edit" title="Ver Carnet">📋</button>
                    <button className="btn-action view" title="Resultados">📊</button>
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

export default MisMascotas;