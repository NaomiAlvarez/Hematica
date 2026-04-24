import React, { useState, useEffect } from 'react';
import './Pages.css';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerUsuarios = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/usuarios/');
        const datos = await respuesta.json();
        setUsuarios(datos);
      } catch (error) {
        console.log("Usando datos demo de usuarios...");
        const backup = [
          { id_usuario: 1, nombre: "Admin Sistema", correo: "admin@hematica.com", num_tel: "3121002233", id_tipo_usuario: 1 },
          { id_usuario: 2, nombre: "Sebastian Dev", correo: "sebas@dev.com", num_tel: "3124455667", id_tipo_usuario: 2 }
        ];
        setUsuarios(backup);
      }
      setLoading(false);
    };
    obtenerUsuarios();
  }, []);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="title-boutique">GESTIÓN DE USUARIOS</h1>
        <button className="btn-table-edit" style={{marginBottom: '20px'}}>+</button>
      </header>

      {loading ? (
        <p className="loading-text">Cargando base de datos...</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>NOMBRE</th>
                <th>CORREO ELECTRÓNICO</th>
                <th>TELÉFONO</th>
                <th>TIPO</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((user) => (
                <tr key={user.id_usuario}>
                  <td style={{color: '#8429ce'}}>#{user.id_usuario}</td>
                  <td style={{color: 'white', fontWeight: 'bold'}}>{user.nombre}</td>
                  <td>{user.correo}</td>
                  <td>{user.num_tel}</td>
                  <td>
                    <span className="status-badge">Nivel {user.id_tipo_usuario}</span>
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

export default Usuarios;