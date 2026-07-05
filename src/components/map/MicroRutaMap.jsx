import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solucionar problema de iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Iconos personalizados
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const stopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const transferIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para controlar el mapa desde props
const MapController = ({ center, zoom, onMoveEnd, onMapReady }) => {
  const map = useMap();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (center && !isReady) {
      map.setView(center, zoom || 13);
      setIsReady(true);
      if (onMapReady) onMapReady(map);
    }
  }, [center, zoom, map, isReady, onMapReady]);

  useEffect(() => {
    if (onMoveEnd) {
      map.on('moveend', () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        onMoveEnd({ lat: center.lat, lng: center.lng, zoom });
      });
    }
  }, [map, onMoveEnd]);

  return null;
};

// Componente para manejar eventos de click en el mapa
const MapClickHandler = ({ onClick }) => {
  useMapEvents({
    click: (e) => {
      if (onClick) {
        onClick(e.latlng);
      }
    },
  });
  return null;
};

// Componente para dibujar una ruta con sus puntos
const RouteLayer = ({ route, color = '#3498db' }) => {
  if (!route || !route.points || route.points.length === 0) {
    return null;
  }

  const positions = route.points.map(p => [p.lat, p.lon]);

  return (
    <>
      <Polyline
        positions={positions}
        color={color}
        weight={route.weight || 4}
        opacity={route.opacity || 0.8}
        dashArray={route.dashArray || null}
      >
        {route.popup && (
          <Popup>
            <strong>{route.name || 'Ruta'}</strong>
            <br />
            {route.description || ''}
          </Popup>
        )}
      </Polyline>

      {/* Marcadores de puntos de la ruta */}
      {route.showPoints && route.points.map((point, idx) => {
        let icon = defaultIcon;
        if (point.type === 'start') icon = startIcon;
        else if (point.type === 'end') icon = endIcon;
        else if (point.type === 'transfer') icon = transferIcon;
        else if (point.stop) icon = stopIcon;

        return (
          <Marker
            key={`point-${route.id || 'route'}-${idx}`}
            position={[point.lat, point.lon]}
            icon={icon}
          >
            <Popup>
  <strong>{point.descripcion || `Punto ${idx + 1}`}</strong>

  {point.stop && (
    <>
      <br />
      <span>🚏 Parada</span>
    </>
  )}

  {point.type === 'start' && (
    <>
      <br />
      <span>🟢 Inicio</span>
    </>
  )}

  {point.type === 'end' && (
    <>
      <br />
      <span>🔴 Fin</span>
    </>
  )}

  {point.type === 'transfer' && (
    <>
      <br />
      <span>🔄 Transbordo</span>
    </>
  )}
</Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Componente principal del mapa
const MicroRutaMap = ({
  center = [-17.783, -63.182],
  zoom = 13,
  lines = [],
  routes = [],
  stops = [],
  startPoint = null,
  endPoint = null,
  transferPoints = [],
  selectedRoute = null,
  onMapClick = null,
  onMoveEnd = null,
  onMapReady = null,
  height = '500px',
  showStops = true,
  showLines = true,
  showRoutePoints = true,
  interactive = true,
  className = '',
}) => {
  const mapRef = useRef();
  const [mapInstance, setMapInstance] = useState(null);

  // Preparar puntos de parada para el mapa
  const stopMarkers = stops.map(stop => ({
    id: stop.id,
    lat: stop.latitud,
    lon: stop.longitud,
    descripcion: stop.descripcion || `Parada ${stop.id}`,
    lineas: stop.lineas || []
  }));

  // Preparar líneas para el mapa
  const lineRoutes = lines.map(line => ({
    id: line.id,
    name: line.nombre_linea,
    description: `Línea ${line.nombre_linea}`,
    color: line.color_linea || '#2ecc71',
    points: line.puntos?.map(p => ({
      lat: p.latitud,
      lon: p.longitud,
      stop: p.stop || false,
      descripcion: p.descripcion
    })) || [],
    weight: 3,
    opacity: 0.7,
    popup: true,
    showPoints: showRoutePoints
  }));

  // Preparar rutas para el mapa
  const routeLayers = routes.map(route => ({
    id: route.id || `route-${Date.now()}`,
    name: route.name || 'Ruta',
    description: route.description || '',
    color: route.color || '#3498db',
    points: route.points?.map(p => ({
      lat: p.lat,
      lon: p.lon,
      stop: p.stop || false,
      descripcion: p.descripcion,
      type: p.type || null
    })) || [],
    weight: route.weight || 4,
    opacity: route.opacity || 0.8,
    dashArray: route.dashArray || null,
    popup: route.popup !== undefined ? route.popup : true,
    showPoints: route.showPoints !== undefined ? route.showPoints : true
  }));

  // Si hay una ruta seleccionada, mostrarla con prioridad
  if (selectedRoute) {
    routeLayers.push({
      id: 'selected-route',
      name: selectedRoute.name || 'Ruta seleccionada',
      description: selectedRoute.description || '',
      color: selectedRoute.color || '#e74c3c',
      points: selectedRoute.points?.map(p => ({
        lat: p.lat,
        lon: p.lon,
        stop: p.stop || false,
        descripcion: p.descripcion,
        type: p.type || null
      })) || [],
      weight: 6,
      opacity: 0.9,
      popup: true,
      showPoints: true
    });
  }

  // Manejar click en el mapa
  const handleMapClick = (latlng) => {
    if (onMapClick && interactive) {
      onMapClick(latlng);
    }
  };

  // Manejar cuando el mapa está listo
  const handleMapReady = (map) => {
    setMapInstance(map);
    if (onMapReady) onMapReady(map);
  };

  return (
    <div className={`micro-ruta-map ${className}`} style={{ height, width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={interactive}
        dragging={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
      >
        <MapController
          center={center}
          zoom={zoom}
          onMoveEnd={onMoveEnd}
          onMapReady={handleMapReady}
        />

        <MapClickHandler onClick={handleMapClick} />

        {/* Capa base de OpenStreetMap */}
        <TileLayer
          attribution={import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url={import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />

        {/* Dibujar líneas de microbús */}
        {showLines && lineRoutes.map((line, index) => (
          <RouteLayer
            key={`line-${line.id || index}`}
            route={line}
            color={line.color}
          />
        ))}

        {/* Dibujar rutas */}
        {routeLayers.map((route, index) => (
          <RouteLayer
            key={`route-${route.id || index}`}
            route={route}
            color={route.color}
          />
        ))}

        {/* Marcadores de paradas */}
        {showStops && stopMarkers.map((stop) => (
          <Marker
            key={`stop-${stop.id}`}
            position={[stop.lat, stop.lon]}
            icon={stopIcon}
          >
            <Popup>
              <strong>{stop.descripcion}</strong>
              <br />
              {stop.lineas && stop.lineas.length > 0 && (
                <>
                  Líneas: {stop.lineas.join(', ')}
                </>
              )}
              {(!stop.lineas || stop.lineas.length === 0) && (
                <span>Parada de microbús</span>
              )}
            </Popup>
          </Marker>
        ))}

        {/* Marcador de inicio */}
        {startPoint && (
          <Marker
            position={[startPoint.lat, startPoint.lon]}
            icon={startIcon}
          >
            <Popup>
              <strong>🟢 Inicio</strong>
              <br />
              {startPoint.descripcion || 'Punto de inicio'}
            </Popup>
          </Marker>
        )}

        {/* Marcador de destino */}
        {endPoint && (
          <Marker
            position={[endPoint.lat, endPoint.lon]}
            icon={endIcon}
          >
            <Popup>
              <strong>🔴 Destino</strong>
              <br />
              {endPoint.descripcion || 'Punto de destino'}
            </Popup>
          </Marker>
        )}

        {/* Marcadores de transbordo */}
        {transferPoints.map((point, index) => (
          <Marker
            key={`transfer-${index}`}
            position={[point.lat, point.lon]}
            icon={transferIcon}
          >
            <Popup>
              <strong>🔄 Transbordo</strong>
              <br />
              {point.descripcion || `Transbordo ${index + 1}`}
              {point.linea_origen && (
                <>
                  <br />
                  Desde: {point.linea_origen}
                </>
              )}
              {point.linea_destino && (
                <>
                  <br />
                  Hacia: {point.linea_destino}
                </>
              )}
            </Popup>
          </Marker>
        ))}

        {/* Radio de búsqueda (opcional) */}
        {startPoint?.radio && (
          <Circle
            center={[startPoint.lat, startPoint.lon]}
            radius={startPoint.radio}
            pathOptions={{
              color: '#3498db',
              fillColor: '#3498db',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            }}
          >
            <Popup>
              <strong>Área de búsqueda</strong>
              <br />
              Radio: {startPoint.radio} metros
            </Popup>
          </Circle>
        )}
      </MapContainer>
    </div>
  );
};

// Componente para usar el mapa desde hooks
export const useMapContext = () => {
  const map = useMap();
  return map;
};

export default MicroRutaMap;