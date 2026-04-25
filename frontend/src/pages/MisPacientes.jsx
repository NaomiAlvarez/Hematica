import React, { useState, useEffect } from 'react';
import './Pages.css';

const MisPacientes = ({ usuario }) => {
  const [pacientes, setPacientes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errGuardar, setErrGuardar] = useState('');

  const [form, setForm] = useState({
    nombre: '', id_especie: '', id_raza: '',
    edad: '', sexo: '', peso: '', anamnesis: '', id_cliente: '',
  });

  // ─── Cargar datos iniciales ───────────────────────────────────────────────
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [resPacientes, resEspecies, resClientes] = await Promise.all([
          fetch(`http://localhost:8000/api/v1/pacientes/`),
          fetch(`http://localhost:8000/api/v1/especies/`),
          fetch(`http://localhost:8000/api/v1/clientes/`),
        ]);
        setPacientes(resPacientes.ok ? await resPacientes.json() : []);
        setEspecies(resEspecies.ok ? await resEspecies.json() : []);
        setClientes(resClientes.ok ? await resClientes.json() : []);
      } catch {
        // si falla, queda vacío
      } finally {
        setLoading(false);
      }
    };
    cargarTodo();
  }, []);

  // ─── Cargar razas cuando cambia la especie ────────────────────────────────
  useEffect(() => {
    if (!form.id_especie) { setRazas([]); return; }
    const cargarRazas = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/razas/?id_especie=${form.id_especie}`
        );
        setRazas(res.ok ? await res.json() : []);
      } catch { setRazas([]); }
    };
    cargarRazas();
  }, [form.id_especie]);

  // ─── Handlers formulario ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_especie') {
      setForm(prev => ({ ...prev, id_especie: value, id_raza: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({
      nombre: '', id_especie: '', id_raza: '',
      edad: '', sexo: '', peso: '', anamnesis: '', id_cliente: '',
    });
    setRazas([]);
    setErrGuardar('');
    setMostrarFormulario(false);
  };

  // ─── Guardar ──────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    const { nombre, id_especie, id_raza, edad, sexo, id_cliente } = form;
    if (!nombre || !id_especie || !id_raza || !edad || !sexo || !id_cliente) {
      setErrGuardar('Completa todos los campos obligatorios (*).');
      return;
    }

    setGuardando(true);
    setErrGuardar('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pacientes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          id_especie: Number(id_especie),
          id_raza: Number(id_raza),
          edad: Number(edad),
          sexo,
          peso: form.peso ? Number(form.peso) : null,
          anamnesis: form.anamnesis || null,
          id_cliente: Number(id_cliente),
        }),
      });

      if (!res.ok) throw new Error();
      const nuevo = await res.json();
      setPacientes(prev => [...prev, nuevo]);
      resetForm();
      setSuccessMsg('Paciente registrado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrGuardar('Error al guardar el paciente. Verifica los datos.');
    } finally {
      setGuardando(false);
    }
  };

  // ─── Eliminar ─────────────────────────────────────────────────────────────
  const handleEliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este paciente?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pacientes/${id}/`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error();
      setPacientes(prev => prev.filter(p => p.id_paciente !== id));
    } catch {
      setErrGuardar('Error al eliminar el paciente.');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">MIS PACIENTES</h1>
          <p className="subtitle-boutique">Pacientes asignados a tu cuenta</p>
        </div>
        <button className="btn-add-boutique" onClick={() => setMostrarFormulario(true)}>
          + 
        </button>
      </header>

      {/* ── Mensaje de éxito estilo login ── */}
      {successMsg && (
        <div className="success-inline" style={{ margin: '16px 0' }}>
          <div className="success-inline-icon">🐾</div>
          <h3>¡Listo!</h3>
          <p>{successMsg}</p>
        </div>
      )}

      {/* ── Modal formulario ── */}
      {mostrarFormulario && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>REGISTRAR PACIENTE</h2>

            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>NOMBRE *</label>
                <input style={styles.input} name="nombre" value={form.nombre}
                  onChange={handleChange} placeholder="Nombre del paciente" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>DUEÑO *</label>
                <select style={styles.input} name="id_cliente" value={form.id_cliente} onChange={handleChange}>
                  <option value="">Selecciona un cliente</option>
                  {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre} {c.apellido ?? ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>ESPECIE *</label>
                <select style={styles.input} name="id_especie" value={form.id_especie} onChange={handleChange}>
                  <option value="">Selecciona una especie</option>
                  {especies.map(e => (
                    <option key={e.id_especie} value={e.id_especie}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>RAZA *</label>
                <select style={styles.input} name="id_raza" value={form.id_raza}
                  onChange={handleChange} disabled={!form.id_especie}>
                  <option value="">
                    {form.id_especie ? 'Selecciona una raza' : 'Primero selecciona especie'}
                  </option>
                  {razas.map(r => (
                    <option key={r.id_raza} value={r.id_raza}>{r.nombre}</option>
                  ))}
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>EDAD (años) *</label>
                <input style={styles.input} name="edad" type="number" min="0"
                  value={form.edad} onChange={handleChange} placeholder="Ej: 3" />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>SEXO *</label>
                <select style={styles.input} name="sexo" value={form.sexo} onChange={handleChange}>
                  <option value="">Selecciona</option>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>PESO (kg)</label>
                <input style={styles.input} name="peso" type="number" min="0" step="0.1"
                  value={form.peso} onChange={handleChange} placeholder="Ej: 4.5" />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>ANAMNESIS</label>
              <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                name="anamnesis" value={form.anamnesis} onChange={handleChange}
                placeholder="Historia clínica, síntomas previos..." />
            </div>

            {/* Error dentro del modal */}
            {errGuardar && (
              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px' }}>
                {errGuardar}
              </p>
            )}

            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={resetForm}>CANCELAR</button>
              <button style={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : pacientes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <p style={{ fontSize: '1.1rem' }}>No hay pacientes registrados.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>
            Usa el botón "+ NUEVO PACIENTE" para agregar uno.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>ESPECIE / RAZA</th>
                <th>EDAD</th>
                <th>SEXO</th>
                <th>PESO</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <tr key={p.id_paciente}>
                  <td className="name-cell">{p.nombre}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {p.especie_nombre ?? '—'} / {p.raza_nombre ?? '—'}
                  </td>
                  <td>{p.edad} años</td>
                  <td>{p.sexo === 'M' ? 'Macho' : 'Hembra'}</td>
                  <td>{p.peso ? `${p.peso} kg` : '—'}</td>
                  <td className="actions-cell">
                    <button
                      className="btn-add-boutique"
                      style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#ef4444' }}
                      onClick={() => handleEliminar(p.id_paciente)}
                    >
                      ELIMINAR
                    </button>
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

const styles = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '32px',
    width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalTitle: {
    fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px',
    color: '#1e3a5f', marginBottom: '24px',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#64748b' },
  input: {
    padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0',
    fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnCancelar: {
    padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0',
    background: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px',
  },
  btnGuardar: {
    padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#1e3a5f',
    color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px',
  },
};

export default MisPacientes;