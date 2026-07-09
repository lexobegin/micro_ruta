import React, { useEffect, useMemo, useState } from 'react';
import TripPlanner from '../components/planner/TripPlanner';
import RouteResults from '../components/planner/RouteResults';
import MicroRutaMap from '../components/map/MicroRutaMap';
import { calculateRoute, getNearbyStops, getPoints } from '../api/endpoints';
import ErrorMessage from '../components/common/ErrorMessage';
import './PlannerPage.css';

const PlannerPage = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapCenter, setMapCenter] = useState([-17.783, -63.182]);
  const [mapZoom, setMapZoom] = useState(13);
  const [selectionMode, setSelectionMode] = useState(null);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadStops = async () => {
      try {
        const data = await getPoints(true, 1000);
        if (!cancelled) setStops(data);
      } catch (err) {
        console.error('Error al cargar paradas:', err);
        if (!cancelled) setError('No se pudieron cargar las paradas disponibles.');
      }
    };

    loadStops();

    return () => {
      cancelled = true;
    };
  }, []);

  const getRouteSteps = (route) => route?.pasos || route?.informacion_detallada || [];

  const selectableStops = useMemo(() => stops, [stops]);

  const handlePlanTrip = async (originId, destinationId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await calculateRoute(originId, destinationId);
      setResults(data);
      if (data.length > 0) {
        setSelectedRoute(data[0]);
        const steps = getRouteSteps(data[0]);
        if (steps.length > 0) {
          const midPoint = steps[Math.floor(steps.length / 2)];
          setMapCenter([midPoint.latitud, midPoint.longitud]);
          setMapZoom(14);
        }
      }
    } catch (err) {
      setError('Error al calcular la ruta. Por favor, intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoute = (route) => {
    setSelectedRoute(route);
    const steps = getRouteSteps(route);
    if (steps.length > 0) {
      const midPoint = steps[Math.floor(steps.length / 2)];
      setMapCenter([midPoint.latitud, midPoint.longitud]);
      setMapZoom(14);
    }
  };

  const selectStop = (stop, type) => {
    if (type === 'origin') {
      setOrigin(stop);
      setMapCenter([stop.latitud, stop.longitud]);
    } else {
      setDestination(stop);
      setMapCenter([stop.latitud, stop.longitud]);
    }

    setMapZoom(15);
    setResults([]);
    setSelectedRoute(null);
    setSelectionMode(null);
    setError(null);
  };

  const handleLocationSelect = async (lat, lon, isOrigin) => {
    try {
      const stops = await getNearbyStops(lat, lon);
      if (stops.length > 0) {
        const stop = stops[0];
        if (isOrigin) {
          selectStop(stop, 'origin');
        } else {
          selectStop(stop, 'destination');
        }
      } else {
        setError('No se encontraron paradas cercanas a esa ubicacion.');
      }
    } catch (err) {
      setError('No se encontraron paradas cercanas a esa ubicacion.');
      console.error('Error al buscar paradas cercanas:', err);
    }
  };

  const handleMapClick = (latlng) => {
    if (!selectionMode) return;
    handleLocationSelect(latlng.lat, latlng.lng, selectionMode === 'origin');
    setSelectionMode(null);
  };

  // Preparar rutas para el mapa
  const getMapRoutes = () => {
    const steps = getRouteSteps(selectedRoute);
    if (steps.length === 0) {
      return [];
    }

    const points = steps.map(p => ({
      lat: p.latitud,
      lon: p.longitud,
      stop: p.stop || false,
      descripcion: p.descripcion,
      type: p.es_transferencia ? 'transfer' : null
    }));

    // Marcar inicio y fin
    if (points.length > 0) {
      points[0].type = 'start';
      points[points.length - 1].type = 'end';
    }

    return [{
      id: 'selected-route',
      name: `Ruta planificada (${selectedRoute.tiempo_total_minutos} min)`,
      description: `Distancia: ${selectedRoute.distancia_total_metros || 0} m | Transbordos: ${selectedRoute.numero_transbordos || 0}`,
      color: '#e74c3c',
      points: points,
      weight: 6,
      opacity: 0.9,
      showPoints: false,
      popup: true
    }];
  };

  // Preparar puntos de transbordo
  const getTransferPoints = () => {
    const steps = getRouteSteps(selectedRoute);
    if (steps.length === 0) {
      return [];
    }

    return steps
      .filter(p => p.es_transferencia)
      .map(p => ({
        lat: p.latitud,
        lon: p.longitud,
        descripcion: p.descripcion,
        linea_origen: p.nombre_linea,
        linea_destino: p.nombre_linea
      }));
  };

  return (
    <div className="planner-page">
      <h1 className="page-title">
        Planificador de Viajes
        <span className="subtitle">Encuentra la mejor ruta en microbús</span>
      </h1>

      <div className="planner-container">
        <div className="planner-sidebar">
          <TripPlanner
            onPlanTrip={handlePlanTrip}
            onLocationSelect={handleLocationSelect}
            onSelectStop={selectStop}
            onSelectionModeChange={setSelectionMode}
            origin={origin}
            destination={destination}
            selectionMode={selectionMode}
            stops={selectableStops}
            loading={loading}
          />

          {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

          {results.length > 0 && (
            <RouteResults
              routes={results}
              selectedRoute={selectedRoute}
              onSelectRoute={handleSelectRoute}
            />
          )}
        </div>

        <div className="planner-map">
          <MicroRutaMap
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            routes={getMapRoutes()}
            stops={[]}
            startPoint={origin ? {
              lat: origin.latitud,
              lon: origin.longitud,
              descripcion: origin.descripcion
            } : null}
            endPoint={destination ? {
              lat: destination.latitud,
              lon: destination.longitud,
              descripcion: destination.descripcion
            } : null}
            transferPoints={getTransferPoints()}
            selectedRoute={null}
            showStops={false}
            showLines={true}
            showRoutePoints={false}
            interactive={true}
            onMapClick={(latlng) => {
              handleMapClick(latlng);
            }}
            onMoveEnd={(bounds) => {
              console.log('Map moved:', bounds);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PlannerPage;
