import React, { useState, useEffect, useCallback } from 'react';
import './Pages.css';

const ResultadoEstudio = ({ usuario, isAdmin }) => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [form, setForm] = useState({ id_solicitud: '', id_vet: '', fecha_muestra: '', observaciones: '', reporte_clinico: '' });
  const [errForm, setErrForm] = useState('');
  const [subiendoPdf, setSubiendoPdf] = useState(null);

  const cargarResultados = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/resultados/');
      if (!res.ok) throw new Error();
      const datos = await res.json();

      if (isAdmin) {
        setResultados(datos);
      } else if (usuario) {
        const resC = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs = await resC.json();
        const miCliente = cs.find(c => c.id_usuario === usuario.id_usuario);
        if (miCliente) {
          const resP = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          const misP = await resP.json();
          const nombresMascotas = misP.map(p => p.nombre);
          setResultados(datos.filter(r => nombresMascotas.includes(r.paciente_nombre)));
        }
      }
    } catch { setError('No se pudieron cargar los resultados.'); }
    finally { setLoading(false); }
  }, [isAdmin, usuario]);

  useEffect(() => {
    cargarResultados();
    if (isAdmin) {
      fetch('http://localhost:8000/api/v1/solicitudes/')
        .then(r => r.json())
        .then(data => setSolicitudes(data.filter(s => s.estado !== 'cancelado')));
      fetch('http://localhost:8000/api/v1/veterinarios/')
        .then(r => r.json())
        .then(setVeterinarios);
    }
  }, [cargarResultados, isAdmin]);

  const validarForm = () => {
    if (!form.id_solicitud) return 'Selecciona una solicitud';
    if (!form.id_vet) return 'Selecciona un veterinario';
    if (!form.fecha_muestra) return 'La fecha de muestra es obligatoria';
    if (!form.reporte_clinico.trim()) return 'El reporte clinico es obligatorio';
    if (form.reporte_clinico.trim().length < 10) return 'El reporte debe tener al menos 10 caracteres';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validarForm();
    if (err) { setErrForm(err); return; }
    setErrForm('');
    try {
      const res = await fetch('http://localhost:8000/api/v1/resultados/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_solicitud: parseInt(form.id_solicitud),
          id_vet: parseInt(form.id_vet),
          fecha_muestra: form.fecha_muestra,
          observaciones: form.observaciones.trim(),
          reporte_clinico: form.reporte_clinico.trim()
        })
      });
      if (res.ok) {
        setMostrarForm(false);
        setForm({ id_solicitud: '', id_vet: '', fecha_muestra: '', observaciones: '', reporte_clinico: '' });
        cargarResultados();
      } else {
        const data = await res.json();
        setErrForm(JSON.stringify(data));
      }
    } catch { setErrForm('Error al conectar con el servidor'); }
  };

  const handleSubirPdf = async (idResultado, archivo) => {
    if (!archivo) return;
    if (!archivo.name.endsWith('.pdf')) {
      alert('Solo se permiten archivos PDF');
      return;
    }
    if (archivo.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar 10MB');
      return;
    }
    setSubiendoPdf(idResultado);
    const formData = new FormData();
    formData.append('archivo_pdf', archivo);
    try {
      const res = await fetch(`http://localhost:8000/api/v1/resultados/${idResultado}/subir_pdf/`, {
        method: 'PATCH',
        body: formData
      });
      if (res.ok) {
        alert('PDF subido exitosamente');
        cargarResultados();
      } else {
        alert('Error al subir el PDF');
      }
    } catch { alert('Error al conectar con el servidor'); }
    finally { setSubiendoPdf(null); }
  };

  const handleEliminarPdf = async (idResultado) => {
    if (!window.confirm('¿Seguro que quieres eliminar el PDF?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/resultados/${idResultado}/eliminar_pdf/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        cargarResultados();
      } else {
        alert('Error al eliminar el PDF');
      }
    } catch { alert('Error al conectar con el servidor'); }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="title-boutique">{isAdmin ? 'RESULTADOS' : 'MIS RESULTADOS'}</h1>
          <p className="subtitle-boutique">
            {isAdmin ? 'Informes diagnosticos y reportes clinicos' : 'Tus reportes clinicos finalizados'}
          </p>
        </div>
        {isAdmin && (
          <button className="btn-add-boutique" onClick={() => { setMostrarForm(!mostrarForm); setErrForm(''); }}>
            <span>+</span> REGISTRAR RESULTADO
          </button>
        )}
      </header>

      {mostrarForm && isAdmin && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Nuevo Resultado</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label>SOLICITUD *</label>
              <select value={form.id_solicitud} onChange={e => setForm({ ...form, id_solicitud: e.target.value })}>
                <option value="">Seleccionar solicitud</option>
                {solicitudes.map(s => (
                  <option key={s.id_solicitud} value={s.id_solicitud}>
                    #{String(s.id_solicitud).padStart(3, '0')} - {s.paciente_nombre} ({s.estado})
                  </option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>VETERINARIO *</label>
              <select value={form.id_vet} onChange={e => setForm({ ...form, id_vet: e.target.value })}>
                <option value="">Seleccionar veterinario</option>
                {veterinarios.map(v => (
                  <option key={v.id_vet} value={v.id_vet}>{v.nombre}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>FECHA DE MUESTRA *</label>
              <input type="datetime-local" value={form.fecha_muestra}
                onChange={e => setForm({ ...form, fecha_muestra: e.target.value })} />
            </div>
            <div className="input-group">
              <label>OBSERVACIONES</label>
              <input type="text" value={form.observaciones}
                onChange={e => setForm({ ...form, observaciones: e.target.value })}
                placeholder="Observaciones generales" maxLength={300} />
            </div>
            <div className="input-group" style={{ gridColumn: '1/-1' }}>
              <label>REPORTE CLÍNICO *</label>
              <textarea value={form.reporte_clinico}
                onChange={e => setForm({ ...form, reporte_clinico: e.target.value })}
                placeholder="Describe los resultados del estudio..." rows={4}
                maxLength={1000}
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical' }} />
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
      ) : resultados.length === 0 ? (
        <p className="subtitle-boutique">No hay reportes clinicos registrados.</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>FOLIO</th>
                <th>PACIENTE</th>
                <th>VETERINARIO</th>
                <th>FECHA MUESTRA</th>
                <th>OBSERVACIONES</th>
                <th>REPORTE</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((res) => (
                <tr key={res.id_resultado}>
                  <td className="id-cell">#{String(res.id_solicitud).padStart(3, '0')}</td>
                  <td className="name-cell">{res.paciente_nombre}</td>
                  <td style={{ fontSize: '0.85rem' }}>{res.veterinario_nombre}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    {new Date(res.fecha_muestra).toLocaleDateString()}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {res.observaciones || '—'}
                  </td>
                  <td style={{ fontSize: '0.8rem', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {res.reporte_clinico}
                  </td>
                  <td>
                    {res.archivo_pdf ? (
                      <div style={{ display: 'flex', gap: '6px', flexDirection: 'column' }}>
                        <a href={res.archivo_pdf}
                          target="_blank" rel="noreferrer"
                          className="btn-add-boutique"
                          style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#16a34a', textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}>
                          ⬇ DESCARGAR
                        </a>
                        {isAdmin && (
                          <button className="btn-add-boutique"
                            style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#dc2626' }}
                            onClick={() => handleEliminarPdf(res.id_resultado)}>
                            🗑 ELIMINAR
                          </button>
                        )}
                      </div>
                    ) : isAdmin ? (
                      <label style={{ cursor: 'pointer' }}>
                        <span className="btn-add-boutique"
                          style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#7c3aed', display: 'inline-block' }}>
                          {subiendoPdf === res.id_resultado ? 'SUBIENDO...' : '📤 SUBIR PDF'}
                        </span>
                        <input type="file" accept=".pdf" style={{ display: 'none' }}
                          onChange={e => handleSubirPdf(res.id_resultado, e.target.files[0])} />
                      </label>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sin PDF</span>
                    )}
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

export default ResultadoEstudio;