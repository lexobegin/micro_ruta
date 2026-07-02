import React, { useState } from 'react';
import TripPlanner from '../components/planner/TripPlanner';
import RouteResults from '../components/planner/RouteResults';
import MicroRutaMap from '../components/map/MicroRutaMap';
import { calculateRoute, getNearbyStops } from '../api/endpoints';
import LoadingSpinner from '../components/common/LoadingSpinner';
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

  const handlePlanTrip = async (originId, destinationId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await calculateRoute(originId, destinationId);
      setResults(data);
      if (data.length > 0) {
        setSelectedRoute(data[0]);
        // Centrar el mapa en la ruta
        if (data[0].pasos && data[0].pasos.length > 0) {
          const midPoint = data[0].pasos[Math.floor(data[0].pasos.length / 2)];
          if (midPoint && midPoint[0]) {
            // Buscar el punto en informacion_detallada
            const detail = data[0].informacion_detallada?.find(
              p => p.punto_id === midPoint[0]
            );
            if (detail) {
              setMapCenter([detail.latitud, detail.longitud]);
              setMapZoom(14);
            }
          }
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
    // Centrar el mapa en la ruta seleccionada
    if (route.pasos && route.pasos.length > 0) {
      const midPoint = route.pasos[Math.floor(route.pasos.length / 2)];
      if (midPoint && midPoint[0]) {
        const detail = route.informacion_detallada?.find(
          p => p.punto_id === midPoint[0]
        );
        if (detail) {
          setMapCenter([detail.latitud, detail.longitud]);
          setMapZoom(14);
        }
      }
    }
  };

  const handleLocationSelect = async (lat, lon, isOrigin) => {
    try {
      const stops = await getNearbyStops(lat, lon);
      if (stops.length > 0) {
        const stop = stops[0];
        if (isOrigin) {
          setOrigin(stop);
          setMapCenter([stop.latitud, stop.longitud]);
        } else {
          setDestination(stop);
        }
      }
    } catch (err) {
      console.error('Error al buscar paradas cercanas:', err);
    }
  };

  // Preparar rutas para el mapa
  const getMapRoutes = () => {
    if (!selectedRoute || !selectedRoute.informacion_detallada) {
      return [];
    }

    const points = selectedRoute.informacion_detallada.map(p => ({
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
      showPoints: true,
      popup: true
    }];
  };

  // Preparar paradas para el mapa
  const getMapStops = () => {
    if (!selectedRoute || !selectedRoute.informacion_detallada) {
      return [];
    }

    return selectedRoute.informacion_detallada
      .filter(p => p.stop)
      .map(p => ({
        id: p.punto_id,
        latitud: p.latitud,
        longitud: p.longitud,
        descripcion: p.descripcion,
        lineas: [p.nombre_linea].filter(Boolean)
      }));
  };

  // Preparar puntos de transbordo
  const getTransferPoints = () => {
    if (!selectedRoute || !selectedRoute.informacion_detallada) {
      return [];
    }

    return selectedRoute.informacion_detallada
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
            origin={origin}
            destination={destination}
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
            stops={getMapStops()}
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
            selectedRoute={selectedRoute ? getMapRoutes()[0] : null}
            showStops={true}
            showLines={true}
            showRoutePoints={true}
            interactive={true}
            onMapClick={(latlng) => {
              console.log('Map clicked:', latlng);
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