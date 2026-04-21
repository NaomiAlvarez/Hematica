import React, { useState, useEffect } from 'react';
import './Pages.css';

const Pacientes = () => {
  // 1. ESTADOS: Para guardar la lista de mascotas y saber si estamos cargando
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. CARGA DE DATOS: Usamos fetch para evitar el error de 'crypto'
  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        // Intentamos conectar con la base de datos de Sebastian
        const respuesta = await fetch('http://localhost:8000/api/v1/pacientes/');
        const datos = await respuesta.json();
        setPacientes(datos);
      } catch (error) {
        console.log("Servidor de pacientes no detectado, usando demo...");
        // DATOS DE PRUEBA: Con los nombres exactos que pide el Serializer
        const backup = [
          { 
            id_paciente: 1, 
            nombre: "Firulais (Prueba)", 
            especie_nombre: "Canino", 
            raza_nombre: "Labrador", 
            dueno: "María López", 
            edad: 3 
          },
          { 
            id_paciente: 2, 
            nombre: "Michi (Prueba)", 
            especie_nombre: "Felino", 
            raza_nombre: "Siamés", 
            dueno: "Juan Pérez", 
            edad: 2 
          }
        ];
        setPacientes(backup);
      }
      setLoading(false);
    };

    obtenerPacientes();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="title-boutique">PACIENTES</h1>
        <p className="subtitle-boutique">Registro clínico de mascotas y ejemplares</p>
      </header>

      {loading ? (
        <p className="loading-text">Buscando expedientes...</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>PACIENTE</th>
                <th>ESPECIE / RAZA</th>
                <th>DUEÑO</th>
                <th>EDAD</th>
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {/* Recorremos la lista de pacientes y creamos cada fila */}
              {pacientes.map((paci) => (
                <tr key={paci.id_paciente}>
                  <td style={{ color: 'white', fontWeight: 'bold' }}>{paci.nombre}</td>
                  <td>{paci.especie_nombre} - {paci.raza_nombre}</td>
                  <td>{paci.dueno}</td>
                  <td>{paci.edad} años</td>
                  <td>
                    <button className="btn-table-edit">EXPEDIENTE</button>
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