/*
 * Vista administrativa de pacientes.
 * Presenta una tabla filtrable y paginada de mascotas registradas.
 */
import React, { useMemo, useState, useEffect } from 'react';
import ListingControls, { getPaginatedItems, normalizeText } from '../components/ListingControls';
import './Pages.css';

const Pacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [especieFiltro, setEspecieFiltro] = useState('todas');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  useEffect(() => {
    // Vista de solo lectura: trae todos los pacientes permitidos para admin.
    const obtenerPacientes = async () => {
      try {
        const respuesta = await fetch('http://localhost:8000/api/v1/pacientes/');
        if (!respuesta.ok) throw new Error('Error en la respuesta');
        setPacientes(await respuesta.json());
      } catch {
        setPacientes([
          { id_paciente: 1, nombre: 'Firulais (Demo)', sexo: 'M', especie_nombre: 'Canino', raza_nombre: 'Labrador', dueno: 'Maria Lopez', edad: 3 },
          { id_paciente: 2, nombre: 'Michi (Demo)', sexo: 'F', especie_nombre: 'Felino', raza_nombre: 'Siames', dueno: 'Juan Perez', edad: 2 },
        ]);
      }
      setLoading(false);
    };

    obtenerPacientes();
  }, []);

  const especiesDisponibles = useMemo(() => (
    // Deriva opciones de filtro desde los pacientes cargados.
    [...new Set(pacientes.map((p) => p.especie_nombre).filter(Boolean))]
  ), [pacientes]);

  const pacientesFiltrados = useMemo(() => {
    // Filtra por texto y especie antes de paginar.
    const texto = normalizeText(busqueda);
    return pacientes.filter((paci) => {
      const coincideTexto = !texto || normalizeText(
        [paci.nombre, paci.especie_nombre, paci.raza_nombre, paci.dueno, paci.edad, paci.sexo].join(' ')
      ).includes(texto);
      const coincideEspecie = especieFiltro === 'todas' || paci.especie_nombre === especieFiltro;
      return coincideTexto && coincideEspecie;
    });
  }, [pacientes, busqueda, especieFiltro]);

  const pacientesPaginados = useMemo(
    () => getPaginatedItems(pacientesFiltrados, pagina, porPagina),
    [pacientesFiltrados, pagina, porPagina]
  );

  useEffect(() => {
    setPagina(1);
  }, [busqueda, especieFiltro, porPagina]);

  return (
    <div className="page-container">
      <header className="page-header-boutique">
        <div className="header-text">
          <h1 className="title-boutique">PACIENTES</h1>
          <p className="subtitle-boutique">Registro clinico de mascotas y ejemplares</p>
        </div>
        <button className="btn-add-main">
          <span className="plus-icon">+</span> Nuevo paciente
        </button>
      </header>

      <ListingControls
        search={busqueda}
        onSearchChange={setBusqueda}
        searchPlaceholder="Paciente, raza, dueno o edad"
        totalItems={pacientes.length}
        filteredItems={pacientesFiltrados.length}
        page={pagina}
        pageSize={porPagina}
        onPageChange={setPagina}
        onPageSizeChange={setPorPagina}
      >
        <div className="listing-filter">
          <label>Especie</label>
          <select value={especieFiltro} onChange={(e) => setEspecieFiltro(e.target.value)}>
            <option value="todas">Todas</option>
            {especiesDisponibles.map((especie) => (
              <option key={especie} value={especie}>{especie}</option>
            ))}
          </select>
        </div>
      </ListingControls>

      {loading ? (
        <div className="loading-state">
          <p className="subtitle-boutique">Sincronizando expedientes...</p>
        </div>
      ) : pacientesFiltrados.length === 0 ? (
        <p className="subtitle-boutique">No hay pacientes que coincidan con los filtros.</p>
      ) : (
        <div className="table-responsive">
          <table className="boutique-table">
            <thead>
              <tr>
                <th>PACIENTE</th>
                <th>ESPECIE / RAZA</th>
                <th className="responsive-hide-mobile">DUENO</th>
                <th className="responsive-hide-mobile">EDAD</th>
                <th style={{ textAlign: 'center' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {pacientesPaginados.map((paci) => (
                <tr key={paci.id_paciente}>
                  <td className="name-cell">
                    <span className="patient-name">{paci.nombre}</span>
                    <span className="gender-tag">{paci.sexo === 'M' ? 'M' : 'H'}</span>
                    <div className="responsive-detail-list">
                      <span>{paci.dueno}</span>
                      <span>{paci.edad} anos</span>
                    </div>
                  </td>
                  <td>{paci.especie_nombre} - {paci.raza_nombre}</td>
                  <td className="owner-cell responsive-hide-mobile">{paci.dueno}</td>
                  <td className="responsive-hide-mobile">{paci.edad} anos</td>
                  <td className="actions-cell">
                    <button className="btn-table-action" title="Ver expediente">Ver detalle</button>
                    <button className="btn-table-action" title="Eliminar registro" style={{ backgroundColor: '#dc2626' }}>Eliminar</button>
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

export default Pacientes;
