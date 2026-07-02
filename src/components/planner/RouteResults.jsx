import React from 'react';
import './RouteResults.css';

const RouteResults = ({ routes, selectedRoute, onSelectRoute }) => {
  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <div className="route-results">
      <h4 className="results-title">
        🎯 {routes.length} alternativas encontradas
      </h4>

      <div className="results-list">
        {routes.map((route, index) => (
          <div
            key={index}
            className={`result-item ${selectedRoute === route ? 'selected' : ''}`}
            onClick={() => onSelectRoute(route)}
          >
            <div className="result-header">
              <span className="result-number">#{index + 1}</span>
              <span className="result-time">⏱️ {route.tiempo_total_minutos} min</span>
            </div>

            <div className="result-details">
              <span className="result-distance">
                📏 {route.distancia_total_metros || 0} m
              </span>
              <span className="result-transfers">
                🔄 {route.numero_transbordos || 0} transbordos
              </span>
            </div>

            <div className="result-lines">
              {route.lineas_utilizadas?.map((linea, i) => (
                <span key={i} className="line-tag">
                  {linea}
                </span>
              ))}
            </div>

            <div className="result-preview">
              {route.pasos?.slice(0, 3).map((paso, i) => (
                <div key={i} className="step-preview">
                  <span className="step-icon">
                    {paso.es_transferencia ? '🔄' : '🚌'}
                  </span>
                  <span className="step-text">
                    {paso.descripcion}
                    {paso.nombre_linea && ` (${paso.nombre_linea})`}
                  </span>
                </div>
              ))}
              {route.pasos?.length > 3 && (
                <div className="step-more">+{route.pasos.length - 3} pasos más</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteResults;