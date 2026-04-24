import React, { useState, useEffect, useCallback } from 'react';
import './Pages.css';

const Solicitudes = ({ usuario, isAdmin }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudEstudios, setSolicitudEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [pacientes, setPacientes] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [form, setForm] = useState({ id_paciente: '', notas_cliente: '', id_catalogo: '' });
  const [errForm, setErrForm] = useState('');
  const [cambiandoEstado, setCambiandoEstado] = useState(null);

  const cargarSolicitudes = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/solicitudes/');
      if (!res.ok) throw new Error();
      const datos = await res.json();

      if (isAdmin) {
        setSolicitudes(datos);
      } else if (usuario) {
        const resC = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs = await resC.json();
        const miCliente = cs.find(c => c.id_usuario === usuario.id_usuario);
        if (miCliente) {
          const resP = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          const misP = await resP.json();
          const ids = misP.map(p => p.id_paciente);
          setSolicitudes(datos.filter(s => ids.includes(s.id_paciente)));
        }
      }
    } catch { setError('Error al cargar datos.'); }
    finally { setLoading(false); }
  }, [isAdmin, usuario]);

  useEffect(() => {
    cargarSolicitudes();
    fetch('http://localhost:8000/api/v1/solicitud-estudios/')
      .then(r => r.json())
      .then(setSolicitudEstudios);
    if (isAdmin) {
      fetch('http://localhost:8000/api/v1/pacientes/')
        .then(r => r.json())
        .then(setPacientes);
      fetch('http://localhost:8000/api/v1/estudios/')
        .then(r => r.json())
        .then(setEstudios);
    }
  }, [cargarSolicitudes, isAdmin]);

  const validarForm = () => {
    if (!form.id_paciente) return 'Selecciona un paciente';
    if (!form.id_catalogo) return 'Selecciona un estudio';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validarForm();
    if (err) { setErrForm(err); return; }
    setErrForm('');
    try {
      const resSol = await fetch('http://localhost:8000/api/v1/solicitudes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_paciente: parseInt(form.id_paciente),
          estado: 'pendiente',
          notas_cliente: form.notas_cliente.trim()
        })
      });
      if (resSol.ok) {
        const nuevaSol = await resSol.json();
        await fetch('http://localhost:8000/api/v1/solicitud-estudios/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_solicitud: nuevaSol.id_solicitud,
            id_catalogo: parseInt(form.id_catalogo)
          })
        });
        setMostrarForm(false);
        setForm({ id_paciente: '', notas_cliente: '', id_catalogo: '' });
        cargarSolicitudes();
        fetch('http://localhost:8000/api/v1/solicitud-estudios/')
          .then(r => r.json())
          .then(setSolicitudEstudios);
      } else {
        const data = await resSol.json();
        setErrForm(JSON.stringify(data));
      }
    } catch { setErrForm('Error al conectar con el servidor'); }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/solicitudes/${id}/cambiar_estado/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado })
      });
      if (res.ok) {
        setCambiandoEstado(null);
        cargarSolicitudes();
      }
    } catch { alert('Error al cambiar estado'); }
  };

  const estados = ['pendiente', 'muestra_recibida', 'en_proceso', 'finalizado', 'cancelado'];

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="title-boutique">SOLICITUDES</h1>
          <p className="subtitle-boutique">{isAdmin ? 'Gestion de ordenes de laboratorio' : 'Mis ordenes de estudio'}</p>
        </div>
        {isAdmin && (
          <button className="btn-add-boutique" onClick={() => { setMostrarForm(!mostrarForm); setErrForm(''); }}>
            <span>+</span> NUEVA SOLICITUD
          </button>
        )}
      </header>

      {mostrarForm && isAdmin && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Nueva Solicitud</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>PACIENTE *</label>
              <select value={form.id_paciente} onChange={e => setForm({ ...form, id_paciente: e.target.value })}>
                <option value="">Seleccionar paciente</option>
                {pacientes.map(p => <option key={p.id_paciente} value={p.id_paciente}>{p.nombre} - {p.dueno}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>ESTUDIO *</label>
              <select value={form.id_catalogo} onChange={e => setForm({ ...form, id_catalogo: e.target.value })}>
                <option value="">Seleccionar estudio</option>
                {estudios.map(e => <option key={e.id_catalogo} value={e.id_catalogo}>{e.nombre} - ${e.precio}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1/-1' }}>
              <label>NOTAS DEL TUTOR</label>
              <input type="text" value={form.notas_cliente}
                onChange={e => setForm({ ...form, notas_cliente: e.target.value })}
                placeholder="Observaciones del tutor" maxLength={200} />
            </div>
            {errForm && <p style={{ color: '#ef4444', gridColumn: '1/-1', fontSize: '0.85rem' }}>{errForm}</p>}
            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-add-boutique">GUARDAR</button>
              <button type="button" className="btn-add-boutique" style={{ backgroundColor: '#64748b' }}
                onClick={() => { setMostrarForm(false); setErrForm(''); }}>CANCELAR</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : solicitudes.length === 0 ? (
        <p className="subtitle-boutique">No hay solicitudes registradas.</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>PACIENTE</th>
                {isAdmin && <th>DUEÑO</th>}
                <th>ESTUDIOS</th>
                <th>NOTAS</th>
                <th>ESTADO</th>
                <th>FECHA</th>
                {isAdmin && <th>ACCIONES</th>}
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((sol) => (
                <tr key={sol.id_solicitud}>
                  <td className="id-cell">#{String(sol.id_solicitud).padStart(3, '0')}</td>
                  <td className="name-cell">{sol.paciente_nombre}</td>
                  {isAdmin && <td style={{ fontSize: '0.85rem' }}>{sol.dueno}</td>}
                  <td>
                    {solicitudEstudios
                      .filter(se => se.id_solicitud === sol.id_solicitud)
                      .map(se => (
                        <span key={se.id} style={{
                          display: 'inline-block',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          borderRadius: '4px',
                          padding: '2px 6px',
                          margin: '2px',
                          fontSize: '0.75rem'
                        }}>
                          {se.estudio_nombre}
                        </span>
                      ))}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                    {sol.notas_cliente || '—'}
                  </td>
                  <td>
                    {cambiandoEstado === sol.id_solicitud ? (
                      <select defaultValue={sol.estado}
                        onChange={e => cambiarEstado(sol.id_solicitud, e.target.value)}
                        style={{ fontSize: '0.8rem', padding: '4px', borderRadius: '6px' }}>
                        {estados.map(e => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
                      </select>
                    ) : (
                      <span className={`status-badge status-${sol.estado.toLowerCase()}`}>
                        {sol.estado.replace('_', ' ')}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(sol.fecha_solicitud).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td>
                      <button className="btn-add-boutique"
                        style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#f59e0b' }}
                        onClick={() => setCambiandoEstado(cambiandoEstado === sol.id_solicitud ? null : sol.id_solicitud)}>
                        {cambiandoEstado === sol.id_solicitud ? 'CANCELAR' : 'CAMBIAR ESTADO'}
                      </button>
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

export default Solicitudes;