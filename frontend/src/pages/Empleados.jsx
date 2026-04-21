import React, { useState, useEffect } from 'react';

import './Pages.css';

const Empleados = () => {
  // --- CAJAS DE MEMORIA (ESTADOS) ---
  // Aquí guardamos la lista que nos manda el backend
  const [empleados, setEmpleados] = useState([]);
  // Esto sirve para mostrar un mensaje de "Cargando..." mientras llegan los datos
  const [loading, setLoading] = useState(true);
  // Controla si estamos viendo la tabla de Empleados (false) o Veterinarios (true)
  const [verVeterinarios, setVerVeterinarios] = useState(false);

  // --- EL DETONANTE (USEEFFECT) ---
  // Esta función se ejecuta sola cada vez que entras a la página o cambias de pestaña
  useEffect(() => {
    const obtenerDatos = async () => {
      setLoading(true);
      try {
        // Usamos FETCH en lugar de Axios
        const endpoint = verVeterinarios ? 'veterinarios' : 'empleados';
        const respuesta = await fetch(`http://localhost:8000/api/v1/${endpoint}/`);
        
        // Si la respuesta es exitosa, convertimos los datos a JSON
        const datosReales = await respuesta.json();
        setEmpleados(datosReales);
        setLoading(false);
      } catch (error) {
        console.error("Error al conectar:", error);
        
        // Si el servidor está apagado, mostramos los datos de prueba
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
      <header className="page-header">
        <h1 className="title-boutique">PERSONAL</h1>
        
        {/* SELECTOR DE VISTA: Botones para cambiar entre una tabla y otra */}
        <div className="view-selector">
          <button 
            className={!verVeterinarios ? "active" : ""} 
            onClick={() => setVerVeterinarios(false)}
          >
            EMPLEADOS
          </button>
          <button 
            className={verVeterinarios ? "active" : ""} 
            onClick={() => setVerVeterinarios(true)}
          >
            VETERINARIOS
          </button>
        </div>
      </header>

      {/* RENDERIZADO: Si está cargando muestra el texto, si no, muestra la tabla */}
      {loading ? (
        <p className="loading-text">Sincronizando con Hemática Cloud...</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              {/* CAMBIO DE ENCABEZADOS: Según lo que diga el Serializer de tus compañeros */}
              {verVeterinarios ? (
                <tr>
                  <th>NOMBRE</th>
                  <th>CLÍNICA</th>
                  <th>CÉDULA</th>
                  <th>ACCIONES</th>
                </tr>
              ) : (
                <tr>
                  <th>PUESTO</th>
                  <th>CLÍNICA</th>
                  <th>TELÉFONO</th>
                  <th>ACCIONES</th>
                </tr>
              )}
            </thead>
            <tbody>
              {/* EL BUCLE: Por cada empleado en la lista, creamos una fila (tr) */}
              {empleados.map((item) => (
                <tr key={item.id_emp || item.id_vet}>
                  {verVeterinarios ? (
                    <>
                      {/* Datos que vienen del VeterinarioSerializer */}
                      <td>{item.nombre}</td>
                      <td>{item.clinica}</td>
                      <td>{item.cedula}</td>
                    </>
                  ) : (
                    <>
                      {/* Datos que vienen del EmpleadoSerializer */}
                      <td>{item.puesto}</td>
                      <td>{item.nombre_clinica}</td>
                      <td>{item.telefono}</td>
                    </>
                  )}
                  <td>
                    <button className="btn-table-edit">GESTIONAR</button>
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