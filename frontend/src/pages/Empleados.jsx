import React, { useState, useEffect } from 'react';
import './Pages.css';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verVeterinarios, setVerVeterinarios] = useState(false);

  useEffect(() => {
    const obtenerDatos = async () => {
      setLoading(true);
      try {
        const endpoint = verVeterinarios ? 'veterinarios' : 'empleados';
        const respuesta = await fetch(`http://localhost:8000/api/v1/${endpoint}/`);
        const datosReales = await respuesta.json();
        setEmpleados(datosReales);
        setLoading(false);
      } catch (error) {
        console.error("Error al conectar:", error);
        const backup = verVeterinarios 
          ? [{ id_vet: 1, nombre: "Dr. Gómez (Demo)", clinica: "Hemática Central", cedula: "12345" }]
          : [{ id_emp: 1, puesto: "Recepcionista (Demo)", nombre_clinica: "Hemática Central", telefono: "312..." }];
        setEmpleados(backup);
        setLoading(false);
      }
    };
    obtenerDatos();
  }, [verVeterinarios]);

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">PERSONAL</h1>
          <p className="subtitle-boutique">Gestión de capital humano y especialistas</p>
        </div>
        
        {/* BOTÓN PARA AGREGAR NUEVA FILA */}
        <button className="btn-add-main">
          <span className="plus-icon">+</span> 
        </button>
      </header>

      <div className="personal-tabs-container">
        <button 
          className={`btn-tab-boutique ${!verVeterinarios ? "active" : ""}`} 
          onClick={() => setVerVeterinarios(false)}
        >
          EMPLEADOS
        </button>
        <button 
          className={`btn-tab-boutique ${verVeterinarios ? "active" : ""}`} 
          onClick={() => setVerVeterinarios(true)}
        >
          VETERINARIOS
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
            <p className="subtitle-boutique">Sincronizando con Hemática Cloud...</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                {verVeterinarios ? (
                  <>
                    <th>NOMBRE</th>
                    <th>CLÍNICA</th>
                    <th>CÉDULA</th>
                  </>
                ) : (
                  <>
                    <th>PUESTO</th>
                    <th>CLÍNICA</th>
                    <th>TELÉFONO</th>
                  </>
                )}
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((item) => (
                <tr key={item.id_emp || item.id_vet}>
                  {verVeterinarios ? (
                    <>
                      <td className="name-cell">{item.nombre}</td>
                      <td>{item.clinica}</td>
                      <td className="id-cell">{item.cedula}</td>
                    </>
                  ) : (
                    <>
                      <td className="name-cell">{item.puesto}</td>
                      <td>{item.nombre_clinica}</td>
                      <td>{item.telefono}</td>
                    </>
                  )}
                  <td className="actions-cell">
                    {/* BOTONES DE ACCIÓN POR FILA */}
                    <button className="btn-action edit" title="Editar">✎</button>
                    <button className="btn-action delete" title="Eliminar">🗑</button>
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

export default Empleados;