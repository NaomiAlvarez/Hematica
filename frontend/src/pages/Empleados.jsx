import React, { useState, useEffect } from 'react';
import './Pages.css';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verVeterinarios, setVerVeterinarios] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [editandoItem, setEditandoItem] = useState(null); // null = nuevo, objeto = editando
  const [errForm, setErrForm] = useState({});
  const [form, setForm] = useState({
    nombre: '', correo: '', password: '', num_tel: '',
    id_tipo_usuario: '', nombre_clinica: '', direccion: '', curp: '', cedula: '',
  });

  // Estado para gestión de clientes de un veterinario
  const [vetSeleccionado, setVetSeleccionado] = useState(null);
  const [clientesAsignados, setClientesAsignados] = useState([]);
  const [todosLosClientes, setTodosLosClientes] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteAAsignar, setClienteAAsignar] = useState('');
  const [errClientes, setErrClientes] = useState('');

  const tiposEmpleado = [
    { id: 2, nombre: 'Veterinario' },
    { id: 3, nombre: 'Recepcionista' },
    { id: 4, nombre: 'Admin' },
  ];

  const sanitizar = (valor) => valor.replace(/<[^>]*>?/gm, '');

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const endpoint = verVeterinarios ? 'veterinarios' : 'empleados';
      const res = await fetch(`http://localhost:8000/api/v1/${endpoint}/`);
      setEmpleados(await res.json());
    } catch { setEmpleados([]); }
    setLoading(false);
  };

  useEffect(() => { cargarDatos(); }, [verVeterinarios]);

  // ── GESTIÓN DE CLIENTES ─────────────────────────────────────
  const gestionarClientes = async (vet) => {
    if (vetSeleccionado?.id_vet === vet.id_vet) { setVetSeleccionado(null); return; }
    setVetSeleccionado(vet);
    setErrClientes('');
    setClienteAAsignar('');
    setLoadingClientes(true);
    try {
      const [resAsignados, resTodos] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/veterinarios/${vet.id_vet}/clientes/`),
        fetch('http://localhost:8000/api/v1/clientes/')
      ]);
      setClientesAsignados(await resAsignados.json());
      setTodosLosClientes(await resTodos.json());
    } catch { setErrClientes('Error al cargar clientes'); }
    setLoadingClientes(false);
  };

  const asignarCliente = async () => {
    if (!clienteAAsignar) { setErrClientes('Selecciona un cliente'); return; }
    setErrClientes('');
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/veterinarios/${vetSeleccionado.id_vet}/asignar_cliente/`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_cliente: parseInt(clienteAAsignar) }) }
      );
      if (res.ok) {
        setClienteAAsignar('');
        const resAsignados = await fetch(`http://localhost:8000/api/v1/veterinarios/${vetSeleccionado.id_vet}/clientes/`);
        setClientesAsignados(await resAsignados.json());
      } else {
        const data = await res.json();
        setErrClientes(data.error || 'Error al asignar cliente');
      }
    } catch { setErrClientes('Error al conectar con el servidor'); }
  };

  const desasignarCliente = async (idCliente) => {
    if (!window.confirm('¿Seguro que quieres desasignar este cliente?')) return;
    setErrClientes('');
    try {
      const res = await fetch(
        `http://localhost:8000/api/v1/veterinarios/${vetSeleccionado.id_vet}/desasignar_cliente/`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_cliente: idCliente }) }
      );
      if (res.ok) {
        const resAsignados = await fetch(`http://localhost:8000/api/v1/veterinarios/${vetSeleccionado.id_vet}/clientes/`);
        setClientesAsignados(await resAsignados.json());
      } else {
        const data = await res.json();
        setErrClientes(data.error || 'Error al desasignar cliente');
      }
    } catch { setErrClientes('Error al conectar con el servidor'); }
  };

  // ── FORMULARIO ───────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    const limpio = name === 'curp' ? sanitizar(value).toUpperCase() : sanitizar(value);
    setForm({ ...form, [name]: limpio });
    setErrForm({ ...errForm, [name]: '' });
  };

  // Abrir formulario para EDITAR un empleado
  const abrirEditar = (item) => {
    setEditandoItem(item);
    setMostrarForm(true);
    setErrForm({});
    setVetSeleccionado(null);

    if (verVeterinarios) {
      // item es veterinario — tenemos nombre, clinica, cedula, curp, clientes_ids
      setForm({
        nombre: item.nombre || '',
        correo: '',
        password: '',
        num_tel: '',
        id_tipo_usuario: '2',
        nombre_clinica: item.clinica || '',
        direccion: '',
        curp: item.curp || '',
        cedula: item.cedula || '',
      });
    } else {
      // item es empleado — tenemos puesto, nombre_clinica, telefono, nombre
      setForm({
        nombre: item.nombre || '',
        correo: '',
        password: '',
        num_tel: item.telefono || '',
        id_tipo_usuario: '',
        nombre_clinica: item.nombre_clinica || '',
        direccion: item.direccion || '',
        curp: '',
        cedula: '',
      });
    }
  };

  // Abrir formulario para NUEVO empleado
  const abrirNuevo = () => {
    setEditandoItem(null);
    setMostrarForm(!mostrarForm);
    setErrForm({});
    setVetSeleccionado(null);
    setForm({ nombre: '', correo: '', password: '', num_tel: '', id_tipo_usuario: '', nombre_clinica: '', direccion: '', curp: '', cedula: '' });
  };

  // Validación del formulario
  const validarForm = () => {
    let errores = {};
    const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,100}$/;
    if (!form.nombre.trim() || !nombreRegex.test(form.nombre.trim()))
      errores.nombre = 'El nombre debe tener al menos 5 letras, sin números ni caracteres especiales';

    // Correo y contraseña solo obligatorios al crear
    if (!editandoItem) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!form.correo || !emailRegex.test(form.correo))
        errores.correo = 'Ingresa un correo electrónico válido';
      const passRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!form.password || !passRegex.test(form.password))
        errores.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número';
      if (!form.id_tipo_usuario)
        errores.id_tipo_usuario = 'Selecciona un tipo de empleado';
    }

    const telRegex = /^[0-9]{10}$/;
    if (!form.num_tel || !telRegex.test(form.num_tel))
      errores.num_tel = 'El teléfono debe tener exactamente 10 dígitos';

    if (!form.nombre_clinica.trim() || form.nombre_clinica.trim().length < 3)
      errores.nombre_clinica = 'El nombre de la clínica debe tener al menos 3 caracteres';

    if (!verVeterinarios && (!form.direccion.trim() || form.direccion.trim().length < 10))
      errores.direccion = 'La dirección debe tener al menos 10 caracteres';

    if (!editandoItem && String(form.id_tipo_usuario) === '2' || editandoItem && verVeterinarios) {
      const curpRegex = /^[A-Z]{4}[0-9]{6}[HM][A-Z]{5}[0-9A-Z]{2}$/;
      if (!form.curp || !curpRegex.test(form.curp))
        errores.curp = 'CURP inválido. Formato: 4 letras, 6 números, H/M, 5 letras, 2 alfanuméricos';
      const cedulaRegex = /^[0-9]{7,}$/;
      if (!form.cedula || !cedulaRegex.test(form.cedula))
        errores.cedula = 'La cédula profesional debe tener al menos 7 dígitos numéricos';
    }
    return errores;
  };

  // Crear nuevo empleado
  const crearEmpleado = async () => {
    const resUsuario = await fetch('http://localhost:8000/api/v1/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: form.nombre.trim(), correo: form.correo.trim(),
        password: form.password, num_tel: form.num_tel,
        id_tipo_usuario: parseInt(form.id_tipo_usuario),
      })
    });
    if (!resUsuario.ok) {
      const data = await resUsuario.json();
      setErrForm({ general: data.correo?.[0] || data.detail || 'Error al crear el usuario' });
      return false;
    }
    const nuevoUsuario = await resUsuario.json();

    const resEmpleado = await fetch('http://localhost:8000/api/v1/empleados/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_usuario: nuevoUsuario.id_usuario,
        id_tipo_emp: parseInt(form.id_tipo_usuario),
        nombre_clinica: form.nombre_clinica.trim(),
        direccion: form.direccion.trim(),
        telefono: form.num_tel,
      })
    });
    if (!resEmpleado.ok) {
      setErrForm({ general: 'Usuario creado pero error al crear empleado' });
      return false;
    }
    const nuevoEmpleado = await resEmpleado.json();

    if (String(form.id_tipo_usuario) === '2') {
      const resVet = await fetch('http://localhost:8000/api/v1/veterinarios/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_emp: nuevoEmpleado.id_emp, curp: form.curp, cedula: form.cedula })
      });
      if (!resVet.ok) {
        setErrForm({ general: 'Empleado creado pero error al registrar veterinario' });
        return false;
      }
    }
    return true;
  };

  // Editar empleado existente
  const editarEmpleado = async () => {
    if (verVeterinarios) {
      // Editar veterinario: actualizar curp y cedula
      const res = await fetch(`http://localhost:8000/api/v1/veterinarios/${editandoItem.id_vet}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curp: form.curp,
          cedula: form.cedula,
        })
      });
      if (!res.ok) {
        setErrForm({ general: 'Error al actualizar el veterinario' });
        return false;
      }
      // También actualizar datos del empleado (clínica, teléfono)
      const resEmp = await fetch(`http://localhost:8000/api/v1/empleados/${editandoItem.id_emp}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_clinica: form.nombre_clinica.trim(),
          telefono: form.num_tel,
        })
      });
      if (!resEmp.ok) {
        setErrForm({ general: 'Error al actualizar datos del empleado' });
        return false;
      }
    } else {
      // Editar empleado general
      const res = await fetch(`http://localhost:8000/api/v1/empleados/${editandoItem.id_emp}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_clinica: form.nombre_clinica.trim(),
          telefono: form.num_tel,
          direccion: form.direccion.trim(),
        })
      });
      if (!res.ok) {
        setErrForm({ general: 'Error al actualizar el empleado' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errores = validarForm();
    if (Object.keys(errores).length > 0) { setErrForm(errores); return; }
    setErrForm({});
    setGuardando(true);
    try {
      const ok = editandoItem ? await editarEmpleado() : await crearEmpleado();
      if (ok) {
        setMostrarForm(false);
        setEditandoItem(null);
        setForm({ nombre: '', correo: '', password: '', num_tel: '', id_tipo_usuario: '', nombre_clinica: '', direccion: '', curp: '', cedula: '' });
        cargarDatos();
      }
    } catch { setErrForm({ general: 'Error al conectar con el servidor' }); }
    setGuardando(false);
  };

  // Eliminar empleado o veterinario
  const handleEliminar = async (item) => {
    const nombre = verVeterinarios ? item.nombre : (item.nombre || item.puesto);
    if (!window.confirm(`¿Seguro que quieres eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      const endpoint = verVeterinarios
        ? `http://localhost:8000/api/v1/veterinarios/${item.id_vet}/`
        : `http://localhost:8000/api/v1/empleados/${item.id_emp}/`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok || res.status === 204) {
        cargarDatos();
      } else {
        alert('Error al eliminar. Puede que tenga datos asociados.');
      }
    } catch { alert('Error al conectar con el servidor'); }
  };

  const esVeterinario = String(form.id_tipo_usuario) === '2';
  const clientesDisponibles = todosLosClientes.filter(
    c => !clientesAsignados.some(a => a.id_cliente === c.id_cliente)
  );

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">PERSONAL</h1>
          <p className="subtitle-boutique">Gestión de capital humano y especialistas</p>
        </div>
        <button className="btn-add-boutique" onClick={abrirNuevo}>
          <span>+</span>
        </button>
      </header>

      {/* ── FORMULARIO NUEVO / EDITAR ── */}
      {mostrarForm && (
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>
            {editandoItem
              ? `Editar ${verVeterinarios ? 'Veterinario' : 'Empleado'}`
              : 'Nuevo Empleado'}
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Nombre — siempre visible pero readonly al editar */}
            <div className="input-group">
              <label>NOMBRE COMPLETO {!editandoItem && '*'}</label>
              <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Nombre completo del empleado" maxLength={100}
                readOnly={!!editandoItem}
                style={editandoItem ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}}
                className={errForm.nombre ? 'input-error' : ''} />
              {errForm.nombre && <span className="error-message">{errForm.nombre}</span>}
              {editandoItem && <span style={{ fontSize: '11px', color: '#94a3b8' }}>El nombre se gestiona desde el perfil del usuario</span>}
            </div>

            {/* Teléfono — siempre visible */}
            <div className="input-group">
              <label>TELÉFONO *</label>
              <input type="tel" name="num_tel" value={form.num_tel} onChange={handleChange}
                placeholder="10 dígitos" maxLength={10}
                className={errForm.num_tel ? 'input-error' : ''} />
              {errForm.num_tel && <span className="error-message">{errForm.num_tel}</span>}
            </div>

            {/* Campos solo al crear */}
            {!editandoItem && (
              <>
                <div className="input-group">
                  <label>CORREO ELECTRÓNICO *</label>
                  <input type="email" name="correo" value={form.correo} onChange={handleChange}
                    placeholder="correo@hematica.com"
                    className={errForm.correo ? 'input-error' : ''} />
                  {errForm.correo && <span className="error-message">{errForm.correo}</span>}
                </div>

                <div className="input-group">
                  <label>CONTRASEÑA TEMPORAL *</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange}
                    placeholder="Mín. 8 caracteres, 1 mayúscula, 1 número"
                    className={errForm.password ? 'input-error' : ''} />
                  {errForm.password && <span className="error-message">{errForm.password}</span>}
                </div>

                <div className="input-group">
                  <label>TIPO DE EMPLEADO *</label>
                  <select name="id_tipo_usuario" value={form.id_tipo_usuario} onChange={handleChange}
                    className={errForm.id_tipo_usuario ? 'input-error' : ''}>
                    <option value="">Seleccionar tipo</option>
                    {tiposEmpleado.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>
                  {errForm.id_tipo_usuario && <span className="error-message">{errForm.id_tipo_usuario}</span>}
                </div>
              </>
            )}

            {/* Clínica */}
            <div className="input-group">
              <label>NOMBRE DE LA CLÍNICA *</label>
              <input type="text" name="nombre_clinica" value={form.nombre_clinica} onChange={handleChange}
                placeholder="Ej. Hemática Central" maxLength={100}
                className={errForm.nombre_clinica ? 'input-error' : ''} />
              {errForm.nombre_clinica && <span className="error-message">{errForm.nombre_clinica}</span>}
            </div>

            {/* Dirección — solo para empleados no veterinarios */}
            {(!editandoItem && !esVeterinario) || (editandoItem && !verVeterinarios) ? (
              <div className="input-group" style={{ gridColumn: '1/-1' }}>
                <label>DIRECCIÓN *</label>
                <input type="text" name="direccion" value={form.direccion} onChange={handleChange}
                  placeholder="Calle, número, colonia, ciudad" maxLength={200}
                  className={errForm.direccion ? 'input-error' : ''} />
                {errForm.direccion && <span className="error-message">{errForm.direccion}</span>}
              </div>
            ) : null}

            {/* Campos extra solo para veterinario */}
            {((!editandoItem && esVeterinario) || (editandoItem && verVeterinarios)) && (
              <>
                <div className="input-group">
                  <label>CURP *</label>
                  <input type="text" name="curp" value={form.curp} onChange={handleChange}
                    placeholder="18 caracteres" maxLength={18}
                    className={errForm.curp ? 'input-error' : ''} />
                  {errForm.curp && <span className="error-message">{errForm.curp}</span>}
                </div>
                <div className="input-group">
                  <label>CÉDULA PROFESIONAL *</label>
                  <input type="text" name="cedula" value={form.cedula} onChange={handleChange}
                    placeholder="Mínimo 7 dígitos" maxLength={20}
                    className={errForm.cedula ? 'input-error' : ''} />
                  {errForm.cedula && <span className="error-message">{errForm.cedula}</span>}
                </div>
              </>
            )}

            {errForm.general && (
              <p style={{ color: '#ef4444', gridColumn: '1/-1', fontSize: '0.85rem' }}>{errForm.general}</p>
            )}

            <div style={{ gridColumn: '1/-1', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn-add-boutique" disabled={guardando}>
                {guardando ? 'GUARDANDO...' : editandoItem ? 'ACTUALIZAR' : 'GUARDAR'}
              </button>
              <button type="button" className="btn-add-boutique" style={{ backgroundColor: '#64748b' }}
                onClick={() => { setMostrarForm(false); setEditandoItem(null); setErrForm({}); }}>
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="personal-tabs-container">
        <button className={`btn-tab-boutique ${!verVeterinarios ? 'active' : ''}`}
          onClick={() => { setVerVeterinarios(false); setVetSeleccionado(null); setMostrarForm(false); setEditandoItem(null); }}>
          EMPLEADOS
        </button>
        <button className={`btn-tab-boutique ${verVeterinarios ? 'active' : ''}`}
          onClick={() => { setVerVeterinarios(true); setVetSeleccionado(null); setMostrarForm(false); setEditandoItem(null); }}>
          VETERINARIOS
        </button>
      </div>

      {/* ── TABLA ── */}
      {loading ? (
        <p className="subtitle-boutique">Cargando...</p>
      ) : empleados.length === 0 ? (
        <p className="subtitle-boutique">No hay {verVeterinarios ? 'veterinarios' : 'empleados'} registrados.</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                {verVeterinarios ? (
                  <>
                    <th>NOMBRE</th>
                    <th>CARGO</th>
                    <th>CLÍNICA</th>
                    <th>TELÉFONO</th>
                    <th>CÉDULA</th>
                    <th>CLIENTES</th>
                  </>
                ) : (
                  <>
                    <th>NOMBRE</th>
                    <th>PUESTO</th>
                    <th>CLÍNICA</th>
                    <th>TELÉFONO</th>
                  </>
                )}
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {empleados.map((item) => (
                <React.Fragment key={item.id_emp || item.id_vet}>
                  <tr>
                    {verVeterinarios ? (
                      <>
                        <td className="name-cell">{item.nombre}</td>
                        <td>
                          <span style={{ background: '#dbeafe', color: '#1e40af', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '600' }}>
                            Veterinario
                          </span>
                        </td>
                        <td>{item.clinica}</td>
                        <td style={{ fontSize: '0.85rem' }}>{item.telefono || '—'}</td>
                        <td className="id-cell">{item.cedula}</td>
                        <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {item.clientes_ids?.length || 0} cliente(s)
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="name-cell">{item.nombre || '—'}</td>
                        <td>
                          <span style={{ background: '#f0fdf4', color: '#15803d', borderRadius: '4px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '600' }}>
                            {item.puesto}
                          </span>
                        </td>
                        <td>{item.nombre_clinica}</td>
                        <td style={{ fontSize: '0.85rem' }}>{item.telefono}</td>
                      </>
                    )}
                    <td className="actions-cell">
                      {verVeterinarios && (
                        <button
                          className="btn-add-boutique"
                          style={{ padding: '6px 10px', fontSize: '10px', backgroundColor: '#3b82f6', marginRight: '6px' }}
                          onClick={() => gestionarClientes(item)}
                          title="Gestionar clientes"
                        >
                          {vetSeleccionado?.id_vet === item.id_vet ? 'CERRAR' : '👥 CLIENTES'}
                        </button>
                      )}
                      <button
                        className="btn-action edit"
                        title="Editar"
                        onClick={() => abrirEditar(item)}
                      >✎</button>
                      <button
                        className="btn-action delete"
                        title="Eliminar"
                        onClick={() => handleEliminar(item)}
                      >🗑</button>
                    </td>
                  </tr>

                  {/* Panel de gestión de clientes expandido */}
                  {verVeterinarios && vetSeleccionado?.id_vet === item.id_vet && (
                    <tr>
                      <td colSpan={7} style={{ background: '#eff6ff', padding: '16px 24px', borderBottom: '2px solid #bfdbfe' }}>
                        <h4 style={{ color: '#1e3a5f', marginBottom: '12px' }}>
                          Clientes de {item.nombre}
                        </h4>
                        {loadingClientes ? (
                          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cargando clientes...</p>
                        ) : (
                          <>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                              <select
                                value={clienteAAsignar}
                                onChange={e => { setClienteAAsignar(e.target.value); setErrClientes(''); }}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #bfdbfe', minWidth: '250px', fontSize: '14px' }}
                              >
                                <option value="">Seleccionar cliente a asignar</option>
                                {clientesDisponibles.map(c => (
                                  <option key={c.id_cliente} value={c.id_cliente}>
                                    {c.nombre} — {c.correo}
                                  </option>
                                ))}
                              </select>
                              <button
                                className="btn-add-boutique"
                                style={{ padding: '8px 16px', fontSize: '12px', backgroundColor: '#16a34a' }}
                                onClick={asignarCliente}
                              >
                                + ASIGNAR
                              </button>
                            </div>
                            {errClientes && (
                              <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '10px' }}>{errClientes}</p>
                            )}
                            {clientesAsignados.length === 0 ? (
                              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Este veterinario no tiene clientes asignados.</p>
                            ) : (
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #bfdbfe' }}>
                                    <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '11px', color: '#1e40af', letterSpacing: '1px' }}>NOMBRE</th>
                                    <th style={{ textAlign: 'left', padding: '6px 8px', fontSize: '11px', color: '#1e40af', letterSpacing: '1px' }}>CORREO</th>
                                    <th style={{ textAlign: 'center', padding: '6px 8px', fontSize: '11px', color: '#1e40af', letterSpacing: '1px' }}>ACCIÓN</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {clientesAsignados.map(c => (
                                    <tr key={c.id_cliente} style={{ borderBottom: '1px solid #dbeafe' }}>
                                      <td style={{ padding: '6px 8px', fontSize: '0.85rem', fontWeight: '600' }}>{c.nombre}</td>
                                      <td style={{ padding: '6px 8px', fontSize: '0.85rem', color: '#64748b' }}>{c.correo}</td>
                                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                                        <button
                                          className="btn-add-boutique"
                                          style={{ padding: '4px 10px', fontSize: '10px', backgroundColor: '#dc2626' }}
                                          onClick={() => desasignarCliente(c.id_cliente)}
                                        >
                                          DESASIGNAR
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Empleados;