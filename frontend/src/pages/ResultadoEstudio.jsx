import React, { useState, useEffect, useCallback, useMemo } from 'react';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import './Pages.css';

/* ─────────────────────────────────────────────
   DATOS FIJOS
───────────────────────────────────────────────*/
const ANALITOS = [
  { key: 'glucosa',           nombre: 'Glucosa',            unidad: 'mmol/L',  referencia: '3.88 – 6.88' },
  { key: 'urea',              nombre: 'Urea',               unidad: 'mmol/L',  referencia: '2.1 – 7.9'   },
  { key: 'creatinina',        nombre: 'Creatinina',         unidad: 'µmol/L',  referencia: '60 – 130'    },
  { key: 'colesterol',        nombre: 'Colesterol',         unidad: 'mmol/L',  referencia: '2.85 – 7.76' },
  { key: 'trigliceridos',     nombre: 'Triglicéridos',      unidad: 'mmol/L',  referencia: '< 1.2'       },
  { key: 'bilirrubina_total', nombre: 'Bilirrubina total',  unidad: 'µmol/L',  referencia: '1.7 – 5.6'   },
  { key: 'acidos_biliares',   nombre: 'Ácidos biliares',    unidad: 'µmol/L',  referencia: '< 15.0'      },
  { key: 'lipasa',            nombre: 'Lipasa',             unidad: 'U/L',     referencia: '< 300'       },
  { key: 'ck',                nombre: 'CK',                 unidad: 'U/L',     referencia: '< 200'       },
  { key: 'alt',               nombre: 'ALT',                unidad: 'U/L',     referencia: '< 70'        },
  { key: 'ast',               nombre: 'AST',                unidad: 'U/L',     referencia: '< 55'        },
  { key: 'fa',                nombre: 'FA',                 unidad: 'U/L',     referencia: '< 189'       },
  { key: 'amilasa',           nombre: 'Amilasa',            unidad: 'U/L',     referencia: '< 1110'      },
  { key: 'proteinas_totales', nombre: 'Proteínas totales',  unidad: 'g/L',     referencia: '56 – 75'     },
  { key: 'albumina',          nombre: 'Albúmina',           unidad: 'g/L',     referencia: '29 – 40'     },
  { key: 'globulinas',        nombre: 'Globulinas',         unidad: 'g/L',     referencia: '23 – 39'     },
  { key: 'relacion_ag',       nombre: 'Relación A/G',       unidad: '—',       referencia: '0.78 – 1.46' },
  { key: 'calcio',            nombre: 'Calcio',             unidad: 'mmol/L',  referencia: '2.17 – 2.94' },
  { key: 'fosforo',           nombre: 'Fósforo',            unidad: 'mmol/L',  referencia: '0.80 – 1.80' },
  { key: 'ldh',               nombre: 'LDH',                unidad: 'U/L',     referencia: '< 400'       },
  { key: 'tco2',              nombre: 'tCO2',               unidad: 'mmol/L',  referencia: '17 – 25'     },
];

const SEVERIDAD     = ['—', '1+', '2+', '3+', '4+'];
const ANAMNESIS_OPS = ['', 'Preanestésico', 'Control rutinario', 'Diagnóstico inicial', 'Seguimiento', 'Urgencia', 'Chequeo preventivo', 'Monitoreo de tratamiento', 'Geriatría', 'Otro'];
const SEXO_OPS      = ['', 'Macho', 'Hembra', 'Macho castrado', 'Hembra esterilizada'];
const ESTADO_ANALITOS = Object.fromEntries(ANALITOS.map(a => [a.key, '']));

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────*/
function parsearReporte(texto) {
  try {
    const data = JSON.parse(texto);
    if (data && data.__tipo === 'bq_serica_perro') return data;
  } catch (_) {}
  return null;
}

function esAnomalo(resultado, referencia) {
  if (!resultado || resultado === '') return false;
  const val = parseFloat(resultado);
  if (isNaN(val)) return false;
  if (referencia.startsWith('<')) return val >= parseFloat(referencia.replace('<', '').trim());
  if (referencia.startsWith('>')) return val <= parseFloat(referencia.replace('>', '').trim());
  const parts = referencia.split('–').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !parts.some(isNaN)) return val < parts[0] || val > parts[1];
  return false;
}

const MAX_PDF_SIZE = 10 * 1024 * 1024;

async function leerErrorServidor(res) {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
  } catch (_) {}
  return 'Error al subir el archivo PDF al servidor';
}

/* Campo de solo lectura */
const CampoReadonly = ({ label, value }) => (
  <div style={st.campo}>
    <label style={st.lbl}>{label}</label>
    <div style={{
      ...st.input,
      backgroundColor: '#f1f5f9',
      color: '#475569',
      cursor: 'not-allowed',
      display: 'flex',
      alignItems: 'center',
      minHeight: 38,
    }}>
      {value || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Sin datos</span>}
    </div>
    <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: 2 }} data-html2canvas-ignore="true">
      Campo asignado automáticamente
    </span>
  </div>
);

/* ─────────────────────────────────────────────
   MODAL DEL FORMULARIO
───────────────────────────────────────────────*/
const FormularioBioquimica = ({ resultado, onClose, onGuardado }) => {
  const reportePrevio = useMemo(
    () => parsearReporte(resultado.reporte_clinico),
    [resultado.reporte_clinico]
  );

  const vetNombre      = resultado.veterinario_nombre || reportePrevio?.mvz || '';
  const pacienteNombre = resultado.paciente_nombre    || reportePrevio?.mascota || '';
  const [propietario,   setPropietario]   = useState(reportePrevio?.propietario || '');
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [errores,       setErrores]       = useState({});
  const [formData, setFormData] = useState({
    fecha:          resultado.fecha_muestra ? resultado.fecha_muestra.split('T')[0] : reportePrevio?.fecha || new Date().toISOString().split('T')[0],
    raza:           reportePrevio?.raza           || '',
    edad:           reportePrevio?.edad           || '',
    sexo:           reportePrevio?.sexo           || '',
    anamnesis:      reportePrevio?.anamnesis      || '',
    anamnesis_otro: reportePrevio?.anamnesis_otro || '',
    hemolisis:      reportePrevio?.hemolisis      || '—',
    lipemia:        reportePrevio?.lipemia        || '—',
    analitos:       reportePrevio?.analitos       || { ...ESTADO_ANALITOS },
    interpretacion: reportePrevio?.interpretacion || '',
  });

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);
  
  // Nuevos estados para la subida de PDF
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [generandoPdf, setGenerandoPdf] = useState(false);

  useEffect(() => {
    const cargarDatosPaciente = async () => {
      setCargandoDatos(true);
      try {
        const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
        const resP = await fetch(`${API}/pacientes/`);
        if (!resP.ok) return;
        const pacientes = await resP.json();
        const paciente  = pacientes.find(p => p.nombre === pacienteNombre);

        if (paciente) {
          if (!reportePrevio) {
            setFormData(prev => ({
              ...prev,
              raza:      paciente.raza_nombre || paciente.raza || '',
              edad:      paciente.edad ? String(paciente.edad) : '',
              sexo:      paciente.sexo === 'M' ? 'Macho' : paciente.sexo === 'H' ? 'Hembra' : '',
              anamnesis: paciente.anamnesis || '',
            }));
          } else if (!reportePrevio.raza && (paciente.raza_nombre || paciente.raza)) {
            setFormData(prev => ({ ...prev, raza: paciente.raza_nombre || paciente.raza || '' }));
          }

          if (paciente.id_cliente) {
            const resC = await fetch(`${API}/clientes/`);
            if (resC.ok) {
              const clientes = await resC.json();
              const cliente  = clientes.find(c => String(c.id_cliente) === String(paciente.id_cliente));
              if (cliente) setPropietario(cliente.nombre || '');
            }
          }
        }
      } catch (_) {}
      finally { setCargandoDatos(false); }
    };

    cargarDatosPaciente();
  }, [pacienteNombre, reportePrevio]);

  const set        = (campo, valor) => setFormData(prev => ({ ...prev, [campo]: valor }));
  const setAnalito = (key, valor)   => setFormData(prev => ({ ...prev, analitos: { ...prev.analitos, [key]: valor } }));
  const limpiarErr = (campo)        => setErrores(prev => ({ ...prev, [campo]: '' }));

  /* ── Validaciones y guardar JSON ── */
  const handleGuardar = async () => {
    const nuevosErrores = {};
    if (!formData.fecha) nuevosErrores.fecha = 'La fecha es obligatoria';
    if (!formData.edad || formData.edad.trim() === '') nuevosErrores.edad = 'La edad es obligatoria';
    else if (!/^\d/.test(formData.edad.trim())) nuevosErrores.edad = 'Ingresa una edad válida (ej. 3 años)';
    if (!formData.sexo) nuevosErrores.sexo = 'El sexo es obligatorio';
    if (!formData.anamnesis) nuevosErrores.anamnesis = 'La anamnesis es obligatoria';
    else if (formData.anamnesis === 'Otro' && !formData.anamnesis_otro.trim()) nuevosErrores.anamnesis_otro = 'Especifica el motivo de la anamnesis';
    
    const analitosLlenos = Object.values(formData.analitos).filter(v => v !== '').length;
    if (analitosLlenos === 0) nuevosErrores.analitos = 'Debes ingresar al menos un resultado de analito';
    if (!formData.interpretacion || formData.interpretacion.trim().length < 10) nuevosErrores.interpretacion = 'La interpretación es obligatoria (mínimo 10 caracteres)';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setTimeout(() => {
        const el = document.querySelector('[data-error="true"]');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    setErrores({});
    setGuardando(true);
    setError(null);

    const anamnesisFinal = formData.anamnesis === 'Otro' ? (formData.anamnesis_otro || 'Otro') : formData.anamnesis;
    const payload = {
      observaciones: [
        formData.hemolisis !== '—' ? `Hemólisis ${formData.hemolisis}` : null,
        formData.lipemia   !== '—' ? `Lipemia ${formData.lipemia}`     : null,
      ].filter(Boolean).join(', ') || null,
      reporte_clinico: JSON.stringify({
        __tipo:          'bq_serica_perro',
        id_vet:          resultado.id_vet,
        mvz:             vetNombre,
        propietario,
        nombre_paciente: pacienteNombre,
        ...formData,
        anamnesis:       anamnesisFinal,
      }),
    };

    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/resultados/${resultado.id_resultado}/`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error('Error al guardar datos en el servidor');
      
      // Integración: Mostrar confirmación en lugar de cerrar el modal
      setMostrarConfirmacion(true);
    } catch (e) {
      setError(e.message || 'No se pudo conectar al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  /* ───── GENERACIÓN Y SUBIDA DE PDF ───── */
  const generarPDF = async () => {
    const elemento = document.querySelector('[data-pdf="true"]');
    if (!elemento) return null;

    const canvas = await html2canvas(elemento, {
      scale: 1.4,
      useCORS: true,
      backgroundColor: '#ffffff',
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.78);

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    let y = 0;

    pdf.addImage(imgData, 'JPEG', 0, y, pdfWidth, pdfHeight, 'reporte-pdf', 'FAST');
    while (y + pdfHeight > pageHeight) {
      y -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, y, pdfWidth, pdfHeight, 'reporte-pdf', 'FAST');
    }

    return pdf;
  };

  const handleConfirmarSubida = async () => {
    setGenerandoPdf(true);
    setError(null);
    try {
      const pdf = await generarPDF();
      if (!pdf) throw new Error("No se pudo generar el documento visual");
      
      const blob = pdf.output("blob");
      if (blob.size > MAX_PDF_SIZE) {
        throw new Error("El PDF generado supera 10 MB. Intenta guardar menos contenido en la interpretación.");
      }

      const fd = new FormData();
      fd.append("archivo_pdf", blob, `Reporte_${pacienteNombre.replace(/\s+/g, '_')}.pdf`);

      const res = await fetch(
        `http://localhost:8000/api/v1/resultados/${resultado.id_resultado}/subir_pdf/`,
        { method: "PATCH", body: fd }
      );
      
      if (!res.ok) throw new Error(await leerErrorServidor(res));

      onGuardado();
      onClose();
    } catch (e) {
      setError(e.message || "Error al procesar el PDF");
    } finally {
      setGenerandoPdf(false);
    }
  };

  const handleCancelarSubida = () => {
    onGuardado();
    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={st.overlay} onClick={e => !mostrarConfirmacion && e.target === e.currentTarget && onClose()}>
      {/* Wrapper principal para el PDF */}
      <div style={st.modal} data-pdf="true">

        {/* CABECERA */}
        <div style={st.modalHeader}>
          <div>
            <span style={st.brand}>HEMÁTICA</span>
            <span style={st.brandSub}> DIAGNÓSTICO CLÍNICO VETERINARIO</span>
          </div>
          <button 
            onClick={onClose} 
            style={st.btnX} 
            data-html2canvas-ignore="true" /* Se oculta al imprimir */
          >
            ✕
          </button>
        </div>

        {/* TÍTULO */}
        <div style={st.tituloBloque}>
          <h2 style={st.h2}>BIOQUÍMICA SÉRICA DE PERRO</h2>
          <p style={st.subtitulo}>PERFIL COMPLETO</p>
        </div>

        {cargandoDatos ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '20px 0' }}>Cargando datos del paciente...</p>
        ) : (
          <>
            {/* DATOS ADMINISTRATIVOS */}
            <div style={st.grid3}>
              <div style={st.campo} data-error={!!errores.fecha}>
                <label style={st.lbl}>FECHA *</label>
                <input type="date" value={formData.fecha}
                  onChange={e => { set('fecha', e.target.value); limpiarErr('fecha'); }}
                  style={{ ...st.input, borderColor: errores.fecha ? '#dc2626' : '#e2e8f0' }} disabled={mostrarConfirmacion}/>
                {errores.fecha && <span style={st.errMsg}>{errores.fecha}</span>}
              </div>
              <CampoReadonly label="MVZ" value={vetNombre} />
              <CampoReadonly label="PROPIETARIO" value={propietario} />
            </div>

            {/* DATOS DEL PACIENTE */}
            <div style={st.caja}>
              <div style={{ ...st.grid2, marginBottom: 12 }}>
                <CampoReadonly label="MASCOTA" value={pacienteNombre} />
                <CampoReadonly label="RAZA" value={formData.raza} />
              </div>

              <div style={{ ...st.grid2, marginBottom: 12 }}>
                <div style={st.campo} data-error={!!errores.edad}>
                  <label style={st.lbl}>EDAD *</label>
                  <input value={formData.edad}
                    onChange={e => { set('edad', e.target.value); limpiarErr('edad'); }}
                    placeholder="ej. 3 años" disabled={mostrarConfirmacion}
                    style={{ ...st.input, borderColor: errores.edad ? '#dc2626' : '#e2e8f0' }} />
                  {errores.edad && <span style={st.errMsg}>{errores.edad}</span>}
                </div>
                <div style={st.campo} data-error={!!errores.sexo}>
                  <label style={st.lbl}>SEXO *</label>
                  <select value={formData.sexo} disabled={mostrarConfirmacion}
                    onChange={e => { set('sexo', e.target.value); limpiarErr('sexo'); }}
                    style={{ ...st.select, borderColor: errores.sexo ? '#dc2626' : '#e2e8f0' }}>
                    <option value="">— Seleccionar —</option>
                    {SEXO_OPS.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errores.sexo && <span style={st.errMsg}>{errores.sexo}</span>}
                </div>
              </div>

              <div style={st.campo} data-error={!!errores.anamnesis}>
                <label style={st.lbl}>ANAMNESIS *</label>
                <select value={formData.anamnesis} disabled={mostrarConfirmacion}
                  onChange={e => { set('anamnesis', e.target.value); limpiarErr('anamnesis'); }}
                  style={{ ...st.select, borderColor: errores.anamnesis ? '#dc2626' : '#e2e8f0' }}>
                  <option value="">— Seleccionar —</option>
                  {ANAMNESIS_OPS.filter(a => a).map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                {errores.anamnesis && <span style={st.errMsg}>{errores.anamnesis}</span>}
                {formData.anamnesis === 'Otro' && (
                  <>
                    <input value={formData.anamnesis_otro} disabled={mostrarConfirmacion}
                      onChange={e => { set('anamnesis_otro', e.target.value); limpiarErr('anamnesis_otro'); }}
                      placeholder="Especificar..."
                      style={{ ...st.input, marginTop: 8, borderColor: errores.anamnesis_otro ? '#dc2626' : '#e2e8f0' }} />
                    {errores.anamnesis_otro && <span style={st.errMsg}>{errores.anamnesis_otro}</span>}
                  </>
                )}
              </div>
            </div>

            {/* TABLA DE ANALITOS */}
            <div style={{ marginBottom: 24 }} data-error={!!errores.analitos}>
              {errores.analitos && (
                <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '8px 14px', marginBottom: 10 }}>
                  <span style={st.errMsg}>⚠ {errores.analitos}</span>
                </div>
              )}
              <table style={{ ...st.tabla, borderColor: errores.analitos ? '#fca5a5' : '#e2e8f0' }}>
                <thead>
                  <tr>
                    {['Analito', 'Resultado', 'Unidades', 'Intervalo de Referencia'].map(col => (
                      <th key={col} style={st.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ANALITOS.map((a, i) => {
                    const val     = formData.analitos[a.key];
                    const anomalo = esAnomalo(val, a.referencia);
                    return (
                      <tr key={a.key} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f8faff' }}>
                        <td style={st.tdNombre}>{a.nombre}</td>
                        <td style={st.tdRes}>
                          <input type="text" value={val} disabled={mostrarConfirmacion}
                            onChange={e => { setAnalito(a.key, e.target.value); limpiarErr('analitos'); }}
                            placeholder="—"
                            style={{
                              ...st.inputRes,
                              color:           anomalo ? '#dc2626' : '#0f172a',
                              fontWeight:      anomalo ? '700'     : '500',
                              borderColor:     anomalo ? '#fca5a5' : '#e2e8f0',
                              backgroundColor: anomalo ? '#fff5f5' : '#fff',
                            }} />
                        </td>
                        <td style={st.tdFijo}>{a.unidad}</td>
                        <td style={st.tdFijo}>{a.referencia}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CALIDAD DE MUESTRA */}
            <div style={st.calidadRow}>
              <span style={st.calidadLbl}>CALIDAD DE LA MUESTRA</span>
              {[['hemolisis', 'Hemólisis'], ['lipemia', 'Lipemia']].map(([campo, etiq]) => (
                <div key={campo} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <label style={{ ...st.lbl, whiteSpace: 'nowrap' }}>{etiq}</label>
                  <select value={formData[campo]} disabled={mostrarConfirmacion} onChange={e => set(campo, e.target.value)} style={st.selectSm}>
                    {SEVERIDAD.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>

            {/* INTERPRETACIÓN */}
            <div style={{ marginBottom: 24 }} data-error={!!errores.interpretacion}>
              <label style={st.lblSection}>INTERPRETACIÓN *</label>
              <textarea value={formData.interpretacion} disabled={mostrarConfirmacion}
                onChange={e => { set('interpretacion', e.target.value); limpiarErr('interpretacion'); }}
                rows={4}
                placeholder="Escribe aquí el diagnóstico e interpretación clínica (mínimo 10 caracteres)..."
                style={{ ...st.textarea, borderColor: errores.interpretacion ? '#dc2626' : '#e2e8f0' }} />
              {errores.interpretacion && <span style={st.errMsg}>{errores.interpretacion}</span>}
            </div>

            {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 16 }}>⚠ {error}</p>}

            {/* FOOTER - Excluido del PDF visualmente */}
            <div style={st.footer} data-html2canvas-ignore="true">
              {mostrarConfirmacion ? (
                <>
                  <span style={{ fontSize: '0.85rem', color: '#0369a1', fontWeight: 600, marginRight: 'auto', alignSelf: 'center' }}>
                    ¡Datos guardados! ¿Deseas generar y subir el PDF automáticamente?
                  </span>
                  <button onClick={handleCancelarSubida} disabled={generandoPdf} style={st.btnCancel}>NO, CERRAR</button>
                  <button onClick={handleConfirmarSubida} disabled={generandoPdf} style={{ ...st.btnSave, backgroundColor: '#16a34a' }}>
                    {generandoPdf ? 'GENERANDO...' : '📄 SÍ, GENERAR Y SUBIR'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={onClose} style={st.btnCancel}>CANCELAR</button>
                  <button onClick={handleGuardar} disabled={guardando} style={st.btnSave}>
                    {guardando ? 'GUARDANDO...' : '💾 GUARDAR RESULTADO'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   COMPONENTE PRINCIPAL
───────────────────────────────────────────────*/
const ResultadoEstudio = ({ usuario, isAdmin, isVeterinario }) => {
  const [resultados,        setResultados]        = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [subiendoPdf,       setSubiendoPdf]       = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(null);

  const cargarResultados = useCallback(async () => {
    try {
      const res   = await fetch('http://localhost:8000/api/v1/resultados/');
      if (!res.ok) throw new Error();
      const datos = await res.json();
      if (isAdmin || isVeterinario) {
        setResultados(datos);
      } else if (usuario) {
        const resC      = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs        = await resC.json();
        const miCliente = cs.find(c => String(c.id_usuario) === String(usuario.id_usuario));
        if (miCliente) {
          const resP    = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          const misP    = await resP.json();
          const nombres = misP.map(p => p.nombre);
          setResultados(datos.filter(r => nombres.includes(r.paciente_nombre)));
        }
      }
    } catch { setError('No se pudieron cargar los resultados.'); }
    finally  { setLoading(false); }
  }, [isAdmin, isVeterinario, usuario]);

  useEffect(() => { cargarResultados(); }, [cargarResultados]);

  const handleSubirPdf = async (idResultado, archivo) => {
    if (!archivo) return;
    if (!archivo.name.toLowerCase().endsWith('.pdf')) { alert('Solo se permiten archivos PDF'); return; }
    if (archivo.size > 10 * 1024 * 1024) { alert('El archivo no puede superar 10 MB'); return; }
    setSubiendoPdf(idResultado);
    const fd = new FormData();
    fd.append('archivo_pdf', archivo);
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/resultados/${idResultado}/subir_pdf/`,
        { method: 'PATCH', body: fd }
      );
      if (res.ok) cargarResultados();
      else alert('Error al subir el PDF');
    } catch { alert('Error al conectar con el servidor'); }
    finally { setSubiendoPdf(null); }
  };

  const handleEliminarPdf = async (idResultado) => {
    if (!window.confirm('¿Seguro que quieres eliminar el PDF?')) return;
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/resultados/${idResultado}/eliminar_pdf/`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' } }
      );
      if (res.ok) cargarResultados();
      else alert('Error al eliminar el PDF');
    } catch { alert('Error al conectar con el servidor'); }
  };

  const resultadoActivo = resultados.find(r => r.id_resultado === formularioAbierto);

  return (
    <div className="page-container">
      {formularioAbierto && resultadoActivo && (
        <FormularioBioquimica
          resultado={resultadoActivo}
          onClose={() => setFormularioAbierto(null)}
          onGuardado={cargarResultados}
        />
      )}

      <header className="page-header"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
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
                <th>FOLIO</th><th>PACIENTE</th><th>VETERINARIO</th>
                <th>FECHA MUESTRA</th><th>OBSERVACIONES</th><th>REPORTE</th><th>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((res) => {
                const reporteJson = parsearReporte(res.reporte_clinico);
                return (
                  <tr key={res.id_resultado}>
                    <td className="id-cell">#{String(res.id_solicitud).padStart(3, '0')}</td>
                    <td className="name-cell">{res.paciente_nombre}</td>
                    <td style={{ fontSize: '0.85rem' }}>{res.veterinario_nombre}</td>
                    <td style={{ fontSize: '0.85rem' }}>
                      {new Date(res.fecha_muestra).toLocaleDateString('es-MX')}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{res.observaciones || '—'}</td>
                    <td style={{ fontSize: '0.8rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reporteJson
                        ? <span style={{ color: '#16a34a', fontWeight: 600 }}>✔ Formulario llenado</span>
                        : (res.reporte_clinico || '—')
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexDirection: 'column' }}>
                        {isAdmin && (
                          <button onClick={() => setFormularioAbierto(res.id_resultado)}
                            style={{
                              padding: '6px 12px', fontSize: '10px',
                              backgroundColor: reporteJson ? '#0369a1' : '#7c3aed',
                              border: 'none', borderRadius: 6, cursor: 'pointer',
                              color: '#fff', fontWeight: 700, letterSpacing: '0.5px'
                            }}>
                            {reporteJson ? '✏ EDITAR FORMULARIO' : '📋 LLENAR FORMULARIO'}
                          </button>
                        )}
                        {res.archivo_pdf ? (
                          <>
                            <a href={res.archivo_pdf} target="_blank" rel="noreferrer"
                              style={{
                                padding: '6px 12px', fontSize: '10px', backgroundColor: '#16a34a',
                                textDecoration: 'none', display: 'inline-block', textAlign: 'center',
                                borderRadius: 6, color: '#fff', fontWeight: 700
                              }}>
                              ⬇ DESCARGAR PDF
                            </a>
                            {isAdmin && (
                              <button onClick={() => handleEliminarPdf(res.id_resultado)}
                                style={{
                                  padding: '6px 12px', fontSize: '10px', backgroundColor: '#dc2626',
                                  border: 'none', borderRadius: 6, cursor: 'pointer',
                                  color: '#fff', fontWeight: 700
                                }}>
                                🗑 ELIMINAR PDF
                              </button>
                            )}
                          </>
                        ) : isAdmin ? (
                          <label style={{ cursor: 'pointer' }}>
                            <span style={{
                              padding: '6px 12px', fontSize: '10px', backgroundColor: '#475569',
                              display: 'inline-block', borderRadius: 6, color: '#fff', fontWeight: 700
                            }}>
                              {subiendoPdf === res.id_resultado ? 'SUBIENDO...' : '📤 SUBIR PDF'}
                            </span>
                            <input type="file" accept=".pdf" style={{ display: 'none' }}
                              onChange={e => handleSubirPdf(res.id_resultado, e.target.files[0])} />
                          </label>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Sin PDF</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultadoEstudio;

/* ─────────────────────────────────────────────
   ESTILOS
───────────────────────────────────────────────*/
const st = {
  overlay:      { position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px 16px', overflowY: 'auto' },
  modal:        { backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 820, padding: '32px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)', position: 'relative', marginBottom: 24 },
  modalHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 12, borderBottom: '2px solid #e2e8f0' },
  brand:        { fontFamily: "'Montserrat',sans-serif", fontWeight: 800, fontSize: '1.1rem', color: '#c0392b', letterSpacing: 3 },
  brandSub:     { fontFamily: "'Montserrat',sans-serif", fontWeight: 500, fontSize: '0.75rem', color: '#64748b', letterSpacing: 1 },
  btnX:         { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8', padding: '4px 8px', borderRadius: 6 },
  tituloBloque: { textAlign: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e2e8f0' },
  h2:           { fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', margin: '0 0 4px', letterSpacing: 2, textTransform: 'uppercase' },
  subtitulo:    { fontFamily: "'Montserrat',sans-serif", fontWeight: 500, fontSize: '0.8rem', color: '#64748b', margin: 0, letterSpacing: 1.5, textTransform: 'uppercase' },
  grid3:        { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 },
  grid2:        { display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 },
  caja:         { backgroundColor: '#f8faff', borderRadius: 10, padding: '16px 20px', marginBottom: 20, border: '1px solid #e2e8f0' },
  campo:        { display: 'flex', flexDirection: 'column', gap: 4 },
  lbl:          { fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '0.65rem', color: '#64748b', letterSpacing: 1, textTransform: 'uppercase' },
  lblSection:   { display: 'block', fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '0.7rem', color: '#334155', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 },
  input:        { border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: '0.88rem', color: '#0f172a', fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' },
  select:       { border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: '0.88rem', color: '#0f172a', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', width: '100%', boxSizing: 'border-box' },
  selectSm:     { border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '6px 10px', fontSize: '0.85rem', color: '#0f172a', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fff', cursor: 'pointer', minWidth: 90 },
  hint:         { fontSize: '0.72rem', color: '#f59e0b', marginTop: 4 },
  tabla:        { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' },
  th:           { backgroundColor: '#1e3a5f', color: '#fff', padding: '10px 14px', textAlign: 'left', fontWeight: 700, fontSize: '0.72rem', letterSpacing: 0.8, textTransform: 'uppercase', fontFamily: "'Montserrat',sans-serif" },
  tdNombre:     { padding: '7px 14px', color: '#334155', fontWeight: 600, width: '32%', borderBottom: '1px solid #f1f5f9' },
  tdRes:        { padding: '5px 8px', width: '18%', borderBottom: '1px solid #f1f5f9' },
  tdFijo:       { padding: '7px 14px', color: '#64748b', fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9' },
  inputRes:     { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 6, padding: '5px 8px', fontSize: '0.85rem', textAlign: 'center', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'all 0.15s' },
  calidadRow:   { display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', backgroundColor: '#f8faff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 20px', marginBottom: 20 },
  calidadLbl:   { fontFamily: "'Montserrat',sans-serif", fontWeight: 700, fontSize: '0.7rem', color: '#334155', letterSpacing: 1.5, textTransform: 'uppercase', marginRight: 8 },
  textarea:     { width: '100%', boxSizing: 'border-box', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', fontSize: '0.88rem', color: '#0f172a', fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.6 },
  footer:       { display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 8, borderTop: '1px solid #e2e8f0', marginTop: 8 },
  btnCancel:    { padding: '10px 24px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif" },
  btnSave:      { padding: '10px 28px', backgroundColor: '#1e3a5f', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', letterSpacing: 1, fontFamily: "'Montserrat',sans-serif" },
  errMsg:       { fontSize: '11px', color: '#dc2626', marginTop: 3, fontWeight: '600' },
};
