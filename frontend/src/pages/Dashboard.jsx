import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import './Dashboard.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const ESTADO_LABELS = {
  pendiente: 'Pendiente',
  muestra_recibida: 'Muestra recibida',
  en_proceso: 'En proceso',
  finalizado: 'Finalizado',
  cancelado: 'Cancelado',
};

const ESTADO_COLORS = {
  pendiente: '#2563eb',
  muestra_recibida: '#0891b2',
  en_proceso: '#f59e0b',
  finalizado: '#16a34a',
  cancelado: '#dc2626',
};

const MONTH_LABELS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const fetchJson = async (path) => {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
  return res.json();
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) =>
  value.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const EChart = ({ option, height = 320 }) => {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    chartRef.current = echarts.init(containerRef.current, null, { renderer: 'canvas' });

    const resize = () => chartRef.current?.resize();
    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(resize)
      : null;

    if (observer) observer.observe(containerRef.current);
    window.addEventListener('resize', resize);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption(option, true);
    }
  }, [option]);

  return <div className="dashboard-chart" ref={containerRef} style={{ height }} />;
};

const KpiCard = ({ label, value, detail, tone }) => (
  <article className={`kpi-card kpi-${tone}`}>
    <span>{label}</span>
    <strong>{value}</strong>
    <small>{detail}</small>
  </article>
);

const ChartCard = ({ title, subtitle, children }) => (
  <section className="dashboard-card">
    <div className="dashboard-card-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const Dashboard = () => {
  const [data, setData] = useState({
    solicitudes: [],
    solicitudEstudios: [],
    estudios: [],
    resultados: [],
    pacientes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      setLoading(true);
      setError('');
      try {
        const [solicitudes, solicitudEstudios, estudios, resultados, pacientes] = await Promise.all([
          fetchJson('/solicitudes/'),
          fetchJson('/solicitud-estudios/'),
          fetchJson('/estudios/'),
          fetchJson('/resultados/'),
          fetchJson('/pacientes/'),
        ]);

        if (activo) {
          setData({ solicitudes, solicitudEstudios, estudios, resultados, pacientes });
        }
      } catch (err) {
        if (activo) setError('No se pudieron cargar las metricas del laboratorio.');
      } finally {
        if (activo) setLoading(false);
      }
    };

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const metricas = useMemo(() => {
    const { solicitudes, solicitudEstudios, estudios, resultados, pacientes } = data;
    const estudiosPorId = new Map(estudios.map((est) => [String(est.id_catalogo), est]));

    const costoSolicitud = (idSolicitud) => solicitudEstudios
      .filter((item) => String(item.id_solicitud) === String(idSolicitud))
      .reduce((total, item) => {
        const estudio = estudiosPorId.get(String(item.id_catalogo));
        return total + toNumber(estudio?.precio ?? item.precio);
      }, 0);

    const porEstado = solicitudes.reduce((acc, solicitud) => {
      acc[solicitud.estado] = (acc[solicitud.estado] || 0) + 1;
      return acc;
    }, {});

    const ingresosEstimados = solicitudes.reduce(
      (total, solicitud) => total + costoSolicitud(solicitud.id_solicitud),
      0
    );

    const ingresosFinalizados = solicitudes
      .filter((solicitud) => solicitud.estado === 'finalizado')
      .reduce((total, solicitud) => total + costoSolicitud(solicitud.id_solicitud), 0);

    const solicitudesActivas = solicitudes.filter(
      (solicitud) => !['finalizado', 'cancelado'].includes(solicitud.estado)
    ).length;

    const estudiosSolicitados = solicitudEstudios.reduce((acc, item) => {
      const key = String(item.id_catalogo);
      const estudio = estudiosPorId.get(key);
      const nombre = item.estudio_nombre || estudio?.nombre || `Estudio ${key}`;
      const precio = toNumber(estudio?.precio ?? item.precio);
      if (!acc[key]) acc[key] = { nombre, total: 0, ingreso: 0 };
      acc[key].total += 1;
      acc[key].ingreso += precio;
      return acc;
    }, {});

    const topEstudios = Object.values(estudiosSolicitados)
      .sort((a, b) => b.total - a.total)
      .slice(0, 7);

    const ingresosPorEstudio = Object.values(estudiosSolicitados)
      .sort((a, b) => b.ingreso - a.ingreso)
      .slice(0, 6);

    const mesActual = new Date();
    const meses = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(mesActual.getFullYear(), mesActual.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        label: `${MONTH_LABELS[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`,
        total: 0,
      };
    });

    const mesesPorKey = new Map(meses.map((mes) => [mes.key, mes]));
    solicitudes.forEach((solicitud) => {
      const date = new Date(solicitud.fecha_solicitud);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (mesesPorKey.has(key)) mesesPorKey.get(key).total += 1;
    });

    const cargaVeterinarios = resultados.reduce((acc, resultado) => {
      const nombre = resultado.veterinario_nombre || 'Sin asignar';
      acc[nombre] = (acc[nombre] || 0) + 1;
      return acc;
    }, {});

    const veterinarios = Object.entries(cargaVeterinarios)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);

    const recientes = [...solicitudes]
      .sort((a, b) => new Date(b.fecha_solicitud) - new Date(a.fecha_solicitud))
      .slice(0, 6)
      .map((solicitud) => ({
        ...solicitud,
        total: costoSolicitud(solicitud.id_solicitud),
      }));

    return {
      porEstado,
      ingresosEstimados,
      ingresosFinalizados,
      solicitudesActivas,
      pacientesTotal: pacientes.length,
      resultadosTotal: resultados.length,
      topEstudios,
      ingresosPorEstudio,
      meses,
      veterinarios,
      recientes,
      totalSolicitudes: solicitudes.length,
    };
  }, [data]);

  const estadosOption = useMemo(() => ({
    color: Object.values(ESTADO_COLORS),
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { color: '#475569' },
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '43%'],
        avoidLabelOverlap: true,
        label: { color: '#334155', formatter: '{b}\n{c}' },
        data: Object.entries(metricas.porEstado).map(([estado, total]) => ({
          name: ESTADO_LABELS[estado] || estado,
          value: total,
          itemStyle: { color: ESTADO_COLORS[estado] },
        })),
      },
    ],
  }), [metricas.porEstado]);

  const estudiosOption = useMemo(() => ({
    color: ['#0891b2'],
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 8, right: 18, top: 20, bottom: 12, containLabel: true },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: metricas.topEstudios.map((item) => item.nombre),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#475569', width: 130, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: metricas.topEstudios.map((item) => item.total),
        barWidth: 16,
        itemStyle: { borderRadius: [0, 5, 5, 0] },
        label: { show: true, position: 'right', color: '#0f172a' },
      },
    ],
  }), [metricas.topEstudios]);

  const tendenciaOption = useMemo(() => ({
    color: ['#2563eb'],
    tooltip: { trigger: 'axis' },
    grid: { left: 10, right: 18, top: 28, bottom: 16, containLabel: true },
    xAxis: {
      type: 'category',
      data: metricas.meses.map((mes) => mes.label),
      boundaryGap: false,
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#475569' },
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#475569' },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: metricas.meses.map((mes) => mes.total),
        areaStyle: { color: 'rgba(37, 99, 235, 0.10)' },
        lineStyle: { width: 3 },
      },
    ],
  }), [metricas.meses]);

  const ingresosOption = useMemo(() => ({
    color: ['#16a34a'],
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value) => formatMoney(value),
    },
    grid: { left: 8, right: 18, top: 20, bottom: 12, containLabel: true },
    xAxis: {
      type: 'category',
      data: metricas.ingresosPorEstudio.map((item) => item.nombre),
      axisLabel: { color: '#475569', rotate: 25, width: 96, overflow: 'truncate' },
      axisLine: { lineStyle: { color: '#cbd5e1' } },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#475569', formatter: (value) => `$${value}` },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [
      {
        type: 'bar',
        data: metricas.ingresosPorEstudio.map((item) => Math.round(item.ingreso)),
        barWidth: 22,
        itemStyle: { borderRadius: [5, 5, 0, 0] },
      },
    ],
  }), [metricas.ingresosPorEstudio]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">Cargando metricas del laboratorio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <header className="dashboard-header">
          <div>
            <h1>Dashboard administrativo</h1>
            <p>Resumen operativo de Hematica</p>
          </div>
        </header>
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard administrativo</h1>
          <p>Resumen operativo de solicitudes, estudios y resultados clinicos</p>
        </div>
        <span className="dashboard-pill">Datos en tiempo real</span>
      </header>

      <section className="kpi-grid" aria-label="Indicadores principales">
        <KpiCard
          label="Solicitudes activas"
          value={metricas.solicitudesActivas}
          detail={`${metricas.totalSolicitudes} solicitudes totales`}
          tone="blue"
        />
        <KpiCard
          label="Resultados emitidos"
          value={metricas.resultadosTotal}
          detail="Reportes clinicos registrados"
          tone="green"
        />
        <KpiCard
          label="Pacientes registrados"
          value={metricas.pacientesTotal}
          detail="Mascotas en expediente"
          tone="cyan"
        />
        <KpiCard
          label="Ingreso potencial"
          value={formatMoney(metricas.ingresosEstimados)}
          detail={`${formatMoney(metricas.ingresosFinalizados)} finalizado`}
          tone="amber"
        />
      </section>

      <section className="dashboard-grid">
        <ChartCard title="Solicitudes por estado" subtitle="Distribucion del flujo de muestras">
          <EChart option={estadosOption} height={330} />
        </ChartCard>

        <ChartCard title="Estudios mas solicitados" subtitle="Demanda acumulada por catalogo">
          {metricas.topEstudios.length > 0
            ? <EChart option={estudiosOption} height={330} />
            : <div className="dashboard-empty">Aun no hay estudios solicitados.</div>}
        </ChartCard>

        <ChartCard title="Tendencia mensual" subtitle="Solicitudes creadas en los ultimos seis meses">
          <EChart option={tendenciaOption} height={300} />
        </ChartCard>

        <ChartCard title="Ingreso por estudio" subtitle="Estimado segun estudios seleccionados">
          {metricas.ingresosPorEstudio.length > 0
            ? <EChart option={ingresosOption} height={300} />
            : <div className="dashboard-empty">Aun no hay importes acumulados.</div>}
        </ChartCard>
      </section>

      <section className="dashboard-bottom-grid">
        <ChartCard title="Carga por veterinario" subtitle="Resultados clinicos capturados">
          {metricas.veterinarios.length > 0 ? (
            <div className="vet-list">
              {metricas.veterinarios.map((vet) => (
                <div className="vet-row" key={vet.nombre}>
                  <span>{vet.nombre}</span>
                  <strong>{vet.total}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">Aun no hay resultados asignados.</div>
          )}
        </ChartCard>

        <ChartCard title="Solicitudes recientes" subtitle="Ultimos movimientos del laboratorio">
          {metricas.recientes.length > 0 ? (
            <div className="recent-list">
              {metricas.recientes.map((solicitud) => (
                <article className="recent-item" key={solicitud.id_solicitud}>
                  <div>
                    <strong>#{String(solicitud.id_solicitud).padStart(3, '0')}</strong>
                    <span>{solicitud.paciente_nombre || 'Paciente sin nombre'}</span>
                  </div>
                  <div>
                    <span className={`recent-status status-${solicitud.estado}`}>
                      {ESTADO_LABELS[solicitud.estado] || solicitud.estado}
                    </span>
                    <small>{formatDate(solicitud.fecha_solicitud)} · {formatMoney(solicitud.total)}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="dashboard-empty">Aun no hay solicitudes registradas.</div>
          )}
        </ChartCard>
      </section>
    </div>
  );
};

export default Dashboard;
