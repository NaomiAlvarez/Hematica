/*
 * Administracion de usuarios y roles.
 * Lista usuarios existentes, permite filtrar por rol y guarda cambios de rol
 * usando endpoints administrativos del modulo auth.
 */
import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ListingControls, { getPaginatedItems, normalizeText } from '../components/ListingControls';
import './Pages.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesSeleccionados, setRolesSeleccionados] = useState({});
  const [busqueda, setBusqueda] = useState('');
  const [rolFiltro, setRolFiltro] = useState('todos');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [loading, setLoading] = useState(true);
  const [guardandoId, setGuardandoId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const obtenerHeaders = () => ({
    // Aunque index.js agrega token, aqui se deja explicito por ser pantalla admin.
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  });

  const cargarDatos = useCallback(async () => {
    // Carga usuarios y roles en paralelo para armar la tabla editable.
    setLoading(true);
    setError('');
    setMensaje('');

    try {
      const [usuariosRes, rolesRes] = await Promise.all([
        fetch(`${API_URL}/auth/usuarios/`, { headers: obtenerHeaders() }),
        fetch(`${API_URL}/auth/tipos-usuario/`, { headers: obtenerHeaders() }),
      ]);

      const usuariosData = await usuariosRes.json();
      const rolesData = await rolesRes.json();

      if (!usuariosRes.ok) throw new Error(usuariosData.error || 'No se pudieron cargar los usuarios');
      if (!rolesRes.ok) throw new Error(rolesData.error || 'No se pudieron cargar los roles');

      setUsuarios(usuariosData);
      setRoles(rolesData);
      setRolesSeleccionados(
        usuariosData.reduce((acumulado, usuario) => ({
          ...acumulado,
          [usuario.id_usuario]: String(usuario.id_tipo_usuario),
        }), {})
      );
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
      setUsuarios([]);
      setRoles([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const usuariosFiltrados = useMemo(() => {
    // Normaliza texto para buscar por nombre, correo, telefono o rol.
    const texto = normalizeText(busqueda.trim());

    return usuarios.filter((usuario) => {
      const rol = usuario.tipo_usuario?.descripcion || '';
      const coincideTexto = !texto || normalizeText(
        [usuario.nombre, usuario.correo, usuario.num_tel, rol].join(' ')
      ).includes(texto);
      const coincideRol = rolFiltro === 'todos' || String(usuario.id_tipo_usuario) === rolFiltro;
      return coincideTexto && coincideRol;
    });
  }, [usuarios, busqueda, rolFiltro]);

  const usuariosPaginados = useMemo(
    () => getPaginatedItems(usuariosFiltrados, pagina, porPagina),
    [usuariosFiltrados, pagina, porPagina]
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda, rolFiltro, porPagina]);

  const cambiarSeleccionRol = (idUsuario, idRol) => {
    setRolesSeleccionados((actual) => ({ ...actual, [idUsuario]: idRol }));
    setMensaje('');
    setError('');
  };

  const guardarRol = async (usuario) => {
    // Solo envia PATCH cuando el rol seleccionado realmente cambio.
    const rolSeleccionado = rolesSeleccionados[usuario.id_usuario];
    if (!rolSeleccionado || String(usuario.id_tipo_usuario) === rolSeleccionado) return;

    setGuardandoId(usuario.id_usuario);
    setError('');
    setMensaje('');

    try {
      const res = await fetch(`${API_URL}/auth/usuarios/${usuario.id_usuario}/rol/`, {
        method: 'PATCH',
        headers: obtenerHeaders(),
        body: JSON.stringify({ id_tipo_usuario: Number(rolSeleccionado) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo actualizar el rol');

      setUsuarios((actuales) =>
        actuales.map((item) => (item.id_usuario === usuario.id_usuario ? data : item))
      );
      setRolesSeleccionados((actual) => ({
        ...actual,
        [usuario.id_usuario]: String(data.id_tipo_usuario),
      }));
      setMensaje(`Rol actualizado para ${data.nombre}`);
    } catch (err) {
      setError(err.message || 'Error al actualizar el rol');
    }

    setGuardandoId(null);
  };

  const obtenerClaseRol = (descripcion = '') => {
    const rol = descripcion.toLowerCase();
    if (rol.includes('admin')) return 'role-admin';
    if (rol.includes('veterinario')) return 'role-vet';
    if (rol.includes('recepcion')) return 'role-recepcion';
    return 'role-cliente';
  };

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">USUARIOS Y ROLES</h1>
          <p className="subtitle-boutique">Asigna el acceso correcto a cada persona del sistema</p>
        </div>
        <button className="btn-add-main" onClick={cargarDatos} disabled={loading}>
          {loading ? 'CARGANDO...' : 'ACTUALIZAR'}
        </button>
      </header>

      <div className="role-admin-panel">
        <div>
          <span className="role-admin-kicker">Administracion</span>
          <h2>Gestion de permisos</h2>
          <p>
            Cambia el rol de cada usuario desde un solo lugar. Los cambios se aplican al
            siguiente acceso y tambien quedan reflejados en su perfil.
          </p>
        </div>
        <div className="role-admin-stats">
          <strong>{usuarios.length}</strong>
          <span>usuarios registrados</span>
        </div>
      </div>

      <ListingControls
        search={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Nombre, correo, telefono o rol"
        totalItems={usuarios.length}
        filteredItems={usuariosFiltrados.length}
        page={pagina}
        pageSize={porPagina}
        onPageChange={setPagina}
        onPageSizeChange={setPorPagina}
      >
        <div className="listing-filter">
          <label>Rol</label>
          <select value={rolFiltro} onChange={(e) => setRolFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            {roles.map((rol) => (
              <option key={rol.id_tipo_usuario} value={rol.id_tipo_usuario}>
                {rol.descripcion}
              </option>
            ))}
          </select>
        </div>
      </ListingControls>

      {mensaje && <div className="notice success">{mensaje}</div>}
      {error && <div className="notice error">{error}</div>}

      {loading ? (
        <p className="subtitle-boutique">Cargando usuarios...</p>
      ) : usuariosFiltrados.length === 0 ? (
        <p className="subtitle-boutique">No hay usuarios que coincidan con la busqueda.</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table users-role-table">
            <thead>
              <tr>
                <th>USUARIO</th>
                <th>CORREO</th>
                <th>TELEFONO</th>
                <th>ROL ACTUAL</th>
                <th>NUEVO ROL</th>
                <th style={{ textAlign: 'center' }}>ACCION</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((usuario) => {
                const rolActual = usuario.tipo_usuario?.descripcion || 'Sin rol';
                const rolCambiado = String(usuario.id_tipo_usuario) !== rolesSeleccionados[usuario.id_usuario];

                return (
                  <tr key={usuario.id_usuario}>
                    <td>
                      <div className="user-name-stack">
                        <strong>{usuario.nombre}</strong>
                        <span>#{usuario.id_usuario}</span>
                      </div>
                    </td>
                    <td>{usuario.correo}</td>
                    <td>{usuario.num_tel}</td>
                    <td>
                      <span className={`status-badge role-badge ${obtenerClaseRol(rolActual)}`}>
                        {rolActual}
                      </span>
                    </td>
                    <td>
                      <select
                        className="role-select"
                        value={rolesSeleccionados[usuario.id_usuario] || ''}
                        onChange={(e) => cambiarSeleccionRol(usuario.id_usuario, e.target.value)}
                      >
                        <option value="">Seleccionar rol</option>
                        {roles.map((rol) => (
                          <option key={rol.id_tipo_usuario} value={rol.id_tipo_usuario}>
                            {rol.descripcion}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-table-action"
                        disabled={!rolCambiado || guardandoId === usuario.id_usuario}
                        onClick={() => guardarRol(usuario)}
                      >
                        {guardandoId === usuario.id_usuario ? 'GUARDANDO...' : 'GUARDAR'}
                      </button>
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

export default Usuarios;
