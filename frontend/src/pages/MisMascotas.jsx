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

  // Modal historial
  const [modalHistorial, setModalHistorial] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  // Modal cartilla
  const [modalCartilla, setModalCartilla] = useState(null);
  const [subiendoCartilla, setSubiendoCartilla] = useState(false);

  const cargarMascotas = useCallback(async () => {
    try {
      if (isAdmin) {
        const res = await fetch('http://localhost:8000/api/v1/pacientes/');
        setMascotas(await res.json());
      } else if (usuario) {
        const resC = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs = await resC.json();
        const miCliente = cs.find(c => String(c.id_usuario) === String(usuario.id_usuario));
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
      fetch('http://localhost:8000/api/v1/clientes/').then(r => r.json()).then(setClientes);
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
          nombre: form.nombre.trim(), sexo: form.sexo,
          edad: parseInt(form.edad), id_raza: parseInt(form.id_raza), id_cliente: clienteId
        })
      });
      if (res.ok) {
        setMostrarForm(false);
        setForm({ nombre: '', sexo: 'M', edad: '', id_raza: '', id_cliente: '' });
        setEspecieSeleccionada(''); setRazas([]);
        cargarMascotas();
      } else {
        const data = await res.json();
        setErrForm(JSON.stringify(data));
      }
    } catch { setErrForm('Error al conectar con el servidor'); }
  };

  // ─── Historial ────────────────────────────────────────────────────────────
  const verHistorial = async (mascota) => {
    setModalHistorial(mascota);
    setLoadingHistorial(true);
    setHistorial([]);
    try {
      const res = await fetch('http://localhost:8000/api/v1/resultados/');
      const datos = await res.json();
      const filtrados = datos.filter(r => r.paciente_nombre === mascota.nombre);
      setHistorial(filtrados);
    } catch { setHistorial([]); }
    finally { setLoadingHistorial(false); }
  };

  // ─── Cartilla ─────────────────────────────────────────────────────────────
  const handleSubirCartilla = async (mascota, archivo) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf')) { alert('Solo se permiten archivos PDF'); return; }
    if (archivo.size > 10 * 1024 * 1024) { alert('El archivo no puede superar 10MB'); return; }
    setSubiendoCartilla(true);
    const formData = new FormData();
    formData.append('cartilla_pdf', archivo);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pacientes/${mascota.id_paciente}/subir_cartilla/`, {
        method: 'PATCH', body: formData
      });
      if (res.ok) { cargarMascotas(); setModalCartilla(null); }
      else alert('Error al subir la cartilla');
    } catch { alert('Error al conectar con el servidor'); }
    finally { setSubiendoCartilla(false); }
  };

  const handleEliminarCartilla = async (mascota) => {
    if (!window.confirm('¿Seguro que quieres eliminar la cartilla?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/pacientes/${mascota.id_paciente}/eliminar_cartilla/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) { cargarMascotas(); setModalCartilla(null); }
      else alert('Error al eliminar la cartilla');
    } catch { alert('Error al conectar con el servidor'); }
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

      {/* ── Formulario nueva mascota ── */}
      {mostrarForm && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Nueva Mascota</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>NOMBRE *</label>
              <input type="text" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                placeholder="Nombre de la mascota" maxLength={50} />
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
              <input type="number" value={form.edad} onChange={e => setForm({ ...form, edad: e.target.value })}
                placeholder="0" min="0" max="30" />
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
              <select value={form.id_raza} onChange={e => setForm({ ...form, id_raza: e.target.value })} disabled={!especieSeleccionada}>
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
            {errForm && <p style={{ color: '#ef4444', gridColumn: '1/-1', fontSize: '0.85rem' }}>{errForm}</p>}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-add-boutique">GUARDAR</button>
              <button type="button" className="btn-add-boutique" style={{ backgroundColor: '#64748b' }}
                onClick={() => { setMostrarForm(false); setErrForm(''); }}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal historial clínico ── */}
      {modalHistorial && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>HISTORIAL DE {modalHistorial.nombre.toUpperCase()}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              {modalHistorial.especie_nombre} · {modalHistorial.raza_nombre} · {modalHistorial.edad} años
            </p>
            {loadingHistorial ? (
              <p style={{ color: '#64748b' }}>Cargando...</p>
            ) : historial.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                No hay estudios registrados para esta mascota.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {historial.map(h => (
                  <div key={h.id_resultado} style={{
                    background: '#f8fafc', borderRadius: '8px', padding: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '700', color: '#1e3a5f', fontSize: '0.9rem' }}>
                        #{String(h.id_solicitud).padStart(3, '0')}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(h.fecha_muestra).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                      <strong>Veterinario:</strong> {h.veterinario_nombre}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: '#1e293b', marginBottom: '6px' }}>
                      <strong>Reporte:</strong> {h.reporte_clinico}
                    </p>
                    {h.observaciones && (
                      <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        <strong>Observaciones:</strong> {h.observaciones}
                      </p>
                    )}
                    {h.archivo_pdf && (
                      <a href={h.archivo_pdf} target="_blank" rel="noreferrer"
                        className="btn-add-boutique"
                        style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#16a34a', textDecoration: 'none', display: 'inline-block', marginTop: '8px' }}>
                        ⬇ DESCARGAR PDF
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setModalHistorial(null)}>CERRAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal cartilla de vacunación ── */}
      {modalCartilla && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '480px' }}>
            <h2 style={styles.modalTitle}>CARTILLA DE {modalCartilla.nombre.toUpperCase()}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>
              {modalCartilla.especie_nombre} · {modalCartilla.raza_nombre}
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
                <button className="btn-add-boutique"
                  style={{ padding: '8px 20px', fontSize: '11px', backgroundColor: '#ef4444' }}
                  onClick={() => handleEliminarCartilla(modalCartilla)}>
                  🗑 ELIMINAR CARTILLA
                </button>
              </div>
            ) : (
              <div style={{ background: '#fafafa', border: '2px dashed #e2e8f0', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
                <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '0.9rem' }}>
                  No hay cartilla registrada
                </p>
                <label style={{ cursor: 'pointer' }}>
                  <span className="btn-add-boutique"
                    style={{ padding: '10px 24px', fontSize: '12px', backgroundColor: '#7c3aed', display: 'inline-block' }}>
                    {subiendoCartilla ? 'SUBIENDO...' : '📤 SUBIR CARTILLA PDF'}
                  </span>
                  <input type="file" accept=".pdf" style={{ display: 'none' }}
                    onChange={e => handleSubirCartilla(modalCartilla, e.target.files[0])} />
                </label>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Máximo 10MB</p>
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
                    <button className="btn-action edit" title="Ver Historial Clínico"
                      onClick={() => verHistorial(m)}>📋</button>
                    <button className="btn-action view" title="Cartilla de Vacunación"
                      onClick={() => setModalCartilla(m)}>💉</button>
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
  modal: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', color: '#1e3a5f', marginBottom: '8px' },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnCancelar: { padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px' },
};

export default MisMascotas;