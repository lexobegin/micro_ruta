import { useEffect, useMemo, useState } from 'react';
import MicroRutaMap from '../components/map/MicroRutaMap';
import { getLineById, getLines } from '../api/endpoints';

const exampleRoutes = [
  {
    id: 'troncal-demo',
    nombre_linea: 'Troncal Centro',
    tipo: 'troncales',
    color_linea: '#e74c3c',
    puntos: [
      { latitud: -17.805, longitud: -63.205, descripcion: 'Radial Oeste', stop: true },
      { latitud: -17.79, longitud: -63.188, descripcion: 'Centro', stop: true },
      { latitud: -17.77, longitud: -63.17, descripcion: 'Norte interno', stop: true },
      { latitud: -17.752, longitud: -63.142, descripcion: 'Parque Industrial', stop: true },
    ],
  },
  {
    id: 'alimentadora-demo',
    nombre_linea: 'Alimentadora Norte',
    tipo: 'alimentadoras',
    color_linea: '#2e86de',
    puntos: [
      { latitud: -17.83, longitud: -63.202, descripcion: 'El Bajio', stop: true },
      { latitud: -17.8, longitud: -63.188, descripcion: 'Segundo Anillo', stop: true },
      { latitud: -17.76, longitud: -63.184, descripcion: 'Norte', stop: true },
      { latitud: -17.724, longitud: -63.176, descripcion: 'Los Lotes', stop: true },
    ],
  },
  {
    id: 'expresa-demo',
    nombre_linea: 'Expresa Este',
    tipo: 'expresas',
    color_linea: '#27ae60',
    puntos: [
      { latitud: -17.82, longitud: -63.155, descripcion: 'Aeropuerto', stop: true },
      { latitud: -17.79, longitud: -63.146, descripcion: 'Centro', stop: true },
      { latitud: -17.76, longitud: -63.128, descripcion: 'Villa 1ro de Mayo', stop: true },
      { latitud: -17.735, longitud: -63.105, descripcion: 'Este', stop: true },
    ],
  },
  {
    id: 'otra-demo',
    nombre_linea: 'Circular Sur',
    tipo: 'otras',
    color_linea: '#f39c12',
    puntos: [
      { latitud: -17.842, longitud: -63.22, descripcion: 'Sur Oeste', stop: true },
      { latitud: -17.826, longitud: -63.182, descripcion: 'El Pari', stop: true },
      { latitud: -17.806, longitud: -63.145, descripcion: 'Villa Olimpica', stop: true },
      { latitud: -17.786, longitud: -63.112, descripcion: 'Sur Este', stop: true },
    ],
  },
];

const pageStyles = `
  .figure-map-page {
    min-height: calc(100vh - 60px);
    color: #172033;
  }

  .figure-map-title {
    margin: 0;
    font-size: 27px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .figure-map-subtitle {
    margin: 8px 0 18px;
    color: #657184;
    font-size: 13px;
  }

  .figure-map-layout {
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr);
    gap: 22px;
    min-height: 570px;
  }

  .figure-map-sidebar {
    display: grid;
    align-content: start;
    gap: 18px;
  }

  .figure-map-card {
    background: #fff;
    border: 1px solid rgba(15, 39, 64, 0.06);
    border-radius: 8px;
    padding: 18px;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  .figure-map-card h3 {
    margin: 0 0 17px;
    font-size: 15px;
    color: #14243a;
  }

  .figure-map-checks,
  .figure-map-legend {
    display: grid;
    gap: 12px;
  }

  .figure-map-field {
    display: grid;
    gap: 8px;
  }

  .figure-map-field + .figure-map-field {
    margin-top: 12px;
  }

  .figure-map-field label {
    color: #526071;
    font-size: 12px;
    font-weight: 700;
  }

  .figure-map-field input,
  .figure-map-field select {
    width: 100%;
    min-height: 40px;
    border: 1px solid #d9e2ec;
    border-radius: 7px;
    padding: 0 12px;
    background: #fff;
    color: #172033;
    font-size: 14px;
    outline: none;
  }

  .figure-map-field input:focus,
  .figure-map-field select:focus {
    border-color: #2587e8;
    box-shadow: 0 0 0 3px rgba(37, 135, 232, 0.14);
  }

  .figure-map-count {
    margin-top: 12px;
    color: #657184;
    font-size: 12px;
  }

  .figure-map-check {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #26364b;
    font-size: 13px;
    cursor: pointer;
    user-select: none;
  }

  .figure-map-check input {
    width: 16px;
    height: 16px;
    accent-color: #1c8deb;
  }

  .figure-map-legend-item {
    display: grid;
    grid-template-columns: 28px 1fr;
    align-items: center;
    gap: 10px;
    color: #26364b;
    font-size: 13px;
  }

  .figure-map-line {
    width: 28px;
    height: 4px;
    border-radius: 999px;
  }

  .figure-map-dot {
    width: 14px;
    height: 14px;
    justify-self: center;
    border: 3px solid #2e86de;
    border-radius: 999px;
    background: #fff;
  }

  .figure-map-transfer {
    width: 16px;
    height: 16px;
    justify-self: center;
    border: 3px double #6c7a89;
    border-radius: 999px;
    background: #edf2f7;
  }

  .figure-map-container {
    overflow: hidden;
    border-radius: 10px;
    background: #fff;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  .figure-map-state {
    margin-bottom: 12px;
    padding: 12px 14px;
    background: #fff;
    border-radius: 8px;
    color: #657184;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  @media (max-width: 900px) {
    .figure-map-layout {
      grid-template-columns: 1fr;
      min-height: auto;
    }

    .figure-map-container {
      min-height: 420px;
    }
  }
`;

const layerOptions = [
  { key: 'all', label: 'Todas las rutas' },
  { key: 'troncales', label: 'Troncales' },
  { key: 'alimentadoras', label: 'Alimentadoras' },
  { key: 'paradas', label: 'Paradas' },
  { key: 'transbordos', label: 'Transbordos' },
];

const legendItems = [
  { label: 'Troncales', color: '#e74c3c' },
  { label: 'Alimentadoras', color: '#2e86de' },
  { label: 'Expresas', color: '#27ae60' },
  { label: 'Otras', color: '#f39c12' },
];

const classifyLine = (line, index) => {
  const name = String(line.nombre_linea || '').toLowerCase();
  if (name.includes('troncal')) return 'troncales';
  if (name.includes('aliment')) return 'alimentadoras';
  if (name.includes('expres')) return 'expresas';
  return ['troncales', 'alimentadoras', 'expresas', 'otras'][index % 4];
};

const getTypeColor = (type, fallback) => {
  if (type === 'troncales') return '#e74c3c';
  if (type === 'alimentadoras') return '#2e86de';
  if (type === 'expresas') return '#27ae60';
  return fallback || '#f39c12';
};

const normalizeRoutes = (lines) =>
  lines.flatMap((line, lineIndex) => {
    const type = classifyLine(line, lineIndex);
    return (line.rutas || []).map((route) => ({
      id: `${line.id}-${route.id}`,
      linea_id: line.id,
      nombre_linea: line.nombre_linea,
      tipo: type,
      color_linea: getTypeColor(type, line.color_linea),
      puntos: route.puntos || [],
    }));
  });

function Figura4MapaRutas() {
  const [selectedLineId, setSelectedLineId] = useState('all');
  const [lineSearch, setLineSearch] = useState('');
  const [filters, setFilters] = useState({
    all: true,
    troncales: true,
    alimentadoras: true,
    paradas: true,
    transbordos: true,
  });
  const [routes, setRoutes] = useState(exampleRoutes);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadRoutes = async () => {
      try {
        setLoading(true);
        setError(null);
        const lines = await getLines({ limit: 1000 });
        const details = await Promise.all(lines.map((line) => getLineById(line.id, true)));
        const normalized = normalizeRoutes(details).filter((route) => route.puntos.length > 0);
        if (!cancelled) setRoutes(normalized.length ? normalized : exampleRoutes);
      } catch (err) {
        if (!cancelled) {
          setRoutes(exampleRoutes);
          setError('No se pudieron cargar rutas reales. Se muestra una vista de ejemplo.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRoutes();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleFilter = (key) => {
    setFilters((current) => {
      if (key === 'all') {
        const nextValue = !current.all;
        return {
          all: nextValue,
          troncales: nextValue,
          alimentadoras: nextValue,
          paradas: nextValue,
          transbordos: nextValue,
        };
      }

      const next = { ...current, [key]: !current[key] };
      next.all = next.troncales && next.alimentadoras && next.paradas && next.transbordos;
      return next;
    });
  };

  const lineOptions = useMemo(() => {
    const optionsMap = new Map();

    routes.forEach((route) => {
      const id = route.linea_id ?? route.id;
      if (!optionsMap.has(id)) {
        optionsMap.set(id, {
          id: String(id),
          nombre_linea: route.nombre_linea,
        });
      }
    });

    return Array.from(optionsMap.values()).sort((a, b) =>
      String(a.nombre_linea).localeCompare(String(b.nombre_linea), 'es', { numeric: true })
    );
  }, [routes]);

  const filteredLineOptions = useMemo(() => {
    const normalizedSearch = lineSearch.trim().toLowerCase();
    if (!normalizedSearch) return lineOptions;

    return lineOptions.filter((line) =>
      String(line.nombre_linea || '').toLowerCase().includes(normalizedSearch)
    );
  }, [lineOptions, lineSearch]);

  const visibleRoutes = useMemo(
    () =>
      routes.filter((route) => {
        if (selectedLineId !== 'all') {
          return String(route.linea_id ?? route.id) === selectedLineId;
        }

        if (route.tipo === 'expresas' || route.tipo === 'otras') return filters.all;
        return filters[route.tipo];
      }),
    [filters, routes, selectedLineId]
  );

  const mapRoutes = visibleRoutes.map((route) => ({
    id: route.id,
    name: route.nombre_linea,
    description: route.tipo,
    color: route.color_linea,
    points: route.puntos.map((point) => ({
      lat: point.latitud,
      lon: point.longitud,
      stop: Boolean(point.stop),
      descripcion: point.descripcion,
    })),
    weight: 4,
    opacity: 0.82,
    showPoints: filters.paradas,
    popup: true,
  }));

  const stopMap = new Map();
  visibleRoutes.forEach((route) => {
    route.puntos.forEach((point, index) => {
      if (!point.stop) return;
      const key = `${point.latitud}-${point.longitud}-${point.descripcion || index}`;
      if (!stopMap.has(key)) {
        stopMap.set(key, {
          id: key,
          latitud: point.latitud,
          longitud: point.longitud,
          descripcion: point.descripcion || 'Parada',
          lineas: [route.nombre_linea],
        });
      }
    });
  });

  const stops = filters.paradas ? Array.from(stopMap.values()) : [];
  const transferPoints = filters.transbordos
    ? stops.slice(0, 8).map((stop) => ({
        lat: stop.latitud,
        lon: stop.longitud,
        descripcion: stop.descripcion,
        linea_origen: stop.lineas?.[0],
        linea_destino: 'Conexion',
      }))
    : [];

  return (
    <section className="figure-map-page">
      <style>{pageStyles}</style>

      <h1 className="figure-map-title">Mapa de Rutas</h1>
      <p className="figure-map-subtitle">Visualiza todas las rutas de microbuses en el mapa</p>

      {loading && <div className="figure-map-state">Cargando rutas...</div>}
      {error && <div className="figure-map-state">{error}</div>}

      <div className="figure-map-layout">
        <aside className="figure-map-sidebar">
          <article className="figure-map-card">
            <h3>Linea</h3>
            <div className="figure-map-field">
              <label htmlFor="figure-map-line-search">Buscar linea</label>
              <input
                id="figure-map-line-search"
                type="text"
                placeholder="Ejemplo: 18, 72, Cotoca..."
                value={lineSearch}
                onChange={(event) => setLineSearch(event.target.value)}
              />
            </div>
            <div className="figure-map-field">
              <label htmlFor="figure-map-line-select">Ver ruta de</label>
              <select
                id="figure-map-line-select"
                value={selectedLineId}
                onChange={(event) => setSelectedLineId(event.target.value)}
              >
                <option value="all">Todas las lineas</option>
                {filteredLineOptions.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.nombre_linea}
                  </option>
                ))}
              </select>
            </div>
            <div className="figure-map-count">
              {visibleRoutes.length} recorrido{visibleRoutes.length === 1 ? '' : 's'} visible{visibleRoutes.length === 1 ? '' : 's'}
            </div>
          </article>

          <article className="figure-map-card">
            <h3>Capas</h3>
            <div className="figure-map-checks">
              {layerOptions.map((option) => (
                <label className="figure-map-check" key={option.key}>
                  <input
                    type="checkbox"
                    checked={filters[option.key]}
                    onChange={() => toggleFilter(option.key)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </article>

          <article className="figure-map-card">
            <h3>Leyenda</h3>
            <div className="figure-map-legend">
              {legendItems.map((item) => (
                <div className="figure-map-legend-item" key={item.label}>
                  <span className="figure-map-line" style={{ background: item.color }} />
                  <span>{item.label}</span>
                </div>
              ))}
              <div className="figure-map-legend-item">
                <span className="figure-map-dot" />
                <span>Paradas</span>
              </div>
              <div className="figure-map-legend-item">
                <span className="figure-map-transfer" />
                <span>Transbordos</span>
              </div>
            </div>
          </article>
        </aside>

        <div className="figure-map-container">
          <MicroRutaMap
            center={[-17.783, -63.182]}
            zoom={12}
            height="100%"
            routes={mapRoutes}
            stops={stops}
            transferPoints={transferPoints}
            showStops={filters.paradas}
            showLines={true}
            showRoutePoints={filters.paradas}
          />
        </div>
      </div>
    </section>
  );
}

export default Figura4MapaRutas;
