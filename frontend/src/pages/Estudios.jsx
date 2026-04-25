// Estudios.jsx
import React, { useState, useEffect } from 'react';
import './Pages.css';

const Estudios = ({ userRole }) => {
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState(null); // null = nuevo, objeto = editando
  const [form, setForm] = useState({ nombre: '', precio: '' });
  const [errForm, setErrForm] = useState({});
  const [guardando, setGuardando] = useState(false);

  const isAdmin = userRole === 'admin';

  // Sanitiza el input eliminando etiquetas HTML para prevenir XSS
  const sanitizar = (valor) => valor.replace(/<[^>]*>?/gm, '');

  const cargarEstudios = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/estudios/');
      setEstudios(await res.json());
    } catch {
      setEstudios([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargarEstudios(); }, []);

  // Maneja cambios con sanitización
  const handleChange = (e) => {
    const { name, value } = e.target;
    const limpio = sanitizar(value);
    setForm({ ...form, [name]: limpio });
    setErrForm({ ...errForm, [name]: '' });
  };

  // Validación completa del formulario
  const validarForm = () => {
    let errores = {};

    // Nombre: obligatorio, 3-100 caracteres, solo letras números y espacios
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s().-]{3,100}$/;
    if (!form.nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio';
    } else if (!nombreRegex.test(form.nombre.trim())) {
      errores.nombre = 'El nombre solo puede contener letras, números y espacios (mín. 3 caracteres)';
    }

    // Precio: obligatorio, mayor a 0, máximo 99999.99, máximo 2 decimales
    const precio = parseFloat(form.precio);
    if (!form.precio) {
      errores.precio = 'El precio es obligatorio';
    } else if (isNaN(precio) || precio <= 0) {
      errores.precio = 'El precio debe ser mayor a 0';
    } else if (precio > 99999.99) {
      errores.precio = 'El precio no puede superar $99,999.99';
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.precio)) {
      errores.precio = 'El precio solo puede tener hasta 2 decimales';
    }

    return errores;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validarForm();
    if (Object.keys(errores).length > 0) { setErrForm(errores); return; }
    setErrForm({});
    setGuardando(true);

    const url = editando
      ? `http://localhost:8000/api/v1/estudios/${editando.id_catalogo}/`
      : 'http://localhost:8000/api/v1/estudios/';
    const method = editando ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          precio: parseFloat(form.precio)
        })
      });
      if (res.ok) {
        setMostrarForm(false);
        setEditando(null);
        setForm({ nombre: '', precio: '' });
        cargarEstudios();
      } else {
        const data = await res.json();
        setErrForm({ general: data.nombre?.[0] || data.detail || 'Error al guardar' });
      }
    } catch { setErrForm({ general: 'Error al conectar con el servidor' }); }
    setGuardando(false);
  };

  const handleEditar = (est) => {
    setEditando(est);
    setForm({ nombre: est.nombre, precio: est.precio });
    setErrForm({});
    setMostrarForm(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este estudio?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/estudios/${id}/`, { method: 'DELETE' });
      if (res.ok) cargarEstudios();
      else alert('Error al eliminar el estudio');
    } catch { alert('Error al conectar con el servidor'); }
  };

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">CATÁLOGO DE ESTUDIOS</h1>
          <p className="subtitle-boutique">Servicios de análisis clínico especializados</p>
        </div>
        {isAdmin && (
          <button className="btn-add-boutique" onClick={() => {
            setMostrarForm(!mostrarForm);
            setEditando(null);
            setForm({ nombre: '', precio: '' });
            setErrForm({});
          }}>
            <span>+</span>
          </button>
        )}
      </header>

      {mostrarForm && isAdmin && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>
            {editando ? 'Editar Estudio' : 'Nuevo Estudio'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Nombre */}
            <div className="input-group">
              <label>NOMBRE DEL ESTUDIO *</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej. Hemograma Completo"
                maxLength={100}
                className={errForm.nombre ? 'input-error' : ''}
              />
              {errForm.nombre && <span className="error-message">{errForm.nombre}</span>}
            </div>

            {/* Precio */}
            <div className="input-group">
              <label>PRECIO (MXN) *</label>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                max="99999.99"
                step="0.01"
                className={errForm.precio ? 'input-error' : ''}
              />
              {errForm.precio && <span className="error-message">{errForm.precio}</span>}
            </div>

            {errForm.general && (
              <p style={{ color: '#ef4444', gridColumn: '1/-1', fontSize: '0.85rem' }}>{errForm.general}</p>
            )}

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-add-boutique" disabled={guardando}>
                {guardando ? 'GUARDANDO...' : editando ? 'ACTUALIZAR' : 'GUARDAR'}
              </button>
              <button type="button" className="btn-add-boutique" style={{ backgroundColor: '#64748b' }}
                onClick={() => { setMostrarForm(false); setEditando(null); setErrForm({}); }}>
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>NOMBRE DEL ESTUDIO</th>
                <th>PRECIO UNITARIO</th>
                <th>ESTADO</th>
                {isAdmin && <th style={{ textAlign: 'center' }}>ACCIONES</th>}
              </tr>
            </thead>
            <tbody>
              {estudios.map((est) => (
                <tr key={est.id_catalogo}>
                  <td className="id-cell">#{est.id_catalogo.toString().padStart(3, '0')}</td>
                  <td className="name-cell">{est.nombre}</td> 
                  <td className="price-cell">${est.precio} MXN</td>
                  <td>
                    <span className="status-badge status-disponible">DISPONIBLE</span>
                  </td>
                  {isAdmin && (
                    <td className="actions-cell">
                      <button className="btn-action edit" title="Editar" onClick={() => handleEditar(est)}>✎</button>
                      <button className="btn-action delete" title="Eliminar" onClick={() => handleEliminar(est.id_catalogo)}>🗑</button>
                    </td>
                  )}
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