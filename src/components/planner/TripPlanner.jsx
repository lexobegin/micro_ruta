import React, { useState } from 'react';
import './TripPlanner.css';

const TripPlanner = ({
  onPlanTrip,
  onLocationSelect,
  origin,
  destination,
  loading = false
}) => {
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (origin && destination) {
      onPlanTrip(origin.id, destination.id);
    }
  };

  const handleGetLocation = (isOrigin) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSelect(
            position.coords.latitude,
            position.coords.longitude,
            isOrigin
          );
        },
        (error) => {
          console.error('Error al obtener ubicación:', error);
          alert('No se pudo obtener tu ubicación. Por favor, ingresa manualmente.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalización.');
    }
  };

  return (
    <div className="trip-planner">
      <h3 className="planner-title">Planificar viaje</h3>

      <form onSubmit={handleSubmit} className="planner-form">
        <div className="form-group">
          <label>Origen</label>
          <div className="input-with-btn">
            <input
              type="text"
              placeholder="Buscar origen..."
              value={originSearch}
              onChange={(e) => setOriginSearch(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              className="location-btn"
              onClick={() => handleGetLocation(true)}
              title="Usar mi ubicación"
            >
              📍
            </button>
          </div>
          {origin && (
            <div className="selected-location">
              ✅ {origin.descripcion || `Parada ${origin.id}`}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Destino</label>
          <div className="input-with-btn">
            <input
              type="text"
              placeholder="Buscar destino..."
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              className="location-btn"
              onClick={() => handleGetLocation(false)}
              title="Usar mi ubicación"
            >
              📍
            </button>
          </div>
          {destination && (
            <div className="selected-location">
              ✅ {destination.descripcion || `Parada ${destination.id}`}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="plan-btn"
          disabled={!origin || !destination || loading}
        >
          {loading ? 'Calculando...' : 'Planificar viaje'}
        </button>
      </form>

      <div className="planner-tips">
        <div className="tip">
          <span className="tip-icon">💡</span>
          <span>Selecciona origen y destino para planificar tu viaje</span>
        </div>
        <div className="tip">
          <span className="tip-icon">🔄</span>
          <span>El sistema mostrará hasta 5 alternativas de viaje</span>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;