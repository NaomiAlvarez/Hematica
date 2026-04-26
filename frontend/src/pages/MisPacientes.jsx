import React, { useState, useEffect } from 'react';
import './Pages.css';

// ─── Modal de confirmación personalizado ──────────────────────────────────────
const ModalConfirm = ({ mensaje, onConfirmar, onCancelar, tipo = 'danger' }) => (
  <div style={styles.overlay}>
    <div style={{ ...styles.modal, maxWidth: '400px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐾</div>
      <h3 style={{ color: '#1e3a5f', marginBottom: '12px', fontSize: '1rem', fontWeight: '700' }}>
        {mensaje}
      </h3>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
        <button style={styles.btnCancelar} onClick={onCancelar}>CANCELAR</button>
        <button style={{
          ...styles.btnGuardar,
          background: tipo === 'danger' ? '#ef4444' : '#1e3a5f'
        }} onClick={onConfirmar}>
          ACEPTAR
        </button>
      </div>
    </div>
  </div>
);

// ─── Modal de aviso (reemplaza alert) ─────────────────────────────────────────
const ModalAviso = ({ mensaje, onCerrar }) => (
  <div style={styles.overlay}>
    <div style={{ ...styles.modal, maxWidth: '400px', textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐾</div>
      <p style={{ color: '#1e3a5f', marginBottom: '20px', fontSize: '0.95rem' }}>{mensaje}</p>
      <button style={styles.btnGuardar} onClick={onCerrar}>ACEPTAR</button>
    </div>
  </div>
);

const MisPacientes = ({ usuario }) => {
  const [pacientes, setPacientes] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [razas, setRazas] = useState([]);
  const [razasEditar, setRazasEditar] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errGuardar, setErrGuardar] = useState('');

  const [modalCartilla, setModalCartilla] = useState(null);
  const [subiendoCartilla, setSubiendoCartilla] = useState(false);

  const [modalEditar, setModalEditar] = useState(null);
  const [formEditar, setFormEditar] = useState({ nombre: '', id_especie: '', id_raza: '', edad: '', sexo: '', peso: '', id_cliente: '' });
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [errEditar, setErrEditar] = useState('');

  // ─── Modales personalizados ───────────────────────────────────────────────
  const [confirm, setConfirm] = useState(null); // { mensaje, onConfirmar }
  const [aviso, setAviso] = useState(null);      // mensaje string

  const mostrarAviso = (msg) => setAviso(msg);
  const mostrarConfirm = (msg, onConfirmar) => setConfirm({ mensaje: msg, onConfirmar });

  const [form, setForm] = useState({
    nombre: '', id_especie: '', id_raza: '',
    edad: '', sexo: '', peso: '', anamnesis: '', id_cliente: '',
  });

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
      } finally {
        setLoading(false);
      }
    };
    cargarTodo();
  }, []);

  useEffect(() => {
    if (!form.id_especie) { setRazas([]); return; }
    fetch(`http://localhost:8000/api/v1/razas/?id_especie=${form.id_especie}`)
      .then(r => r.json()).then(setRazas).catch(() => setRazas([]));
  }, [form.id_especie]);

  useEffect(() => {
    if (!formEditar.id_especie) { setRazasEditar([]); return; }
    fetch(`http://localhost:8000/api/v1/razas/?id_especie=${formEditar.id_especie}`)
      .then(r => r.json()).then(setRazasEditar).catch(() => setRazasEditar([]));
  }, [formEditar.id_especie]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'id_especie') {
      setForm(prev => ({ ...prev, id_especie: value, id_raza: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleChangeEditar = (e) => {
    const { name, value } = e.target;
    if (name === 'id_especie') {
      setFormEditar(prev => ({ ...prev, id_especie: value, id_raza: '' }));
    } else {
      setFormEditar(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForm = () => {
    setForm({ nombre: '', id_especie: '', id_raza: '', edad: '', sexo: '', peso: '', anamnesis: '', id_cliente: '' });
    setRazas([]);
    setErrGuardar('');
    setMostrarFormulario(false);
  };

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
          nombre, id_especie: Number(id_especie), id_raza: Number(id_raza),
          edad: Number(edad), sexo,
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

  const abrirEditar = (p) => {
    setFormEditar({
      nombre: p.nombre, id_especie: '', id_raza: p.id_raza,
      edad: p.edad, sexo: p.sexo, peso: p.peso ?? '', id_cliente: p.id_cliente,
    });
    setErrEditar('');
    setModalEditar(p);
    fetch(`http://localhost:8000/api/v1/razas/`)
      .then(r => r.json())
      .then(todasRazas => {
        const razaActual = todasRazas.find(r => r.id_raza === p.id_raza);
        if (razaActual) setFormEditar(prev => ({ ...prev, id_especie: String(razaActual.id_especie) }));
      });
  };

  const handleGuardarEditar = async () => {
    const { nombre, id_raza, edad, sexo, id_cliente } = formEditar;
    if (!nombre || !id_raza || !edad || !sexo || !id_cliente) {
      setErrEditar('Completa todos los campos obligatorios (*).');
      return;
    }
    setGuardandoEditar(true);
    setErrEditar('');
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pacientes/${modalEditar.id_paciente}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre, id_raza: Number(id_raza), edad: Number(edad), sexo,
          peso: formEditar.peso ? Number(formEditar.peso) : null,
          id_cliente: Number(id_cliente),
        }),
      });
      if (!res.ok) throw new Error();
      const actualizado = await res.json();
      setPacientes(prev => prev.map(p => p.id_paciente === actualizado.id_paciente ? actualizado : p));
      setModalEditar(null);
      setSuccessMsg('Paciente actualizado correctamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      setErrEditar('Error al actualizar el paciente.');
    } finally {
      setGuardandoEditar(false);
    }
  };

  const handleEliminar = (id) => {
    mostrarConfirm('¿Seguro que deseas eliminar este paciente?', async () => {
      setConfirm(null);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/pacientes/${id}/`, { method: 'DELETE' });
        if (res.status === 500) {
          mostrarAviso('No se puede eliminar este paciente porque tiene solicitudes o resultados registrados.');
          return;
        }
        if (!res.ok) throw new Error();
        setPacientes(prev => prev.filter(p => p.id_paciente !== id));
      } catch {
        mostrarAviso('No se puede eliminar este paciente porque tiene registros asociados.');
      }
    });
  };

  const handleSubirCartilla = async (paciente, archivo) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf')) { mostrarAviso('Solo se permiten archivos PDF'); return; }
    if (archivo.size > 10 * 1024 * 1024) { mostrarAviso('El archivo no puede superar 10MB'); return; }
    setSubiendoCartilla(true);
    const formData = new FormData();
    formData.append('cartilla_pdf', archivo);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pacientes/${paciente.id_paciente}/subir_cartilla/`, {
        method: 'PATCH', body: formData
      });
      if (res.ok) {
        const actualizado = await res.json();
        setPacientes(prev => prev.map(p => p.id_paciente === actualizado.id_paciente ? actualizado : p));
        setModalCartilla(actualizado);
      } else mostrarAviso('Error al subir la cartilla');
    } catch { mostrarAviso('Error al conectar con el servidor'); }
    finally { setSubiendoCartilla(false); }
  };

  const handleEliminarCartilla = (paciente) => {
    mostrarConfirm('¿Seguro que quieres eliminar la cartilla?', async () => {
      setConfirm(null);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/pacientes/${paciente.id_paciente}/eliminar_cartilla/`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const actualizado = await res.json();
          setPacientes(prev => prev.map(p => p.id_paciente === actualizado.id_paciente ? actualizado : p));
          setModalCartilla(actualizado);
        } else mostrarAviso('Error al eliminar la cartilla');
      } catch { mostrarAviso('Error al conectar con el servidor'); }
    });
  };

  const CamposForm = ({ f, onChange, razasLista, errMsg }) => (
    <>
      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>NOMBRE *</label>
          <input style={styles.input} name="nombre" value={f.nombre} onChange={onChange} placeholder="Nombre del paciente" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>DUEÑO *</label>
          <select style={styles.input} name="id_cliente" value={f.id_cliente} onChange={onChange}>
            <option value="">Selecciona un cliente</option>
            {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>)}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>ESPECIE *</label>
          <select style={styles.input} name="id_especie" value={f.id_especie} onChange={onChange}>
            <option value="">Selecciona una especie</option>
            {especies.map(e => <option key={e.id_especie} value={e.id_especie}>{e.nombre}</option>)}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>RAZA *</label>
          <select style={styles.input} name="id_raza" value={f.id_raza} onChange={onChange} disabled={!f.id_especie}>
            <option value="">{f.id_especie ? 'Selecciona una raza' : 'Primero selecciona especie'}</option>
            {razasLista.map(r => <option key={r.id_raza} value={r.id_raza}>{r.nombre}</option>)}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>EDAD (años) *</label>
          <input style={styles.input} name="edad" type="number" min="0" value={f.edad} onChange={onChange} placeholder="Ej: 3" />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>SEXO *</label>
          <select style={styles.input} name="sexo" value={f.sexo} onChange={onChange}>
            <option value="">Selecciona</option>
            <option value="M">Macho</option>
            <option value="F">Hembra</option>
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>PESO (kg)</label>
          <input style={styles.input} name="peso" type="number" min="0" step="0.1" value={f.peso} onChange={onChange} placeholder="Ej: 4.5" />
        </div>
      </div>
      {errMsg && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '10px' }}>{errMsg}</p>}
    </>
  );

  return (
    <div className="page-container">

      {/* ── Modales globales ── */}
      {confirm && (
        <ModalConfirm
          mensaje={confirm.mensaje}
          onConfirmar={confirm.onConfirmar}
          onCancelar={() => setConfirm(null)}
        />
      )}
      {aviso && (
        <ModalAviso mensaje={aviso} onCerrar={() => setAviso(null)} />
      )}

      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">MIS PACIENTES</h1>
          <p className="subtitle-boutique">Pacientes asignados a tu cuenta</p>
        </div>
        <button className="btn-add-boutique" onClick={() => setMostrarFormulario(true)}>+</button>
      </header>

      {successMsg && (
        <div className="success-inline" style={{ margin: '16px 0' }}>
          <div className="success-inline-icon">🐾</div>
          <h3>¡Listo!</h3>
          <p>{successMsg}</p>
        </div>
      )}

      {/* ── Modal registrar ── */}
      {mostrarFormulario && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>REGISTRAR PACIENTE</h2>
            <CamposForm f={form} onChange={handleChange} razasLista={razas} errMsg={errGuardar} />
            <div style={{ marginTop: '12px' }}>
              <label style={styles.label}>ANAMNESIS</label>
              <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
                name="anamnesis" value={form.anamnesis} onChange={handleChange}
                placeholder="Historia clínica, síntomas previos..." />
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={resetForm}>CANCELAR</button>
              <button style={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
                {guardando ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal editar ── */}
      {modalEditar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>EDITAR PACIENTE</h2>
            <CamposForm f={formEditar} onChange={handleChangeEditar} razasLista={razasEditar} errMsg={errEditar} />
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setModalEditar(null)}>CANCELAR</button>
              <button style={{ ...styles.btnGuardar, background: '#f59e0b' }} onClick={handleGuardarEditar} disabled={guardandoEditar}>
                {guardandoEditar ? 'GUARDANDO...' : 'ACTUALIZAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal cartilla ── */}
      {modalCartilla && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '480px' }}>
            <h2 style={styles.modalTitle}>CARTILLA DE {modalCartilla.nombre.toUpperCase()}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
              {modalCartilla.especie_nombre} · {modalCartilla.raza_nombre} · Dueño: {modalCartilla.dueno}
            </p>
            {modalCartilla.cartilla_pdf ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#16a34a', fontWeight: '700', marginBottom: '12px' }}>✓ Cartilla disponible</p>
                  <a href={modalCartilla.cartilla_pdf} target="_blank" rel="noreferrer"
                    className="btn-add-boutique"
                    style={{ padding: '8px 20px', fontSize: '11px', backgroundColor: '#16a34a', textDecoration: 'none', display: 'inline-block' }}>
                    ⬇ DESCARGAR CARTILLA
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ background: '#fafafa', border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '0.9rem' }}>No hay cartilla registrada</p>
              </div>
            )}
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setModalCartilla(null)}>CERRAR</button>
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
        </div>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>NOMBRE</th>
                <th>DUEÑO</th>
                <th>ESPECIE / RAZA</th>
                <th>EDAD</th>
                <th>SEXO</th>
                <th>PESO</th>
                <th>CARTILLA</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map(p => (
                <tr key={p.id_paciente}>
                  <td className="name-cell">{p.nombre}</td>
                  <td style={{ fontSize: '0.85rem' }}>{p.dueno ?? '—'}</td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {p.especie_nombre ?? '—'} / {p.raza_nombre ?? '—'}
                  </td>
                  <td>{p.edad} años</td>
                  <td>{p.sexo === 'M' ? 'Macho' : 'Hembra'}</td>
                  <td>{p.peso ? `${p.peso} kg` : '—'}</td>
                  <td>
                    {p.cartilla_pdf ? (
                      <button className="btn-add-boutique"
                        style={{ padding: '4px 10px', fontSize: '10px', backgroundColor: '#16a34a' }}
                        onClick={() => setModalCartilla(p)}>
                        💉 VER
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin cartilla</span>
                    )}
                  </td>
                  <td className="actions-cell">
                    <button className="btn-add-boutique"
                      style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#f59e0b', marginRight: '6px' }}
                      onClick={() => abrirEditar(p)}>
                      EDITAR
                    </button>
                    <button className="btn-add-boutique"
                      style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#ef4444' }}
                      onClick={() => handleEliminar(p.id_paciente)}>
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
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', color: '#1e3a5f', marginBottom: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#64748b' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnCancelar: { padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px' },
  btnGuardar: { padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px' },
};

export default MisPacientes;