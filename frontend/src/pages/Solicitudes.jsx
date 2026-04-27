import React, { useState, useEffect, useCallback } from 'react';
import './Pages.css';

const Solicitudes = ({ usuario, isAdmin, isVeterinario }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudEstudios, setSolicitudEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [form, setForm] = useState({ id_paciente: '', notas_cliente: '', estudiosSeleccionados: [] });
  const [errForm, setErrForm] = useState({});
  const [errEstado, setErrEstado] = useState('');
  const [procesando, setProcesando] = useState(null);

  const [modalFinalizar, setModalFinalizar] = useState(null);
  const [formResultado, setFormResultado] = useState({ id_vet: '', fecha_muestra: '', observaciones: '', reporte_clinico: '' });
  const [errResultado, setErrResultado] = useState({});
  const [guardandoResultado, setGuardandoResultado] = useState(false);

  const [modalRechazar, setModalRechazar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [errMotivo, setErrMotivo] = useState('');

  const [modalModificar, setModalModificar] = useState(null);
  const [formModificar, setFormModificar] = useState({ id_paciente: '', notas_cliente: '', estudiosSeleccionados: [] });
  const [errModificar, setErrModificar] = useState({});
  const [guardandoModificar, setGuardandoModificar] = useState(false);

  const [modalEditarSol, setModalEditarSol] = useState(null);
  const [formEditarSol, setFormEditarSol] = useState({ id_paciente: '', notas_cliente: '', estudiosSeleccionados: [] });
  const [guardandoEditarSol, setGuardandoEditarSol] = useState(false);
  const [errEditarSol, setErrEditarSol] = useState({});
  const [modalEliminarSol, setModalEliminarSol] = useState(null);

  const sanitizar = (valor) => valor.replace(/<[^>]*>?/gm, '');

  // ── HELPERS DE COSTO ──────────────────────────────────────────────────────

  const calcularTotal = (idSolicitud) => {
    const relacionados = solicitudEstudios.filter(se => se.id_solicitud === idSolicitud);
    return relacionados.reduce((sum, se) => {
      const est = estudios.find(e => e.id_catalogo === se.id_catalogo);
      return sum + (est ? parseFloat(est.precio) : 0);
    }, 0);
  };

  const calcularTotalSeleccionados = (seleccionados) =>
    seleccionados.reduce((sum, id) => {
      const est = estudios.find(e => e.id_catalogo === id);
      return sum + (est ? parseFloat(est.precio) : 0);
    }, 0);

  const formatPrecio = (n) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });

  // ── CARGA DE DATOS ────────────────────────────────────────────────────────

  const cargarSolicitudes = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/solicitudes/');
      if (!res.ok) throw new Error();
      const datos = await res.json();

      if (isAdmin) {
        setSolicitudes(datos);

      } else if (isVeterinario && usuario) {
        try {
          const resClientes = await fetch(
            `http://localhost:8000/api/v1/veterinarios/mis_clientes/?id_usuario=${usuario.id_usuario}`
          );

          if (resClientes.ok) {
            const misClientes = await resClientes.json();

            if (misClientes.length === 0) {
              // Sin clientes asignados — muestra todos los pacientes y todas las solicitudes
              // para que el vet pueda operar igual mientras el admin le asigna clientes
              const resP = await fetch('http://localhost:8000/api/v1/pacientes/');
              const todosP = resP.ok ? await resP.json() : [];
              setPacientes(todosP);
              setSolicitudes(datos);
            } else {
              // Con clientes asignados — filtra solo sus pacientes y solicitudes
              const pacientesPromises = misClientes.map(c =>
                fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${c.id_cliente}`)
                  .then(r => r.json())
              );
              const pacientesPorCliente = await Promise.all(pacientesPromises);
              const todosPacientes = pacientesPorCliente.flat();
              setPacientes(todosPacientes);
              setSolicitudes(
                datos.filter(s => todosPacientes.map(p => p.id_paciente).includes(s.id_paciente))
              );
            }
          } else {
            // Endpoint falló — fallback a todos
            const resP = await fetch('http://localhost:8000/api/v1/pacientes/');
            const todosP = resP.ok ? await resP.json() : [];
            setPacientes(todosP);
            setSolicitudes(datos);
          }
        } catch {
          // Error de red — fallback a todos
          const resP = await fetch('http://localhost:8000/api/v1/pacientes/');
          const todosP = resP.ok ? await resP.json() : [];
          setPacientes(todosP);
          setSolicitudes(datos);
        }

      } else if (usuario) {
        // Cliente normal — solo sus mascotas
        const resC = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs = await resC.json();
        const miCliente = cs.find(c => String(c.id_usuario) === String(usuario.id_usuario));
        if (miCliente) {
          const resP = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          const misP = await resP.json();
          const ids = misP.map(p => p.id_paciente);
          setSolicitudes(datos.filter(s => ids.includes(s.id_paciente)));
        }
      }
    } catch { setError('Error al cargar datos.'); }
    finally { setLoading(false); }
  }, [isAdmin, isVeterinario, usuario]);

  useEffect(() => {
    cargarSolicitudes();
    fetch('http://localhost:8000/api/v1/solicitud-estudios/').then(r => r.json()).then(setSolicitudEstudios);
    fetch('http://localhost:8000/api/v1/estudios/').then(r => r.json()).then(setEstudios);
    if (isAdmin) {
      fetch('http://localhost:8000/api/v1/pacientes/').then(r => r.json()).then(setPacientes);
      fetch('http://localhost:8000/api/v1/veterinarios/').then(r => r.json()).then(setVeterinarios);
    }
  }, [cargarSolicitudes, isAdmin]);

  const recargarEstudios = () =>
    fetch('http://localhost:8000/api/v1/solicitud-estudios/').then(r => r.json()).then(setSolicitudEstudios);

  // ── FORMULARIO ────────────────────────────────────────────────────────────

  const toggleEstudio = (id) => {
    setForm(prev => ({
      ...prev,
      estudiosSeleccionados: prev.estudiosSeleccionados.includes(id)
        ? prev.estudiosSeleccionados.filter(e => e !== id)
        : [...prev.estudiosSeleccionados, id]
    }));
    setErrForm(prev => ({ ...prev, estudiosSeleccionados: '' }));
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: sanitizar(value) }));
    setErrForm(prev => ({ ...prev, [name]: '' }));
    if (name === 'id_paciente' && value) {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/pacientes/${value}/`);
        if (res.ok) {
          const paciente = await res.json();
          setForm(prev => ({ ...prev, id_paciente: value, notas_cliente: paciente.anamnesis || '' }));
        }
      } catch { }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let errores = {};
    if (!form.id_paciente) errores.id_paciente = 'Selecciona un paciente';
    if (form.estudiosSeleccionados.length === 0) errores.estudiosSeleccionados = 'Selecciona al menos un estudio';
    if (Object.keys(errores).length > 0) { setErrForm(errores); return; }
    setErrForm({});
    try {
      const resSol = await fetch('http://localhost:8000/api/v1/solicitudes/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: parseInt(form.id_paciente),
          estado: 'pendiente',
          notas_cliente: form.notas_cliente.trim()
        })
      });
      if (!resSol.ok) { setErrForm({ general: 'Error al crear solicitud' }); return; }
      const nuevaSol = await resSol.json();
      await Promise.all(form.estudiosSeleccionados.map(id =>
        fetch('http://localhost:8000/api/v1/solicitud-estudios/', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_solicitud: nuevaSol.id_solicitud, id_catalogo: id })
        })
      ));
      setMostrarForm(false);
      setForm({ id_paciente: '', notas_cliente: '', estudiosSeleccionados: [] });
      cargarSolicitudes();
      recargarEstudios();
    } catch { setErrForm({ general: 'Error al conectar con el servidor' }); }
  };

  // ── ACCIONES ADMIN ────────────────────────────────────────────────────────

  const accionAdmin = async (sol, nuevoEstado) => {
    setErrEstado('');
    setProcesando(sol.id_solicitud);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/solicitudes/${sol.id_solicitud}/cambiar_estado/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) cargarSolicitudes();
      else setErrEstado('Error al cambiar el estado.');
    } catch { setErrEstado('Error al conectar.'); }
    finally { setProcesando(null); }
  };

  const rechazarSolicitud = async () => {
    if (!motivoCancelacion.trim()) { setErrMotivo('Debes escribir el motivo.'); return; }
    setProcesando(modalRechazar.id_solicitud);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/solicitudes/${modalRechazar.id_solicitud}/cambiar_estado/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelado', motivo_cancelacion: motivoCancelacion.trim() })
      });
      if (res.ok) {
        setModalRechazar(null); setMotivoCancelacion(''); setErrMotivo(''); cargarSolicitudes();
      } else setErrMotivo('Error al cancelar.');
    } catch { setErrMotivo('Error al conectar.'); }
    finally { setProcesando(null); }
  };

  const handleGuardarResultado = async () => {
    let errores = {};
    if (!formResultado.id_vet) errores.id_vet = 'Selecciona un veterinario';
    if (!formResultado.fecha_muestra) errores.fecha_muestra = 'Fecha obligatoria';
    if (!formResultado.reporte_clinico.trim()) errores.reporte_clinico = 'Reporte obligatorio';
    else if (formResultado.reporte_clinico.trim().length < 20) errores.reporte_clinico = 'Mínimo 20 caracteres';
    if (Object.keys(errores).length > 0) { setErrResultado(errores); return; }
    setGuardandoResultado(true);
    try {
      const r1 = await fetch('http://localhost:8000/api/v1/resultados/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_solicitud: modalFinalizar.id_solicitud,
          id_vet: parseInt(formResultado.id_vet),
          fecha_muestra: formResultado.fecha_muestra,
          observaciones: formResultado.observaciones.trim(),
          reporte_clinico: formResultado.reporte_clinico.trim()
        })
      });
      if (!r1.ok) { setErrResultado({ general: 'Error al crear resultado.' }); return; }
      const r2 = await fetch(`http://localhost:8000/api/v1/solicitudes/${modalFinalizar.id_solicitud}/cambiar_estado/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'finalizado' })
      });
      if (!r2.ok) { setErrResultado({ general: 'Resultado creado pero error al finalizar.' }); return; }
      setModalFinalizar(null);
      setFormResultado({ id_vet: '', fecha_muestra: '', observaciones: '', reporte_clinico: '' });
      cargarSolicitudes();
    } catch { setErrResultado({ general: 'Error al conectar.' }); }
    finally { setGuardandoResultado(false); }
  };

  // ── MODIFICAR / EDITAR / ELIMINAR ────────────────────────────────────────

  const abrirModalModificar = (sol) => {
    const estudiosActuales = solicitudEstudios
      .filter(se => se.id_solicitud === sol.id_solicitud)
      .map(se => se.id_catalogo);
    setFormModificar({ id_paciente: sol.id_paciente, notas_cliente: sol.notas_cliente || '', estudiosSeleccionados: estudiosActuales });
    setErrModificar({});
    setModalModificar(sol);
  };

  const toggleEstudioModificar = (id) => {
    setFormModificar(prev => ({
      ...prev,
      estudiosSeleccionados: prev.estudiosSeleccionados.includes(id)
        ? prev.estudiosSeleccionados.filter(e => e !== id)
        : [...prev.estudiosSeleccionados, id]
    }));
  };

  const guardarModificacion = async () => {
    if (!formModificar.id_paciente) { setErrModificar({ id_paciente: 'Selecciona un paciente' }); return; }
    if (formModificar.estudiosSeleccionados.length === 0) { setErrModificar({ estudiosSeleccionados: 'Selecciona al menos un estudio' }); return; }
    setGuardandoModificar(true);
    try {
      const r1 = await fetch(`http://localhost:8000/api/v1/solicitudes/${modalModificar.id_solicitud}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: parseInt(formModificar.id_paciente),
          estado: 'pendiente',
          notas_cliente: formModificar.notas_cliente.trim(),
          motivo_cancelacion: null
        })
      });
      if (!r1.ok) { setErrModificar({ general: 'Error al actualizar.' }); return; }
      const anteriores = solicitudEstudios.filter(se => se.id_solicitud === modalModificar.id_solicitud);
      await Promise.all(anteriores.map(se =>
        fetch(`http://localhost:8000/api/v1/solicitud-estudios/${se.id}/`, { method: 'DELETE' })
      ));
      await Promise.all(formModificar.estudiosSeleccionados.map(id =>
        fetch('http://localhost:8000/api/v1/solicitud-estudios/', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_solicitud: modalModificar.id_solicitud, id_catalogo: id })
        })
      ));
      setModalModificar(null);
      cargarSolicitudes();
      recargarEstudios();
    } catch { setErrModificar({ general: 'Error al conectar.' }); }
    finally { setGuardandoModificar(false); }
  };

  const abrirEditarSol = (sol) => {
    const estudiosActuales = solicitudEstudios
      .filter(se => se.id_solicitud === sol.id_solicitud)
      .map(se => se.id_catalogo);
    setFormEditarSol({ id_paciente: sol.id_paciente, notas_cliente: sol.notas_cliente || '', estudiosSeleccionados: estudiosActuales });
    setErrEditarSol({});
    setModalEditarSol(sol);
  };

  const guardarEdicionSol = async () => {
    if (!formEditarSol.id_paciente) { setErrEditarSol({ id_paciente: 'Selecciona un paciente' }); return; }
    if (formEditarSol.estudiosSeleccionados.length === 0) { setErrEditarSol({ estudiosSeleccionados: 'Selecciona al menos un estudio' }); return; }
    setGuardandoEditarSol(true);
    try {
      const r1 = await fetch(`http://localhost:8000/api/v1/solicitudes/${modalEditarSol.id_solicitud}/`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: parseInt(formEditarSol.id_paciente),
          notas_cliente: formEditarSol.notas_cliente.trim()
        })
      });
      if (!r1.ok) { setErrEditarSol({ general: 'Error al actualizar.' }); return; }
      const anteriores = solicitudEstudios.filter(se => se.id_solicitud === modalEditarSol.id_solicitud);
      await Promise.all(anteriores.map(se =>
        fetch(`http://localhost:8000/api/v1/solicitud-estudios/${se.id}/`, { method: 'DELETE' })
      ));
      await Promise.all(formEditarSol.estudiosSeleccionados.map(id =>
        fetch('http://localhost:8000/api/v1/solicitud-estudios/', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_solicitud: modalEditarSol.id_solicitud, id_catalogo: id })
        })
      ));
      setModalEditarSol(null);
      cargarSolicitudes();
      recargarEstudios();
    } catch { setErrEditarSol({ general: 'Error al conectar.' }); }
    finally { setGuardandoEditarSol(false); }
  };

  const eliminarSolicitud = async () => {
    try {
      const anteriores = solicitudEstudios.filter(se => se.id_solicitud === modalEliminarSol.id_solicitud);
      await Promise.all(anteriores.map(se =>
        fetch(`http://localhost:8000/api/v1/solicitud-estudios/${se.id}/`, { method: 'DELETE' })
      ));
      const res = await fetch(`http://localhost:8000/api/v1/solicitudes/${modalEliminarSol.id_solicitud}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setModalEliminarSol(null);
      cargarSolicitudes();
      recargarEstudios();
    } catch {
      setModalEliminarSol(null);
      setErrEstado('No se pudo eliminar la solicitud.');
    }
  };

  // ── COMPONENTES INTERNOS ─────────────────────────────────────────────────

  const badgeEstado = (estado) => (
    <span className={`status-badge status-${estado.toLowerCase()}`}>
      {estado.replace(/_/g, ' ')}
    </span>
  );

  const ResumenCosto = ({ seleccionados }) => {
    if (seleccionados.length === 0) return null;
    return (
      <div style={{ marginTop: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 16px' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', letterSpacing: '1px', marginBottom: '8px' }}>
          RESUMEN DE COSTOS
        </p>
        {seleccionados.map(id => {
          const est = estudios.find(e => e.id_catalogo === id);
          return est ? (
            <div key={id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: '#374151', marginBottom: '4px' }}>
              <span>{est.nombre}</span>
              <span style={{ fontWeight: '600' }}>{formatPrecio(parseFloat(est.precio))}</span>
            </div>
          ) : null;
        })}
        <div style={{ borderTop: '1px solid #bbf7d0', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#15803d' }}>TOTAL</span>
          <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#15803d' }}>
            {formatPrecio(calcularTotalSeleccionados(seleccionados))}
          </span>
        </div>
      </div>
    );
  };

  const CheckboxEstudios = ({ seleccionados, onToggle }) => (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px',
      padding: '12px', background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '8px', maxHeight: '180px', overflowY: 'auto'
    }}>
      {estudios.map(e => {
        const sel = seleccionados.includes(e.id_catalogo);
        return (
          <label key={e.id_catalogo} style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
            borderRadius: '6px', cursor: 'pointer',
            background: sel ? '#e0f2fe' : '#f8fafc',
            border: sel ? '1px solid #0369a1' : '1px solid #e2e8f0',
          }}>
            <input type="checkbox" checked={sel} onChange={() => onToggle(e.id_catalogo)}
              style={{ accentColor: '#0369a1', width: '16px', height: '16px' }} />
            <span style={{ fontSize: '0.85rem' }}>
              <strong>{e.nombre}</strong>
              <span style={{ color: '#64748b', marginLeft: '4px' }}>{formatPrecio(parseFloat(e.precio))}</span>
            </span>
          </label>
        );
      })}
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="page-container">
   <header className="page-header-boutique">
  <div className="header-text">
    <h1 className="title-boutique">SOLICITUDES</h1>
    <p className="subtitle-boutique">
      {isAdmin ? 'Aprobación de órdenes de laboratorio' : isVeterinario ? 'Órdenes de mis clientes' : 'Mis órdenes de estudio'}
    </p>
  </div>

  {/* Solo el Veterinario verá el botón de agregar */}
  {isVeterinario && (
    <button 
      className="btn-add-boutique" 
      onClick={() => { setMostrarForm(!mostrarForm); setErrForm({}); }}
    >
      +
    </button>
  )}
</header>

      {/* ── Form nueva solicitud ── */}
      {mostrarForm && isVeterinario && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Nueva Solicitud</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-group">
              <label>PACIENTE *</label>
              <select name="id_paciente" value={form.id_paciente} onChange={handleChange}
                className={errForm.id_paciente ? 'input-error' : ''}>
                <option value="">Seleccionar paciente</option>
                {pacientes.map(p => (
                  <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} - {p.dueno ?? ''}</option>
                ))}
              </select>
              {errForm.id_paciente && <span className="error-message">{errForm.id_paciente}</span>}
            </div>
            <div className="input-group">
              <label>ESTUDIOS * <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(puedes seleccionar varios)</span></label>
              <CheckboxEstudios seleccionados={form.estudiosSeleccionados} onToggle={toggleEstudio} />
              {errForm.estudiosSeleccionados && <span className="error-message">{errForm.estudiosSeleccionados}</span>}
              <ResumenCosto seleccionados={form.estudiosSeleccionados} />
            </div>
            <div className="input-group">
              <label>ANAMNESIS <span style={{ color: '#94a3b8', fontWeight: 'normal' }}>(prellenado con anamnesis del paciente — máx. 200)</span></label>
              <textarea name="notas_cliente" value={form.notas_cliente} onChange={handleChange}
                placeholder="Selecciona un paciente para cargar su anamnesis..." maxLength={200} rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }} />
              <span style={{ fontSize: '11px', color: form.notas_cliente.length > 180 ? '#ef4444' : '#94a3b8' }}>
                {form.notas_cliente.length}/200
              </span>
            </div>
            {errForm.general && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errForm.general}</p>}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-add-boutique">GUARDAR</button>
              <button type="button" className="btn-add-boutique" style={{ backgroundColor: '#64748b' }}
                onClick={() => { setMostrarForm(false); setErrForm({}); }}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Modal editar solicitud (veterinario) ── */}
      {modalEditarSol && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>EDITAR SOLICITUD #{String(modalEditarSol.id_solicitud).padStart(3, '0')}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.field}>
                <label style={styles.label}>PACIENTE *</label>
                <select style={styles.input} value={formEditarSol.id_paciente}
                  onChange={e => setFormEditarSol(p => ({ ...p, id_paciente: e.target.value }))}>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} - {p.dueno ?? ''}</option>
                  ))}
                </select>
                {errEditarSol.id_paciente && <span style={styles.err}>{errEditarSol.id_paciente}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>ESTUDIOS * <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(puedes seleccionar varios)</span></label>
                <CheckboxEstudios
                  seleccionados={formEditarSol.estudiosSeleccionados}
                  onToggle={id => setFormEditarSol(prev => ({
                    ...prev,
                    estudiosSeleccionados: prev.estudiosSeleccionados.includes(id)
                      ? prev.estudiosSeleccionados.filter(e => e !== id)
                      : [...prev.estudiosSeleccionados, id]
                  }))}
                />
                {errEditarSol.estudiosSeleccionados && <span style={styles.err}>{errEditarSol.estudiosSeleccionados}</span>}
                <ResumenCosto seleccionados={formEditarSol.estudiosSeleccionados} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>ANAMNESIS <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(opcional, máx. 200)</span></label>
                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} maxLength={200}
                  value={formEditarSol.notas_cliente}
                  onChange={e => setFormEditarSol(p => ({ ...p, notas_cliente: e.target.value }))}
                  placeholder="Observaciones" />
              </div>
              {errEditarSol.general && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errEditarSol.general}</p>}
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setModalEditarSol(null)}>CANCELAR</button>
              <button style={{ ...styles.btnGuardar, background: '#f59e0b' }} onClick={guardarEdicionSol} disabled={guardandoEditarSol}>
                {guardandoEditarSol ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal confirmar eliminar solicitud ── */}
      {modalEliminarSol && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🐾</div>
            <h3 style={{ color: '#1e3a5f', marginBottom: '8px', fontSize: '1rem', fontWeight: '700' }}>
              ¿Eliminar esta solicitud?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Solicitud #{String(modalEliminarSol.id_solicitud).padStart(3, '0')} — {modalEliminarSol.paciente_nombre}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button style={styles.btnCancelar} onClick={() => setModalEliminarSol(null)}>CANCELAR</button>
              <button style={{ ...styles.btnGuardar, background: '#ef4444' }} onClick={eliminarSolicitud}>ELIMINAR</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal rechazar ── */}
      {modalRechazar && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: '480px' }}>
            <h2 style={styles.modalTitle}>RECHAZAR SOLICITUD #{String(modalRechazar.id_solicitud).padStart(3, '0')}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
              Paciente: <strong>{modalRechazar.paciente_nombre}</strong>
            </p>
            <div style={styles.field}>
              <label style={styles.label}>MOTIVO DE CANCELACIÓN *</label>
              <textarea style={{ ...styles.input, height: '100px', resize: 'vertical' }}
                placeholder="Explica al veterinario el motivo del rechazo..."
                value={motivoCancelacion} maxLength={500}
                onChange={e => { setMotivoCancelacion(e.target.value); setErrMotivo(''); }} />
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{motivoCancelacion.length}/500</span>
              {errMotivo && <span style={styles.err}>{errMotivo}</span>}
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => { setModalRechazar(null); setMotivoCancelacion(''); setErrMotivo(''); }}>
                CANCELAR
              </button>
              <button style={{ ...styles.btnGuardar, background: '#ef4444' }} onClick={rechazarSolicitud}>
                CONFIRMAR RECHAZO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal finalizar ── */}
      {modalFinalizar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>FINALIZAR SOLICITUD #{String(modalFinalizar.id_solicitud).padStart(3, '0')}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px' }}>
              Paciente: <strong>{modalFinalizar.paciente_nombre}</strong>
            </p>
            {/* Desglose de costos en modal finalizar */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', letterSpacing: '1px', marginBottom: '6px' }}>
                ESTUDIOS A PROCESAR
              </p>
              {solicitudEstudios.filter(se => se.id_solicitud === modalFinalizar.id_solicitud).map(se => {
                const est = estudios.find(e => e.id_catalogo === se.id_catalogo);
                return (
                  <div key={se.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.83rem', color: '#374151', marginBottom: '3px' }}>
                    <span>{se.estudio_nombre}</span>
                    <span style={{ fontWeight: '600' }}>{est ? formatPrecio(parseFloat(est.precio)) : '—'}</span>
                  </div>
                );
              })}
              <div style={{ borderTop: '1px solid #bbf7d0', marginTop: '6px', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700', color: '#15803d', fontSize: '0.9rem' }}>TOTAL</span>
                <span style={{ fontWeight: '700', color: '#15803d', fontSize: '0.9rem' }}>
                  {formatPrecio(calcularTotal(modalFinalizar.id_solicitud))}
                </span>
              </div>
            </div>
            <div style={styles.grid}>
              <div style={styles.field}>
                <label style={styles.label}>VETERINARIO *</label>
                <select style={styles.input} value={formResultado.id_vet}
                  onChange={e => setFormResultado(p => ({ ...p, id_vet: e.target.value }))}>
                  <option value="">Selecciona un veterinario</option>
                  {veterinarios.map(v => <option key={v.id_vet} value={v.id_vet}>{v.nombre}</option>)}
                </select>
                {errResultado.id_vet && <span style={styles.err}>{errResultado.id_vet}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>FECHA DE MUESTRA *</label>
                <input style={styles.input} type="datetime-local"
                  value={formResultado.fecha_muestra}
                  onChange={e => setFormResultado(p => ({ ...p, fecha_muestra: e.target.value }))} />
                {errResultado.fecha_muestra && <span style={styles.err}>{errResultado.fecha_muestra}</span>}
              </div>
              <div style={{ ...styles.field, gridColumn: '1/-1' }}>
                <label style={styles.label}>OBSERVACIONES <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(opcional, máx. 300)</span></label>
                <input style={styles.input} type="text" maxLength={300}
                  value={formResultado.observaciones}
                  onChange={e => setFormResultado(p => ({ ...p, observaciones: e.target.value }))}
                  placeholder="Observaciones generales" />
              </div>
              <div style={{ ...styles.field, gridColumn: '1/-1' }}>
                <label style={styles.label}>REPORTE CLÍNICO * <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>(mín. 20, máx. 1000)</span></label>
                <textarea style={{ ...styles.input, height: '100px', resize: 'vertical' }} maxLength={1000}
                  value={formResultado.reporte_clinico}
                  onChange={e => setFormResultado(p => ({ ...p, reporte_clinico: e.target.value }))}
                  placeholder="Describe los resultados del estudio..." />
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formResultado.reporte_clinico.length}/1000</span>
                {errResultado.reporte_clinico && <span style={styles.err}>{errResultado.reporte_clinico}</span>}
              </div>
            </div>
            {errResultado.general && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '12px' }}>{errResultado.general}</p>}
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setModalFinalizar(null)}>CANCELAR</button>
              <button style={styles.btnGuardar} onClick={handleGuardarResultado} disabled={guardandoResultado}>
                {guardandoResultado ? 'GUARDANDO...' : 'GUARDAR Y FINALIZAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal modificar (canceladas) ── */}
      {modalModificar && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>MODIFICAR SOLICITUD #{String(modalModificar.id_solicitud).padStart(3, '0')}</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>
              Se reactivará como <strong>pendiente</strong> al guardar.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={styles.field}>
                <label style={styles.label}>PACIENTE *</label>
                <select style={styles.input} value={formModificar.id_paciente}
                  onChange={e => setFormModificar(p => ({ ...p, id_paciente: e.target.value }))}>
                  <option value="">Seleccionar paciente</option>
                  {pacientes.map(p => (
                    <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} - {p.dueno ?? ''}</option>
                  ))}
                </select>
                {errModificar.id_paciente && <span style={styles.err}>{errModificar.id_paciente}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>ESTUDIOS *</label>
                <CheckboxEstudios seleccionados={formModificar.estudiosSeleccionados} onToggle={toggleEstudioModificar} />
                {errModificar.estudiosSeleccionados && <span style={styles.err}>{errModificar.estudiosSeleccionados}</span>}
                <ResumenCosto seleccionados={formModificar.estudiosSeleccionados} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>NOTAS</label>
                <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }} maxLength={200}
                  value={formModificar.notas_cliente}
                  onChange={e => setFormModificar(p => ({ ...p, notas_cliente: e.target.value }))}
                  placeholder="Observaciones" />
              </div>
              {errModificar.general && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{errModificar.general}</p>}
            </div>
            <div style={styles.modalBtns}>
              <button style={styles.btnCancelar} onClick={() => setModalModificar(null)}>CANCELAR</button>
              <button style={{ ...styles.btnGuardar, background: '#f59e0b' }} onClick={guardarModificacion} disabled={guardandoModificar}>
                {guardandoModificar ? 'GUARDANDO...' : 'GUARDAR Y REENVIAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabla ── */}
      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : solicitudes.length === 0 ? (
        <p className="subtitle-boutique">No hay solicitudes registradas.</p>
      ) : (
        <div className="table-responsive">
          {errEstado && <p style={{ color: '#ef4444', marginBottom: '12px', fontSize: '0.85rem' }}>{errEstado}</p>}
          <table className="boutique-table">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>PACIENTE</th>
                {(isAdmin || isVeterinario) && <th>DUEÑO</th>}
                <th>ESTUDIOS Y COSTO</th>
                <th>ANAMNESIS</th>
                <th>ESTADO</th>
                <th>FECHA</th>
                {isAdmin && <th style={{ textAlign: 'center' }}>ACCIONES</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => {
                const enProceso = procesando === sol.id_solicitud;
                const terminada = sol.estado === 'cancelado' || sol.estado === 'finalizado';
                const estudiosDeSol = solicitudEstudios.filter(se => se.id_solicitud === sol.id_solicitud);
                const totalSol = calcularTotal(sol.id_solicitud);
                return (
                  <tr key={sol.id_solicitud}>
                    <td className="id-cell">#{String(sol.id_solicitud).padStart(3, '0')}</td>
                    <td className="name-cell">{sol.paciente_nombre}</td>
                    {(isAdmin || isVeterinario) && <td style={{ fontSize: '0.85rem' }}>{sol.dueno}</td>}

                    {/* ── ESTUDIOS Y COSTO ── */}
                    <td>
                      {estudiosDeSol.map(se => {
                        const est = estudios.find(e => e.id_catalogo === se.id_catalogo);
                        return (
                          <div key={se.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '3px' }}>
                            <span style={{
                              display: 'inline-block', background: '#e0f2fe', color: '#0369a1',
                              borderRadius: '4px', padding: '2px 6px', fontSize: '0.75rem'
                            }}>{se.estudio_nombre}</span>
                            {est && (
                              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                                {formatPrecio(parseFloat(est.precio))}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {estudiosDeSol.length > 0 && (
                        <div style={{
                          marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #e2e8f0',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '0.72rem', color: '#374151', fontWeight: '700' }}>TOTAL</span>
                          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: '700' }}>
                            {formatPrecio(totalSol)}
                          </span>
                        </div>
                      )}
                    </td>

                    <td style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>{sol.notas_cliente || '—'}</td>

                    {/* ── ESTADO ── */}
                    <td>
                      {badgeEstado(sol.estado)}
                      {sol.estado === 'cancelado' && sol.motivo_cancelacion && (
                        <p style={{ fontSize: '0.75rem', color: '#ef4444', margin: '4px 0 0', fontStyle: 'italic' }}>
                          Motivo: {sol.motivo_cancelacion}
                        </p>
                      )}
                      {sol.estado === 'cancelado' && isVeterinario && (
                        <button className="btn-add-boutique"
                          style={{ padding: '4px 10px', fontSize: '10px', backgroundColor: '#f59e0b', marginTop: '6px', display: 'block' }}
                          onClick={() => abrirModalModificar(sol)}>
                          MODIFICAR
                        </button>
                      )}
                      {sol.estado === 'pendiente' && isVeterinario && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                          <button className="btn-add-boutique"
                            style={{ padding: '4px 10px', fontSize: '10px', backgroundColor: '#f59e0b' }}
                            onClick={() => abrirEditarSol(sol)}>
                            EDITAR
                          </button>
                          <button className="btn-add-boutique"
                            style={{ padding: '4px 10px', fontSize: '10px', backgroundColor: '#ef4444' }}
                            onClick={() => setModalEliminarSol(sol)}>
                            ELIMINAR
                          </button>
                        </div>
                      )}
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>{new Date(sol.fecha_solicitud).toLocaleDateString()}</td>

                    {/* ── ACCIONES ADMIN ── */}
                    {isAdmin && (
                      <td className="actions-cell">
                        {terminada ? (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin acciones</span>
                        ) : sol.estado === 'pendiente' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-add-boutique"
                              style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#22c55e' }}
                              disabled={enProceso} onClick={() => accionAdmin(sol, 'muestra_recibida')}>
                              {enProceso ? '...' : 'ACEPTAR'}
                            </button>
                            <button className="btn-add-boutique"
                              style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#ef4444' }}
                              onClick={() => { setModalRechazar(sol); setMotivoCancelacion(''); setErrMotivo(''); }}>
                              RECHAZAR
                            </button>
                          </div>
                        ) : sol.estado === 'muestra_recibida' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-add-boutique"
                              style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#f59e0b' }}
                              disabled={enProceso} onClick={() => accionAdmin(sol, 'en_proceso')}>
                              {enProceso ? '...' : 'TRABAJAR'}
                            </button>
                            <button className="btn-add-boutique"
                              style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#ef4444' }}
                              onClick={() => { setModalRechazar(sol); setMotivoCancelacion(''); setErrMotivo(''); }}>
                              CANCELAR
                            </button>
                          </div>
                        ) : sol.estado === 'en_proceso' ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-add-boutique"
                              style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#3b82f6' }}
                              onClick={() => setModalFinalizar(sol)}>
                              FINALIZAR
                            </button>
                            <button className="btn-add-boutique"
                              style={{ padding: '6px 14px', fontSize: '11px', backgroundColor: '#ef4444' }}
                              onClick={() => { setModalRechazar(sol); setMotivoCancelacion(''); setErrMotivo(''); }}>
                              CANCELAR
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Sin acciones</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  ); //RETURN
};

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' },
  modalTitle: { fontSize: '1.1rem', fontWeight: '700', letterSpacing: '2px', color: '#1e3a5f', marginBottom: '8px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '700', letterSpacing: '1px', color: '#64748b' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', width: '100%', boxSizing: 'border-box' },
  err: { fontSize: '11px', color: '#ef4444' },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' },
  btnCancelar: { padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px' },
  btnGuardar: { padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#1e3a5f', color: '#fff', cursor: 'pointer', fontWeight: '700', fontSize: '12px', letterSpacing: '1px' },
};

export default Solicitudes;