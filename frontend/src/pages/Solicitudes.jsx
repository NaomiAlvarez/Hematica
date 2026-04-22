import React from 'react';

const Solicitudes = () => {
    // Estos datos simulan lo que el Serializer de Sebastian enviará
    const solicitudesData = [
        {
            id_solicitud: 1,
            paciente_nombre: "Thor",
            dueno: "Liza Pérez",
            fecha_solicitud: "2024-05-21",
            estado: "pendiente",
            notas_cliente: "Requiere ayuno"
        },
        {
            id_solicitud: 2,
            paciente_nombre: "Luna",
            dueno: "Carlos Ruiz",
            fecha_solicitud: "2024-05-22",
            estado: "completado",
            notas_cliente: "Urgente"
        }
    ];

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Panel de Solicitudes</h2>
            <table className="table table-striped border">
                <thead className="table-dark">
                    <tr>
                        <th>Folio</th>
                        <th>Paciente</th>
                        <th>Dueño</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudesData.map((sol) => (
                        <tr key={sol.id_solicitud}>
                            <td>{sol.id_solicitud}</td>
                            <td>{sol.paciente_nombre}</td>
                            <td>{sol.dueno}</td>
                            <td>{sol.fecha_solicitud}</td>
                            <td>
                                <span className={`badge ${sol.estado === 'pendiente' ? 'bg-warning' : 'bg-success'}`}>
                                    {sol.estado}
                                </span>
                            </td>
                            <td>{sol.notas_cliente}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Solicitudes;