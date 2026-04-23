import React, { useState, useEffect } from 'react';
import './Pages.css';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/pacientes/');
        if (respuesta.ok) {
          const datos = await respuesta.json();
          setPacientes(datos);
        } else {
          throw new Error("Error en la respuesta");
        }
      } catch (error) {
        console.log("Servidor no detectado, cargando datos de respaldo...");
        const backup = [
          { id_paciente: 1, nombre: "Firulais (Demo)", sexo: "M", especie_nombre: "Canino", raza_nombre: "Labrador", dueno: "María López", edad: 3 },
          { id_paciente: 2, nombre: "Michi (Demo)", sexo: "F", especie_nombre: "Felino", raza_nombre: "Siamés", dueno: "Juan Pérez", edad: 2 }
        ];
        setPacientes(backup);
      }
      setLoading(false);
    };
    obtenerPacientes();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">PACIENTES</h1>
          <p className="subtitle-boutique">Registro clínico de mascotas y ejemplares</p>
        </div>
        <button className="btn-add-main">
          <span className="plus-icon">+</span> 
        </button>
      </header>

      {loading ? (
        <div className="loading-state">
          <p className="subtitle-boutique">Sincronizando expedientes...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>PACIENTE</th>
                <th>ESPECIE / RAZA</th>
                <th>DUEÑO</th>
                <th>EDAD</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paci) => (
                <tr key={paci.id_paciente}>
                  <td className="name-cell">
                    <span className="patient-name">{paci.nombre}</span>
                    <span className="gender-tag">{paci.sexo === 'M' ? '♂' : '♀'}</span>
                  </td>
                  <td>{paci.especie_nombre} - {paci.raza_nombre}</td>
                  <td className="owner-cell">{paci.dueno}</td>
                  <td>{paci.edad} años</td>
                  <td className="actions-cell">
                    <button className="btn-action edit" title="Ver Expediente">✎</button>
                    <button className="btn-action delete" title="Eliminar Registro">🗑</button>
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

export default Pacientes;