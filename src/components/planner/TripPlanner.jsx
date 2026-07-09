import { useMemo, useState } from 'react';
import './TripPlanner.css';

const filterStops = (stops, search) => {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return [];

  return stops
    .filter((stop) =>
      String(stop.descripcion || `Parada ${stop.id}`).toLowerCase().includes(normalizedSearch)
    )
    .slice(0, 8);
};

const TripPlanner = ({
  onPlanTrip,
  onLocationSelect,
  onSelectStop,
  onSelectionModeChange,
  origin,
  destination,
  selectionMode,
  stops = [],
  loading = false,
}) => {
  const [originSearch, setOriginSearch] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');

  const originResults = useMemo(() => filterStops(stops, originSearch), [stops, originSearch]);
  const destinationResults = useMemo(
    () => filterStops(stops, destinationSearch),
    [stops, destinationSearch]
  );

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
          console.error('Error al obtener ubicacion:', error);
          alert('No se pudo obtener tu ubicacion. Usa el mapa o la busqueda.');
        }
      );
    } else {
      alert('Tu navegador no soporta geolocalizacion.');
    }
  };

  const handleStopSelect = (stop, type) => {
    onSelectStop(stop, type);
    if (type === 'origin') {
      setOriginSearch('');
    } else {
      setDestinationSearch('');
    }
  };

  return (
    <div className="trip-planner">
      <h3 className="planner-title">Planificar viaje</h3>

      <form onSubmit={handleSubmit} className="planner-form">
        <div className="form-group">
          <label>1. Selecciona origen</label>
          <div className="input-with-btn">
            <input
              type="text"
              placeholder="Buscar parada de origen..."
              value={originSearch}
              onChange={(e) => setOriginSearch(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              className="location-btn"
              onClick={() => handleGetLocation(true)}
              title="Usar mi ubicacion"
            >
              GPS
            </button>
          </div>

          {originResults.length > 0 && (
            <div className="stop-results">
              {originResults.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  className="stop-result"
                  onClick={() => handleStopSelect(stop, 'origin')}
                >
                  {stop.descripcion || `Parada ${stop.id}`}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`map-select-btn ${selectionMode === 'origin' ? 'active' : ''}`}
            onClick={() => onSelectionModeChange(selectionMode === 'origin' ? null : 'origin')}
          >
            {selectionMode === 'origin' ? 'Haz click en el mapa para origen' : 'Seleccionar origen en mapa'}
          </button>

          {origin && (
            <div className="selected-location">
              Origen: {origin.descripcion || `Parada ${origin.id}`}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>2. Selecciona destino</label>
          <div className="input-with-btn">
            <input
              type="text"
              placeholder="Buscar parada de destino..."
              value={destinationSearch}
              onChange={(e) => setDestinationSearch(e.target.value)}
              className="form-input"
            />
            <button
              type="button"
              className="location-btn"
              onClick={() => handleGetLocation(false)}
              title="Usar mi ubicacion"
            >
              GPS
            </button>
          </div>

          {destinationResults.length > 0 && (
            <div className="stop-results">
              {destinationResults.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  className="stop-result"
                  onClick={() => handleStopSelect(stop, 'destination')}
                >
                  {stop.descripcion || `Parada ${stop.id}`}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            className={`map-select-btn ${selectionMode === 'destination' ? 'active' : ''}`}
            onClick={() => onSelectionModeChange(selectionMode === 'destination' ? null : 'destination')}
          >
            {selectionMode === 'destination' ? 'Haz click en el mapa para destino' : 'Seleccionar destino en mapa'}
          </button>

          {destination && (
            <div className="selected-location destination">
              Destino: {destination.descripcion || `Parada ${destination.id}`}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="plan-btn"
          disabled={!origin || !destination || loading}
        >
          {loading ? 'Calculando...' : '3. Calcular ruta optima'}
        </button>
      </form>

      <div className="planner-tips">
        <div className="tip">
          <span className="tip-icon">1</span>
          <span>Elige origen y destino por busqueda o seleccion manual en el mapa.</span>
        </div>
        <div className="tip">
          <span className="tip-icon">2</span>
          <span>El origen y destino deben ser paradas reales del sistema.</span>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;
