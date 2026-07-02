import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LineSearch from '../components/lines/LineSearch';
import LineList from '../components/lines/LineList';
import LineRouteViewer from '../components/lines/LineRouteViewer';
import MicroRutaMap from '../components/map/MicroRutaMap';
import { getLines, getLineById } from '../api/endpoints';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './LinesPage.css';

const LinesPage = () => {
  const { id } = useParams();
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapCenter, setMapCenter] = useState([-17.783, -63.182]);

  useEffect(() => {
    loadLines();
  }, []);

  useEffect(() => {
    if (id) {
      loadLineDetail(id);
    }
  }, [id]);

  const loadLines = async () => {
    try {
      setLoading(true);
      const data = await getLines();
      setLines(data);
    } catch (err) {
      setError('Error al cargar las líneas');
    } finally {
      setLoading(false);
    }
  };

  const loadLineDetail = async (lineId) => {
    try {
      setLoading(true);
      const data = await getLineById(lineId);
      setSelectedLine(data);
      // Centrar el mapa en la línea
      if (data.rutas && data.rutas.length > 0 && data.rutas[0].puntos) {
        const puntos = data.rutas[0].puntos;
        const midIdx = Math.floor(puntos.length / 2);
        if (puntos[midIdx]) {
          setMapCenter([puntos[midIdx].latitud, puntos[midIdx].longitud]);
        }
      }
    } catch (err) {
      setError('Error al cargar el detalle de la línea');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLine = (line) => {
    loadLineDetail(line.id);
  };

  const filteredLines = lines.filter(line =>
    line.nombre_linea.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Preparar rutas para el mapa
  const getMapRoutes = () => {
    if (!selectedLine || !selectedLine.rutas) {
      return [];
    }

    return selectedLine.rutas.map(ruta => ({
      id: ruta.id,
      name: `${selectedLine.nombre_linea} - ${ruta.tipo_ruta}`,
      description: `Distancia: ${ruta.distancia_total} km | Tiempo: ${ruta.tiempo_total_minutos} min`,
      color: selectedLine.color_linea || '#2ecc71',
      points: ruta.puntos.map(p => ({
        lat: p.latitud,
        lon: p.longitud,
        stop: p.stop,
        descripcion: p.descripcion,
        type: p.orden === 0 ? 'start' : p.orden === ruta.puntos.length - 1 ? 'end' : null
      })),
      weight: 4,
      opacity: 0.8,
      showPoints: true,
      popup: true
    }));
  };

  // Preparar paradas para el mapa
  const getMapStops = () => {
    if (!selectedLine || !selectedLine.rutas) {
      return [];
    }

    const stopsMap = new Map();
    selectedLine.rutas.forEach(ruta => {
      ruta.puntos.forEach(p => {
        if (p.stop && !stopsMap.has(p.punto_id)) {
          stopsMap.set(p.punto_id, {
            id: p.punto_id,
            latitud: p.latitud,
            longitud: p.longitud,
            descripcion: p.descripcion,
            lineas: [selectedLine.nombre_linea]
          });
        }
      });
    });

    return Array.from(stopsMap.values());
  };

  if (loading && !selectedLine) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadLines} />;

  return (
    <div className="lines-page">
      <h1 className="page-title">
        Líneas de Microbús
        <span className="subtitle">Explora todas las líneas disponibles</span>
      </h1>

      <div className="lines-container">
        <div className="lines-sidebar">
          <LineSearch
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => {}}
          />
          <LineList
            lines={filteredLines}
            selectedId={selectedLine?.id}
            onSelectLine={handleSelectLine}
            loading={loading}
          />
        </div>

        <div className="lines-content">
          {selectedLine ? (
            <div className="line-detail-container">
              <div className="line-detail-header">
                <div
                  className="line-color-badge"
                  style={{ backgroundColor: selectedLine.color_linea || '#2ecc71' }}
                />
                <h2>{selectedLine.nombre_linea}</h2>
                <button
                  className="close-detail-btn"
                  onClick={() => setSelectedLine(null)}
                >
                  ✕
                </button>
              </div>

              <div className="line-detail-map">
                <MicroRutaMap
                  center={mapCenter}
                  zoom={14}
                  height="300px"
                  routes={getMapRoutes()}
                  stops={getMapStops()}
                  showStops={true}
                  showLines={true}
                  showRoutePoints={true}
                />
              </div>

              <div className="line-detail-info">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Rutas</span>
                    <span className="info-value">
                      {selectedLine.rutas?.length || 0}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Paradas</span>
                    <span className="info-value">
                      {getMapStops().length}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Distancia total</span>
                    <span className="info-value">
                      {selectedLine.rutas?.reduce((sum, r) => 
                        sum + (r.distancia_total || 0), 0
                      ).toFixed(2)} km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>Selecciona una línea</h3>
              <p>Elige una línea de la lista para ver su recorrido en el mapa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LinesPage;