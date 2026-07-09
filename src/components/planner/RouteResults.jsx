import './RouteResults.css';

const getSteps = (route) => route?.pasos || route?.informacion_detallada || [];

const getDistanceMeters = (pointA, pointB) => {
  const earthRadius = 6371000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const lat1 = toRadians(pointA.latitud);
  const lat2 = toRadians(pointB.latitud);
  const deltaLat = toRadians(pointB.latitud - pointA.latitud);
  const deltaLon = toRadians(pointB.longitud - pointA.longitud);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getRouteDistanceMeters = (steps) => {
  if (!steps || steps.length < 2) return 0;

  return steps.reduce((total, step, index) => {
    if (index === 0) return total;
    return total + getDistanceMeters(steps[index - 1], step);
  }, 0);
};

const formatDistance = (meters) => {
  if (!meters) return '0 m';
  if (meters >= 1000) return `${(meters / 1000).toFixed(2)} km`;
  return `${Math.round(meters)} m`;
};

const RouteResults = ({ routes, selectedRoute, onSelectRoute }) => {
  if (!routes || routes.length === 0) {
    return null;
  }

  return (
    <div className="route-results">
      <h4 className="results-title">
        4. Ruta recomendada
      </h4>

      <div className="results-list">
        {routes.map((route, index) => {
          const steps = getSteps(route);
          const transfers = steps.filter((step) => step.es_transferencia);
          const isSelected = selectedRoute === route;
          const distanceMeters = route.distancia_total_metros || getRouteDistanceMeters(steps);

          return (
            <div
              key={route.plan || index}
              className={`result-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectRoute(route)}
            >
              <div className="result-header">
                <span className="result-number">
                  {index === 0 ? 'Recomendada' : `Alternativa ${index + 1}`}
                </span>
                <span className="result-time">{route.tiempo_total_minutos} min</span>
              </div>

              <div className="result-details">
                <span>{formatDistance(distanceMeters)}</span>
                <span>{route.numero_transbordos || 0} transbordos</span>
                <span>{steps.length} pasos</span>
              </div>

              <div className="result-lines">
                {route.lineas_utilizadas?.map((linea, i) => (
                  <span key={`${linea}-${i}`} className="line-tag">
                    {linea}
                  </span>
                ))}
              </div>

              <div className="trip-info">
                <h5>5. Informacion del viaje</h5>
                <div className="trip-summary">
                  <div>
                    <strong>Tiempo total</strong>
                    <span>{route.tiempo_total_minutos} min</span>
                  </div>
                  <div>
                    <strong>Distancia aproximada</strong>
                    <span>{formatDistance(distanceMeters)}</span>
                  </div>
                  <div>
                    <strong>Transbordos</strong>
                    <span>{route.numero_transbordos || 0}</span>
                  </div>
                </div>
                <div className="trip-steps">
                  {steps.map((step, i) => (
                    <div key={`${step.punto_id}-${i}`} className="step-preview">
                      <span className="step-icon">{step.es_transferencia ? 'T' : i + 1}</span>
                      <span className="step-text">
                        {step.descripcion}
                        {step.nombre_linea && ` - ${step.nombre_linea}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="transfer-info">
                <h5>6. Transbordos</h5>
                {transfers.length === 0 ? (
                  <p>Viaje directo, sin transbordos.</p>
                ) : (
                  transfers.map((transfer, i) => (
                    <p key={`${transfer.punto_id}-transfer-${i}`}>
                      Transbordo en {transfer.descripcion} hacia {transfer.nombre_linea || 'otra linea'}.
                    </p>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RouteResults;
