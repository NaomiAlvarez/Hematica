import React, { useState, useEffect, useCallback } from 'react';
import './Pages.css';

const ResultadoEstudio = ({ usuario, isAdmin, isVeterinario }) => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subiendoPdf, setSubiendoPdf] = useState(null);

  const cargarResultados = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/resultados/');
      if (!res.ok) throw new Error();
      const datos = await res.json();

      if (isAdmin) {
        setResultados(datos);

      } else if (isVeterinario && usuario) {
        // Fallback: muestra todos hasta que mis_clientes esté listo
        setResultados(datos);

      } else if (usuario) {
        const resC = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs = await resC.json();
        const miCliente = cs.find(c => String(c.id_usuario) === String(usuario.id_usuario));
        if (miCliente) {
          const resP = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          const misP = await resP.json();
          const nombresMascotas = misP.map(p => p.nombre);
          setResultados(datos.filter(r => nombresMascotas.includes(r.paciente_nombre)));
        }
      }
    } catch { setError('No se pudieron cargar los resultados.'); }
    finally { setLoading(false); }
  }, [isAdmin, isVeterinario, usuario]);

  useEffect(() => {
    cargarResultados();
  }, [cargarResultados]);

  const handleSubirPdf = async (idResultado, archivo) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf')) {
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
      if (res.ok) cargarResultados();
      else alert('Error al subir el PDF');
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
      if (res.ok) cargarResultados();
      else alert('Error al eliminar el PDF');
    } catch { alert('Error al conectar con el servidor'); }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="title-boutique">
            {isAdmin ? 'RESULTADOS' : isVeterinario ? 'RESULTADOS DE MIS CLIENTES' : 'MIS RESULTADOS'}
          </h1>
          <p className="subtitle-boutique">
            {isAdmin
              ? 'Informes diagnósticos y reportes clínicos'
              : isVeterinario
              ? 'Reportes clínicos de los pacientes de tus clientes'
              : 'Tus reportes clínicos finalizados'}
          </p>
        </div>
      </header>

      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : error ? (
        <p style={{ color: '#ef4444' }}>{error}</p>
      ) : resultados.length === 0 ? (
        <p className="subtitle-boutique">No hay reportes clínicos registrados.</p>
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
                        <a href={res.archivo_pdf} target="_blank" rel="noreferrer"
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