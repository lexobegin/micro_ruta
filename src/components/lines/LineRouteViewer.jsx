import React, { useState } from 'react';
import MicroRutaMap from '../map/MicroRutaMap';
import './LineRouteViewer.css';

const LineRouteViewer = ({ line, onClose }) => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = line.rutas || [];
  const routeTypes = ['Salida', 'Retorno'];

  const getRoutePoints = (ruta) => {
    return ruta.puntos.map(p => ({
      lat: p.latitud,
      lon: p.longitud,
      stop: p.stop,
      descripcion: p.descripcion
    }));
  };

  const getRouteColor = () => {
    return line.color_linea || '#3498db';
  };

  const mapRoutes = selectedRoute
    ? [{
        points: getRoutePoints(selectedRoute),
        color: getRouteColor(),
        name: `${line.nombre_linea} - ${selectedRoute.tipo_ruta}`,
        description: `Distancia: ${selectedRoute.distancia_total} km | Tiempo: ${selectedRoute.tiempo_total_minutos} min`
      }]
    : routes.map(r => ({
        points: getRoutePoints(r),
        color: getRouteColor(),
        name: `${line.nombre_linea} - ${r.tipo_ruta}`,
        description: `Distancia: ${r.distancia_total} km | Tiempo: ${r.tiempo_total_minutos} min`
      }));

  const stops = [];
  routes.forEach(r => {
    r.puntos.forEach(p => {
      if (p.stop && !stops.find(s => s.id === p.punto_id)) {
        stops.push({
          id: p.punto_id,
          latitud: p.latitud,
          longitud: p.longitud,
          descripcion: p.descripcion
        });
      }
    });
  });

  const handleRouteSelect = (type) => {
    const route = routes.find(r => r.tipo_ruta === type);
    setSelectedRoute(route || null);
  };

  return (
    <div className="line-route-viewer">
      <div className="viewer-header">
        <div className="viewer-title">
          <div
            className="line-color"
            style={{ backgroundColor: line.color_linea || '#3498db' }}
          />
          <h2>{line.nombre_linea}</h2>
        </div>
        <div className="viewer-actions">
          <div className="route-selector">
            <button
              className={`route-btn ${!selectedRoute ? 'active' : ''}`}
              onClick={() => setSelectedRoute(null)}
            >
              Ambas
            </button>
            {routeTypes.map(type => (
              <button
                key={type}
                className={`route-btn ${selectedRoute?.tipo_ruta === type ? 'active' : ''}`}
                onClick={() => handleRouteSelect(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="viewer-map">
        <MicroRutaMap
          center={[-17.783, -63.182]}
          zoom={13}
          height="400px"
          routes={mapRoutes}
          stops={stops}
        />
      </div>

      <div className="viewer-info">
        <div className="info-stats">
          <div className="stat">
            <span className="stat-label">Distancia total</span>
            <span className="stat-value">
              {selectedRoute?.distancia_total || 
               (routes[0]?.distancia_total + routes[1]?.distancia_total) || 'N/A'} km
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Tiempo estimado</span>
            <span className="stat-value">
              {selectedRoute?.tiempo_total_minutos || 
               (routes[0]?.tiempo_total_minutos + routes[1]?.tiempo_total_minutos) || 'N/A'} min
            </span>
          </div>
          <div className="stat">
            <span className="stat-label">Paradas</span>
            <span className="stat-value">{stops.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LineRouteViewer;