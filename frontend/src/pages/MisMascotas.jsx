import React, { useState, useEffect, useCallback } from 'react';
import './Pages.css';

const MisMascotas = ({ usuario, isAdmin }) => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [razas, setRazas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [especieSeleccionada, setEspecieSeleccionada] = useState('');
  const [form, setForm] = useState({ nombre: '', sexo: 'M', edad: '', id_raza: '', id_cliente: '' });
  const [errForm, setErrForm] = useState('');
  const [clientes, setClientes] = useState([]);
  const [miClienteId, setMiClienteId] = useState(null);

  const cargarMascotas = useCallback(async () => {
    try {
      if (isAdmin) {
        const res = await fetch('http://localhost:8000/api/v1/pacientes/');
        setMascotas(await res.json());
      } else if (usuario) {
        const resC = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs = await resC.json();
        console.log('Clientes:', cs);
        console.log('Usuario actual:', usuario);
        const miCliente = cs.find(c => String(c.id_usuario) === String(usuario.id_usuario));
        console.log('Mi cliente encontrado:', miCliente);
        if (miCliente) {
          setMiClienteId(miCliente.id_cliente);
          const resM = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          setMascotas(await resM.json());
        }
      }
    } catch { setError('Error al cargar mascotas.'); }
    finally { setLoading(false); }
  }, [isAdmin, usuario]);

  useEffect(() => {
    cargarMascotas();
    fetch('http://localhost:8000/api/v1/especies/').then(r => r.json()).then(setEspecies);
    if (isAdmin) {
      fetch('http://localhost:8000/api/v1/clientes/')
        .then(r => r.json())
        .then(setClientes);
    }
  }, [cargarMascotas, isAdmin]);

  const cargarRazas = async (idEspecie) => {
    setEspecieSeleccionada(idEspecie);
    setForm(f => ({ ...f, id_raza: '' }));
    if (idEspecie) {
      const res = await fetch(`http://localhost:8000/api/v1/razas/?id_especie=${idEspecie}`);
      setRazas(await res.json());
    }
  };

  const validarForm = () => {
    if (!form.nombre.trim()) return 'El nombre es obligatorio';
    if (form.nombre.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (!form.edad || isNaN(form.edad) || form.edad < 0 || form.edad > 30) return 'Edad inválida (0-30)';
    if (!especieSeleccionada) return 'Selecciona una especie';
    if (!form.id_raza) return 'Selecciona una raza';
    if (isAdmin && !form.id_cliente) return 'Selecciona un cliente';
    if (!isAdmin && !miClienteId) return 'No se encontró tu perfil de cliente';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validarForm();
    if (err) { setErrForm(err); return; }
    setErrForm('');

    const clienteId = isAdmin ? parseInt(form.id_cliente) : miClienteId;

    try {
      const res = await fetch('http://localhost:8000/api/v1/pacientes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          sexo: form.sexo,
          edad: parseInt(form.edad),
          id_raza: parseInt(form.id_raza),
          id_cliente: clienteId
        })
      });

      if (res.ok) {
        setMostrarForm(false);
        setForm({ nombre: '', sexo: 'M', edad: '', id_raza: '', id_cliente: '' });
        setEspecieSeleccionada('');
        setRazas([]);
        cargarMascotas();
      } else {
        const data = await res.json();
        setErrForm(JSON.stringify(data));
      }
    } catch { setErrForm('Error al conectar con el servidor'); }
  };

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">{isAdmin ? 'PACIENTES' : 'MIS MASCOTAS'}</h1>
          <p className="subtitle-boutique">{isAdmin ? 'Gestión de todos los pacientes' : 'Gestión de tus ejemplares'}</p>
        </div>
        <button className="btn-add-boutique" onClick={() => { setMostrarForm(!mostrarForm); setErrForm(''); }}>
          <span>+</span>
        </button>
      </header>

      {mostrarForm && (
        <div className="form-container" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Nueva Mascota</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            <div className="input-group">
              <label>NOMBRE *</label>
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre de la mascota"
                maxLength={50}
              />
            </div>

            <div className="input-group">
              <label>SEXO *</label>
              <select value={form.sexo} onChange={e => setForm({ ...form, sexo: e.target.value })}>
                <option value="M">Macho</option>
                <option value="H">Hembra</option>
              </select>
            </div>

            <div className="input-group">
              <label>EDAD (años) *</label>
              <input
                type="number"
                value={form.edad}
                onChange={e => setForm({ ...form, edad: e.target.value })}
                placeholder="0"
                min="0"
                max="30"
              />
            </div>

            <div className="input-group">
              <label>ESPECIE *</label>
              <select value={especieSeleccionada} onChange={e => cargarRazas(e.target.value)}>
                <option value="">Seleccionar especie</option>
                {especies.map(e => <option key={e.id_especie} value={e.id_especie}>{e.nombre}</option>)}
              </select>
            </div>

            <div className="input-group">
              <label>RAZA *</label>
              <select
                value={form.id_raza}
                onChange={e => setForm({ ...form, id_raza: e.target.value })}
                disabled={!especieSeleccionada}
              >
                <option value="">Seleccionar raza</option>
                {razas.map(r => <option key={r.id_raza} value={r.id_raza}>{r.nombre}</option>)}
              </select>
            </div>

            {isAdmin && (
              <div className="input-group">
                <label>CLIENTE *</label>
                <select value={form.id_cliente} onChange={e => setForm({ ...form, id_cliente: e.target.value })}>
                  <option value="">Seleccionar cliente</option>
                  {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
                </select>
              </div>
            )}

            {errForm && (
              <p style={{ color: '#ef4444', gridColumn: '1/-1', fontSize: '0.85rem' }}>{errForm}</p>
            )}

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-add-boutique">GUARDAR</button>
              <button
                type="button"
                className="btn-add-boutique"
                style={{ backgroundColor: '#64748b' }}
                onClick={() => { setMostrarForm(false); setErrForm(''); }}
              >
                CANCELAR
              </button>
            </div>

          </form>
        </div>
      )}

      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : mascotas.length === 0 ? (
        <p className="subtitle-boutique">No hay mascotas registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>ESPECIE / RAZA</th>
                <th>EDAD</th>
                {isAdmin && <th>DUEÑO</th>}
                <th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {mascotas.map((m) => (
                <tr key={m.id_paciente}>
                  <td className="name-cell">{m.nombre}</td>
                  <td>{m.especie_nombre} - {m.raza_nombre}</td>
                  <td>{m.edad} años</td>
                  {isAdmin && <td style={{ fontSize: '0.85rem' }}>{m.dueno}</td>}
                  <td className="actions-cell">
                    <button className="btn-action edit" title="Ver Expediente">📋</button>
                    <button className="btn-action view" title="Ver Resultados">📊</button>
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