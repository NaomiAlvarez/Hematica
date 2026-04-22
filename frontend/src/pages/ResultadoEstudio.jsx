import React from 'react';

const ResultadoEstudio = () => {
    const resultadosData = [
        {
            id_resultado: 501,
            id_solicitud: 1,
            fecha_muestra: "2024-05-21",
            observaciones: "Muestra recolectada a tiempo",
            reporte_clinico: "Resultados dentro de los rangos normales."
        }
    ];

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Resultados de Estudios</h2>
            <div className="row">
                {resultadosData.map((res) => (
                    <div className="col-md-6" key={res.id_resultado}>
                        <div className="card shadow-sm mb-3">
                            <div className="card-header bg-primary text-white">
                                Resultado #{res.id_resultado} (Solicitud {res.id_solicitud})
                            </div>
                            <div className="card-body">
                                <p><strong>Fecha:</strong> {res.fecha_muestra}</p>
                                <p><strong>Observaciones:</strong> {res.observaciones}</p>
                                <hr />
                                <p><strong>Reporte Clínico:</strong></p>
                                <div className="p-2 bg-light border">{res.reporte_clinico}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ResultadoEstudio;