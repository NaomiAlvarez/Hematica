import React, { useState, useEffect, useCallback } from 'react';
import './Pages.css';

/* ─────────────────────────────────────────────
   DATOS FIJOS — no editables en el formulario
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

const SEVERIDAD = ['—', '1+', '2+', '3+', '4+'];

const RAZAS_PERRO = [
  '', 'Mestizo / Criollo',
  'Labrador Retriever', 'Golden Retriever', 'Pastor Alemán', 'Bulldog Francés',
  'Pug', 'Beagle', 'Poodle', 'Chihuahua', 'Yorkshire Terrier',
  'Shih Tzu', 'Maltés', 'Dachshund', 'Boxer', 'Rottweiler',
  'Doberman', 'Pitbull / American Staffordshire', 'Schnauzer', 'Cocker Spaniel',
  'Husky Siberiano', 'Border Collie', 'Bulldog Inglés', 'Dálmata',
  'Gran Danés', 'Akita', 'Chow Chow', 'Shar Pei', 'Weimaraner',
  'Setter Irlandés', 'Bichón Frisé', 'Spitz Alemán / Pomerania',
  'Jack Russell Terrier', 'West Highland Terrier', 'Basset Hound', 'Otro',
];

const ANAMNESIS_OPCIONES = [
  '', 'Preanestésico', 'Control rutinario', 'Diagnóstico inicial',
  'Seguimiento', 'Urgencia', 'Chequeo preventivo',
  'Monitoreo de tratamiento', 'Geriatría', 'Otro',
];

const SEXO_OPCIONES = [
  '', 'Macho', 'Hembra', 'Macho castrado', 'Hembra esterilizada',
];

const ESTADO_INICIAL_ANALITOS = Object.fromEntries(ANALITOS.map(a => [a.key, '']));

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
  if (referencia.startsWith('<'))
    return val >= parseFloat(referencia.replace('<', '').trim());
  if (referencia.startsWith('>'))
    return val <= parseFloat(referencia.replace('>', '').trim());
  const parts = referencia.split('–').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !parts.some(isNaN))
    return val < parts[0] || val > parts[1];
  return false;
}

function nombrePersona(obj) {
  if (!obj) return '';
  return obj.nombre_completo
    ?? `${obj.nombre ?? ''} ${obj.apellido_paterno ?? ''}`.trim();
}

/* ─────────────────────────────────────────────
   HOOK — carga catálogos desde la API
───────────────────────────────────────────────*/
function useCatalogos() {
  const [veterinarios, setVeterinarios] = useState([]);
  const [clientes,     setClientes]     = useState([]);
  const [pacientes,    setPacientes]    = useState([]);

  useEffect(() => {
    const BASE = 'http://localhost:8000/api/v1';
    Promise.allSettled([
      fetch(`${BASE}/veterinarios/`).then(r => r.json()),
      fetch(`${BASE}/clientes/`).then(r => r.json()),
      fetch(`${BASE}/pacientes/`).then(r => r.json()),
    ]).then(([vets, cls, pacs]) => {
      if (vets.status === 'fulfilled' && Array.isArray(vets.value)) setVeterinarios(vets.value);
      if (cls.status  === 'fulfilled' && Array.isArray(cls.value))  setClientes(cls.value);
      if (pacs.status === 'fulfilled' && Array.isArray(pacs.value)) setPacientes(pacs.value);
    });
  }, []);

  return { veterinarios, clientes, pacientes };
}

/* ─────────────────────────────────────────────
   MODAL DEL FORMULARIO DIGITALIZADO
───────────────────────────────────────────────*/
const FormularioBioquimica = ({ resultado, onClose, onGuardado }) => {
  const reportePrevio = parsearReporte(resultado.reporte_clinico);
  const { veterinarios, clientes, pacientes } = useCatalogos();

  const [formData, setFormData] = useState({
    id_vet:           resultado.id_vet            || reportePrevio?.id_vet           || '',
    mvz:              resultado.veterinario_nombre || reportePrevio?.mvz              || '',
    id_cliente:       reportePrevio?.id_cliente    || '',
    propietario:      resultado.propietario_nombre || reportePrevio?.propietario      || '',
    id_paciente:      reportePrevio?.id_paciente   || '',
    nombre_paciente:  resultado.paciente_nombre    || reportePrevio?.nombre_paciente  || '',
    fecha:            resultado.fecha_muestra
                        ? resultado.fecha_muestra.split('T')[0]
                        : reportePrevio?.fecha     || new Date().toISOString().split('T')[0],
    raza:             reportePrevio?.raza          || '',
    edad:             reportePrevio?.edad          || '',
    sexo:             reportePrevio?.sexo          || '',
    anamnesis:        reportePrevio?.anamnesis     || '',
    anamnesis_otro:   reportePrevio?.anamnesis_otro|| '',
    hemolisis:        reportePrevio?.hemolisis     || '—',
    lipemia:          reportePrevio?.lipemia       || '—',
    analitos:         reportePrevio?.analitos      || { ...ESTADO_INICIAL_ANALITOS },
    interpretacion:   reportePrevio?.interpretacion|| '',
  });

  const [guardando, setGuardando] = useState(false);
  const [error,     setError]     = useState(null);

  /* Pacientes filtrados según el cliente seleccionado */
  const pacientesFiltrados = formData.id_cliente
    ? pacientes.filter(p => String(p.id_cliente) === String(formData.id_cliente))
    : pacientes;

  /* ── Handlers ── */
  const handleVet = (idVet) => {
    const vet = veterinarios.find(v => String(v.id_vet ?? v.id) === String(idVet));
    setFormData(prev => ({ ...prev, id_vet: idVet, mvz: vet ? nombrePersona(vet) : '' }));
  };

  const handleCliente = (idCliente) => {
    const cl = clientes.find(c => String(c.id_cliente) === String(idCliente));
    setFormData(prev => ({
      ...prev,
      id_cliente:      idCliente,
      propietario:     cl ? nombrePersona(cl) : '',
      /* limpiar paciente al cambiar de propietario */
      id_paciente:     '',
      nombre_paciente: '',
      raza:            '',
      edad:            '',
      sexo:            '',
    }));
  };

  const handlePaciente = (idPaciente) => {
    const pac = pacientes.find(p => String(p.id_paciente ?? p.id) === String(idPaciente));
    if (!pac) {
      setFormData(prev => ({ ...prev, id_paciente: '', nombre_paciente: '', raza: '', edad: '', sexo: '' }));
      return;
    }
    /* Si no hay propietario aún, auto-rellenar desde la mascota */
    let extraCliente = {};
    if (!formData.id_cliente && pac.id_cliente) {
      const cl = clientes.find(c => String(c.id_cliente) === String(pac.id_cliente));
      extraCliente = {
        id_cliente:  String(pac.id_cliente),
        propietario: cl ? nombrePersona(cl) : '',
      };
    }
    setFormData(prev => ({
      ...prev,
      ...extraCliente,
      id_paciente:     String(idPaciente),
      nombre_paciente: pac.nombre || '',
      raza:            pac.raza   || '',
      edad:            pac.edad   ? String(pac.edad) : '',
      sexo:            pac.sexo   || '',
    }));
  };

  const set = (campo, valor) => setFormData(prev => ({ ...prev, [campo]: valor }));
  const setAnalito = (key, valor) =>
    setFormData(prev => ({ ...prev, analitos: { ...prev.analitos, [key]: valor } }));

  /* ── Guardar ── */
  const handleGuardar = async () => {
    setGuardando(true);
    setError(null);
    const anamnesisFinal = formData.anamnesis === 'Otro'
      ? (formData.anamnesis_otro || 'Otro')
      : formData.anamnesis;

    const payload = {
      observaciones: [
        formData.hemolisis !== '—' ? `Hemólisis ${formData.hemolisis}` : null,
        formData.lipemia   !== '—' ? `Lipemia ${formData.lipemia}`     : null,
      ].filter(Boolean).join(', ') || null,
      reporte_clinico: JSON.stringify({
        __tipo: 'bq_serica_perro',
        ...formData,
        anamnesis: anamnesisFinal,
      }),
    };
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/resultados/${resultado.id_resultado}/`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      );
      if (!res.ok) throw new Error('Error al guardar');
      onGuardado();
      onClose();
    } catch (e) {
      setError(e.message || 'No se pudo conectar al servidor.');
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div style={st.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={st.modal}>

        {/* CABECERA */}
        <div style={st.modalHeader}>
          <div>
            <span style={st.brand}>HEMÁTICA</span>
            <span style={st.brandSub}> DIAGNÓSTICO CLÍNICO VETERINARIO</span>
          </div>
          <button onClick={onClose} style={st.btnX}>✕</button>
        </div>

        {/* TÍTULO */}
        <div style={st.tituloBloque}>
          <h2 style={st.h2}>BIOQUÍMICA SÉRICA DE PERRO</h2>
          <p style={st.subtitulo}>PERFIL COMPLETO</p>
        </div>

        {/* DATOS ADMINISTRATIVOS */}
        <div style={st.grid3}>
          <div style={st.campo}>
            <label style={st.lbl}>FECHA</label>
            <input type="date" value={formData.fecha}
              onChange={e => set('fecha', e.target.value)} style={st.input} />
          </div>

          <div style={st.campo}>
            <label style={st.lbl}>MVZ</label>
            {veterinarios.length > 0
              ? <select value={formData.id_vet} onChange={e => handleVet(e.target.value)} style={st.select}>
                  <option value="">— Seleccionar —</option>
                  {veterinarios.map(v => (
                    <option key={v.id_vet ?? v.id} value={v.id_vet ?? v.id}>{nombrePersona(v)}</option>
                  ))}
                </select>
              : <input value={formData.mvz} onChange={e => set('mvz', e.target.value)}
                  placeholder="Nombre del MVZ" style={st.input} />
            }
          </div>

          <div style={st.campo}>
            <label style={st.lbl}>PROPIETARIO</label>
            {clientes.length > 0
              ? <select value={formData.id_cliente} onChange={e => handleCliente(e.target.value)} style={st.select}>
                  <option value="">— Seleccionar —</option>
                  {clientes.map(c => (
                    <option key={c.id_cliente} value={c.id_cliente}>{nombrePersona(c)}</option>
                  ))}
                </select>
              : <input value={formData.propietario} onChange={e => set('propietario', e.target.value)}
                  placeholder="Nombre del propietario" style={st.input} />
            }
          </div>
        </div>

        {/* DATOS DEL PACIENTE */}
        <div style={st.caja}>
          <div style={{ ...st.grid2, marginBottom: 12 }}>
            {/* Mascota */}
            <div style={st.campo}>
              <label style={st.lbl}>MASCOTA</label>
              {pacientes.length > 0
                ? <>
                    <select value={formData.id_paciente} onChange={e => handlePaciente(e.target.value)} style={st.select}>
                      <option value="">— Seleccionar —</option>
                      {pacientesFiltrados.map(p => (
                        <option key={p.id_paciente ?? p.id} value={p.id_paciente ?? p.id}>{p.nombre}</option>
                      ))}
                    </select>
                    {formData.id_cliente && pacientesFiltrados.length === 0 && (
                      <span style={st.hint}>Este propietario no tiene mascotas registradas</span>
                    )}
                  </>
                : <input value={formData.nombre_paciente}
                    onChange={e => set('nombre_paciente', e.target.value)}
                    placeholder="Nombre de la mascota" style={st.input} />
              }
            </div>

            {/* Raza */}
            <div style={st.campo}>
              <label style={st.lbl}>RAZA</label>
              <select value={formData.raza} onChange={e => set('raza', e.target.value)} style={st.select}>
                <option value="">— Seleccionar —</option>
                {RAZAS_PERRO.filter(r => r).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div style={{ ...st.grid2, marginBottom: 12 }}>
            {/* Edad */}
            <div style={st.campo}>
              <label style={st.lbl}>EDAD</label>
              <input value={formData.edad} onChange={e => set('edad', e.target.value)}
                placeholder="ej. 11 años" style={st.input} />
            </div>

            {/* Sexo */}
            <div style={st.campo}>
              <label style={st.lbl}>SEXO</label>
              <select value={formData.sexo} onChange={e => set('sexo', e.target.value)} style={st.select}>
                <option value="">— Seleccionar —</option>
                {SEXO_OPCIONES.filter(s => s).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Anamnesis */}
          <div style={st.campo}>
            <label style={st.lbl}>ANAMNESIS</label>
            <select value={formData.anamnesis} onChange={e => set('anamnesis', e.target.value)} style={st.select}>
              <option value="">— Seleccionar —</option>
              {ANAMNESIS_OPCIONES.filter(a => a).map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            {formData.anamnesis === 'Otro' && (
              <input value={formData.anamnesis_otro}
                onChange={e => set('anamnesis_otro', e.target.value)}
                placeholder="Especificar..." style={{ ...st.input, marginTop: 8 }} />
            )}
          </div>
        </div>

        {/* TABLA DE ANALITOS */}
        <div style={{ marginBottom: 24 }}>
          <table style={st.tabla}>
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
                      <input type="text" value={val}
                        onChange={e => setAnalito(a.key, e.target.value)}
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
              <select value={formData[campo]} onChange={e => set(campo, e.target.value)} style={st.selectSm}>
                {SEVERIDAD.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* INTERPRETACIÓN */}
        <div style={{ marginBottom: 24 }}>
          <label style={st.lblSection}>INTERPRETACIÓN</label>
          <textarea value={formData.interpretacion}
            onChange={e => set('interpretacion', e.target.value)}
            rows={4}
            placeholder="Escribe aquí el diagnóstico e interpretación clínica..."
            style={st.textarea} />
        </div>

        {error && <p style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: 16 }}>⚠ {error}</p>}

        {/* FOOTER */}
        <div style={st.footer}>
          <button onClick={onClose} style={st.btnCancel}>CANCELAR</button>
          <button onClick={handleGuardar} disabled={guardando} style={st.btnSave}>
            {guardando ? 'GUARDANDO...' : '💾 GUARDAR RESULTADO'}
          </button>
        </div>

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
      if (isAdmin) {
        setResultados(datos);
      } else if (isVeterinario && usuario) {
        setResultados(datos);
      } else if (usuario) {
        const resC      = await fetch('http://localhost:8000/api/v1/clientes/');
        const cs        = await resC.json();
        const miCliente = cs.find(c => String(c.id_usuario) === String(usuario.id_usuario));
        if (miCliente) {
          const resP  = await fetch(`http://localhost:8000/api/v1/pacientes/?id_cliente=${miCliente.id_cliente}`);
          const misP  = await resP.json();
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
      const res = await fetch(`http://localhost:8000/api/v1/resultados/${idResultado}/subir_pdf/`, { method: 'PATCH', body: fd });
      if (res.ok) cargarResultados();
      else alert('Error al subir el PDF');
    } catch { alert('Error al conectar con el servidor'); }
    finally { setSubiendoPdf(null); }
  };

  const handleEliminarPdf = async (idResultado) => {
    if (!window.confirm('¿Seguro que quieres eliminar el PDF?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/resultados/${idResultado}/eliminar_pdf/`,
        { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
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
                            style={{ padding: '6px 12px', fontSize: '10px',
                                     backgroundColor: reporteJson ? '#0369a1' : '#7c3aed',
                                     border: 'none', borderRadius: 6, cursor: 'pointer',
                                     color: '#fff', fontWeight: 700, letterSpacing: '0.5px' }}>
                            {reporteJson ? '✏ EDITAR FORMULARIO' : '📋 LLENAR FORMULARIO'}
                          </button>
                        )}
                        {res.archivo_pdf ? (
                          <>
                            <a href={res.archivo_pdf} target="_blank" rel="noreferrer"
                              style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#16a34a',
                                       textDecoration: 'none', display: 'inline-block', textAlign: 'center',
                                       borderRadius: 6, color: '#fff', fontWeight: 700 }}>
                              ⬇ DESCARGAR PDF
                            </a>
                            {isAdmin && (
                              <button onClick={() => handleEliminarPdf(res.id_resultado)}
                                style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#dc2626',
                                         border: 'none', borderRadius: 6, cursor: 'pointer',
                                         color: '#fff', fontWeight: 700 }}>
                                🗑 ELIMINAR PDF
                              </button>
                            )}
                          </>
                        ) : isAdmin ? (
                          <label style={{ cursor: 'pointer' }}>
                            <span style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: '#475569',
                                           display: 'inline-block', borderRadius: 6, color: '#fff', fontWeight: 700 }}>
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
   ESTILOS DEL MODAL
───────────────────────────────────────────────*/
const st = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 1000,
    backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
    padding: '24px 16px', overflowY: 'auto',
  },
  modal: {
    backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: 820,
    padding: '32px 36px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
    position: 'relative', marginBottom: 24,
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 8, paddingBottom: 12, borderBottom: '2px solid #e2e8f0',
  },
  brand:    { fontFamily:"'Montserrat',sans-serif", fontWeight:800, fontSize:'1.1rem', color:'#c0392b', letterSpacing:3 },
  brandSub: { fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:'0.75rem', color:'#64748b', letterSpacing:1 },
  btnX:     { background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer', color:'#94a3b8', padding:'4px 8px', borderRadius:6 },
  tituloBloque: { textAlign:'center', marginBottom:20, paddingBottom:16, borderBottom:'1px solid #e2e8f0' },
  h2:       { fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:'1.05rem', color:'#0f172a', margin:'0 0 4px', letterSpacing:2, textTransform:'uppercase' },
  subtitulo:{ fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:'0.8rem', color:'#64748b', margin:0, letterSpacing:1.5, textTransform:'uppercase' },
  grid3:    { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:20 },
  grid2:    { display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 },
  caja:     { backgroundColor:'#f8faff', borderRadius:10, padding:'16px 20px', marginBottom:20, border:'1px solid #e2e8f0' },
  campo:    { display:'flex', flexDirection:'column', gap:4 },
  lbl:      { fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:'0.65rem', color:'#64748b', letterSpacing:1, textTransform:'uppercase' },
  lblSection:{ display:'block', fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:'0.7rem', color:'#334155', letterSpacing:1.5, textTransform:'uppercase', marginBottom:8 },
  input:    { border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:'0.88rem', color:'#0f172a', fontFamily:'inherit', outline:'none', width:'100%', boxSizing:'border-box', backgroundColor:'#fff' },
  select:   { border:'1.5px solid #e2e8f0', borderRadius:8, padding:'8px 12px', fontSize:'0.88rem', color:'#0f172a', fontFamily:'inherit', outline:'none', backgroundColor:'#fff', cursor:'pointer', width:'100%', boxSizing:'border-box' },
  selectSm: { border:'1.5px solid #e2e8f0', borderRadius:8, padding:'6px 10px', fontSize:'0.85rem', color:'#0f172a', fontFamily:'inherit', outline:'none', backgroundColor:'#fff', cursor:'pointer', minWidth:90 },
  hint:     { fontSize:'0.72rem', color:'#f59e0b', marginTop:4 },
  tabla:    { width:'100%', borderCollapse:'collapse', fontSize:'0.85rem', border:'1px solid #e2e8f0', borderRadius:8, overflow:'hidden' },
  th:       { backgroundColor:'#1e3a5f', color:'#fff', padding:'10px 14px', textAlign:'left', fontWeight:700, fontSize:'0.72rem', letterSpacing:0.8, textTransform:'uppercase', fontFamily:"'Montserrat',sans-serif" },
  tdNombre: { padding:'7px 14px', color:'#334155', fontWeight:600, width:'32%', borderBottom:'1px solid #f1f5f9' },
  tdRes:    { padding:'5px 8px', width:'18%', borderBottom:'1px solid #f1f5f9' },
  tdFijo:   { padding:'7px 14px', color:'#64748b', fontSize:'0.82rem', borderBottom:'1px solid #f1f5f9' },
  inputRes: { width:'100%', border:'1.5px solid #e2e8f0', borderRadius:6, padding:'5px 8px', fontSize:'0.85rem', textAlign:'center', fontFamily:'inherit', outline:'none', boxSizing:'border-box', transition:'all 0.15s' },
  calidadRow:  { display:'flex', alignItems:'center', gap:20, flexWrap:'wrap', backgroundColor:'#f8faff', border:'1px solid #e2e8f0', borderRadius:10, padding:'12px 20px', marginBottom:20 },
  calidadLbl:  { fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:'0.7rem', color:'#334155', letterSpacing:1.5, textTransform:'uppercase', marginRight:8 },
  textarea:    { width:'100%', boxSizing:'border-box', border:'1.5px solid #e2e8f0', borderRadius:8, padding:'12px 14px', fontSize:'0.88rem', color:'#0f172a', fontFamily:'inherit', resize:'vertical', outline:'none', lineHeight:1.6 },
  footer:      { display:'flex', justifyContent:'flex-end', gap:12, paddingTop:8, borderTop:'1px solid #e2e8f0', marginTop:8 },
  btnCancel:   { padding:'10px 24px', backgroundColor:'#f1f5f9', color:'#475569', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'0.8rem', letterSpacing:1, fontFamily:"'Montserrat',sans-serif" },
  btnSave:     { padding:'10px 28px', backgroundColor:'#1e3a5f', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:'0.8rem', letterSpacing:1, fontFamily:"'Montserrat',sans-serif" },
};