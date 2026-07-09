import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import MicroRutaMap from '../components/map/MicroRutaMap';
import { getLineById, getLines } from '../api/endpoints';

const exampleLine = {
  id: 18,
  nombre_linea: 'Linea 18',
  color_linea: '#21a957',
  rutas: [
    {
      id: 'demo-18',
      tipo_ruta: 'Troncal',
      distancia_total: 28.4,
      tiempo_total_minutos: 75,
      puntos: [
        { punto_id: 1, orden: 1, descripcion: 'Virgen de Cotoca', latitud: -17.809, longitud: -63.203, stop: true },
        { punto_id: 2, orden: 2, descripcion: 'Av. Virgen de Cotoca y 4to Anillo', latitud: -17.795, longitud: -63.188, stop: true },
        { punto_id: 3, orden: 3, descripcion: 'Av. Virgen de Cotoca y Canal Isuto', latitud: -17.779, longitud: -63.169, stop: true },
        { punto_id: 4, orden: 4, descripcion: 'Av. Virgen de Cotoca y Av. Roca y Coronado', latitud: -17.760, longitud: -63.151, stop: true },
        { punto_id: 5, orden: 5, descripcion: 'Av. Roca y Coronado y 3er Anillo', latitud: -17.742, longitud: -63.130, stop: true },
      ],
    },
  ],
};

const pageStyles = `
  .figure-route-page {
    min-height: calc(100vh - 60px);
    color: #172033;
  }

  .figure-route-title {
    margin: 0;
    font-size: 26px;
    font-weight: 750;
    letter-spacing: -0.02em;
  }

  .figure-route-subtitle {
    margin: 6px 0 18px;
    color: #657184;
    font-size: 13px;
  }

  .figure-route-layout {
    display: grid;
    grid-template-columns: 330px minmax(0, 1fr);
    gap: 20px;
    min-height: 470px;
  }

  .figure-route-picker {
    display: grid;
    grid-template-columns: minmax(220px, 360px) minmax(220px, 1fr);
    gap: 12px;
    align-items: end;
    margin-bottom: 18px;
    padding: 16px;
    background: #fff;
    border: 1px solid rgba(15, 39, 64, 0.06);
    border-radius: 8px;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  .figure-route-field {
    display: grid;
    gap: 7px;
  }

  .figure-route-field label {
    color: #526071;
    font-size: 12px;
    font-weight: 700;
  }

  .figure-route-field input,
  .figure-route-field select {
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

  .figure-route-field input:focus,
  .figure-route-field select:focus {
    border-color: #2587e8;
    box-shadow: 0 0 0 3px rgba(37, 135, 232, 0.14);
  }

  .figure-route-sidebar {
    display: grid;
    align-content: start;
    gap: 14px;
  }

  .figure-route-card {
    background: #fff;
    border: 1px solid rgba(15, 39, 64, 0.06);
    border-radius: 8px;
    padding: 18px;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  .figure-route-card h3 {
    margin: 0 0 14px;
    font-size: 15px;
    color: #14243a;
  }

  .figure-route-info-row {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    padding: 8px 0;
    border-bottom: 1px solid #eef2f6;
    font-size: 12px;
  }

  .figure-route-info-row:last-child {
    border-bottom: 0;
  }

  .figure-route-label {
    color: #526071;
  }

  .figure-route-value {
    color: #172033;
    font-weight: 700;
    text-align: right;
  }

  .figure-route-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 999px;
    background: #22b85f;
    color: #fff;
    font-size: 11px;
    font-weight: 800;
  }

  .figure-route-stops {
    display: grid;
    gap: 10px;
    max-height: 235px;
    overflow-y: auto;
    padding-right: 4px;
  }

  .figure-route-stop {
    display: grid;
    grid-template-columns: 22px 1fr;
    gap: 9px;
    align-items: start;
    color: #29384d;
    font-size: 12px;
  }

  .figure-route-stop-number {
    width: 18px;
    height: 18px;
    display: inline-grid;
    place-items: center;
    border-radius: 6px;
    background: #28a745;
    color: #fff;
    font-size: 10px;
    font-weight: 800;
  }

  .figure-route-map {
    min-height: 470px;
    overflow: hidden;
    border-radius: 9px;
    background: #fff;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  .figure-route-state {
    margin-bottom: 12px;
    padding: 12px 14px;
    background: #fff;
    border-radius: 8px;
    color: #657184;
    box-shadow: 0 8px 22px rgba(27, 44, 64, 0.08);
  }

  @media (max-width: 900px) {
    .figure-route-picker {
      grid-template-columns: 1fr;
    }

    .figure-route-layout {
      grid-template-columns: 1fr;
    }

    .figure-route-map {
      min-height: 380px;
    }
  }
`;

const getRoutePoints = (route) =>
  (route?.puntos || []).map((point, index, points) => ({
    lat: point.latitud,
    lon: point.longitud,
    stop: point.stop,
    descripcion: point.descripcion,
    type: index === 0 ? 'start' : index === points.length - 1 ? 'end' : null,
  }));

function Figura3RecorridoLinea() {
  const { id } = useParams();
  const [lines, setLines] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState(id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [line, setLine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingLines, setLoadingLines] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadAvailableLines = async () => {
      try {
        setLoadingLines(true);
        setError(null);
        const data = await getLines({ limit: 1000 });
        if (cancelled) return;

        setLines(data);

        const initialLineId = id || data[0]?.id;
        if (initialLineId) setSelectedLineId(String(initialLineId));
      } catch (err) {
        if (!cancelled) {
          setLines([]);
          setLine(exampleLine);
          setSelectedLineId(String(exampleLine.id));
          setError('No se pudo cargar la lista real de lineas. Verifica que el backend este funcionando.');
        }
      } finally {
        if (!cancelled) setLoadingLines(false);
      }
    };

    loadAvailableLines();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!selectedLineId) return;

    let cancelled = false;

    const loadLineDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getLineById(selectedLineId, true);
        if (!cancelled) setLine(data);
      } catch (err) {
        if (!cancelled) {
          setLine(null);
          setError('No se pudo cargar el recorrido real de la linea seleccionada.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadLineDetail();

    return () => {
      cancelled = true;
    };
  }, [selectedLineId]);

  const filteredLines = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return lines;

    return lines.filter((item) =>
      String(item.nombre_linea || '').toLowerCase().includes(normalizedSearch)
    );
  }, [lines, searchTerm]);

  const route = line?.rutas?.[0];
  const stops = useMemo(() => (route?.puntos || []).filter((point) => point.stop), [route]);
  const firstPoint = route?.puntos?.[0];
  const lastPoint = route?.puntos?.[route.puntos.length - 1];
  const centerPoint = route?.puntos?.[Math.floor((route?.puntos?.length || 1) / 2)];

  const mapRoutes = route
    ? [
        {
          id: route.id,
          name: `${line.nombre_linea} - ${route.tipo_ruta || 'Recorrido'}`,
          description: `Distancia: ${route.distancia_total || 0} km | Tiempo: ${route.tiempo_total_minutos || 0} min`,
          color: line.color_linea || '#28a745',
          points: getRoutePoints(route),
          weight: 5,
          opacity: 0.9,
          showPoints: false,
          popup: true,
        },
      ]
    : [];

  return (
    <section className="figure-route-page">
      <style>{pageStyles}</style>

      <h1 className="figure-route-title">Recorrido de {line?.nombre_linea || 'Linea'}</h1>
      <p className="figure-route-subtitle">
        Selecciona una linea real para ver su recorrido cargado desde la base de datos
      </p>

      <div className="figure-route-picker">
        <div className="figure-route-field">
          <label htmlFor="figure-route-search">Buscar linea</label>
          <input
            id="figure-route-search"
            type="text"
            placeholder="Ejemplo: 18, 72, Cotoca..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="figure-route-field">
          <label htmlFor="figure-route-select">Linea a visualizar</label>
          <select
            id="figure-route-select"
            value={selectedLineId}
            onChange={(event) => setSelectedLineId(event.target.value)}
            disabled={loadingLines || filteredLines.length === 0}
          >
            {filteredLines.length === 0 && <option value="">No hay lineas disponibles</option>}
            {filteredLines.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre_linea}
              </option>
            ))}
          </select>
        </div>
      </div>

      {firstPoint && lastPoint && (
        <p className="figure-route-subtitle">
          {firstPoint.descripcion || 'Origen'} - {lastPoint.descripcion || 'Destino'}
        </p>
      )}
      {loadingLines && <div className="figure-route-state">Cargando lineas reales...</div>}
      {loading && <div className="figure-route-state">Cargando recorrido...</div>}
      {error && <div className="figure-route-state">{error}</div>}

      <div className="figure-route-layout">
        <aside className="figure-route-sidebar">
          <article className="figure-route-card">
            <h3>Informacion</h3>
            <div className="figure-route-info-row">
              <span className="figure-route-label">Tipo</span>
              <span className="figure-route-chip">{route?.tipo_ruta || 'Troncal'}</span>
            </div>
            <div className="figure-route-info-row">
              <span className="figure-route-label">Distancia aprox.</span>
              <span className="figure-route-value">{Number(route?.distancia_total || 0).toFixed(1)} km</span>
            </div>
            <div className="figure-route-info-row">
              <span className="figure-route-label">Tiempo estimado</span>
              <span className="figure-route-value">{route?.tiempo_total_minutos || 0} min</span>
            </div>
            <div className="figure-route-info-row">
              <span className="figure-route-label">Paradas</span>
              <span className="figure-route-value">{stops.length}</span>
            </div>
          </article>

          <article className="figure-route-card">
            <h3>Paradas del recorrido</h3>
            <div className="figure-route-stops">
              {stops.map((stop, index) => (
                <div className="figure-route-stop" key={`${stop.punto_id || index}-${index}`}>
                  <span className="figure-route-stop-number">{index + 1}</span>
                  <span>{stop.descripcion || `Parada ${stop.punto_id}`}</span>
                </div>
              ))}
            </div>
          </article>
        </aside>

        <div className="figure-route-map">
          <MicroRutaMap
            center={centerPoint ? [centerPoint.latitud, centerPoint.longitud] : [-17.783, -63.182]}
            zoom={13}
            height="100%"
            routes={mapRoutes}
            stops={[]}
            showStops={false}
            showLines={true}
            showRoutePoints={false}
          />
        </div>
      </div>
    </section>
  );
}

export default Figura3RecorridoLinea;
