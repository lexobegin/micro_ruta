import apiClient from './client';

// ===== LÍNEAS =====
export const getLines = async (params = {}) => {
  const response = await apiClient.get('/lineas/', { params });
  return response.data;
};

export const getLineById = async (id, includeRoutes = true) => {
  const response = await apiClient.get(`/lineas/${id}`, {
    params: { incluir_rutas: includeRoutes }
  });
  return response.data;
};

export const searchLines = async (nombre) => {
  const response = await apiClient.get('/lineas/buscar/nombre', {
    params: { nombre }
  });
  return response.data;
};

export const getLineRoute = async (lineaId, tipoRuta = null) => {
  const params = tipoRuta ? { tipo_ruta: tipoRuta } : {};
  const response = await apiClient.get(`/lineas/${lineaId}/recorrido`, { params });
  return response.data;
};

// ===== PUNTOS =====
export const getPoints = async (stopOnly = false, limit = 100) => {
  const response = await apiClient.get('/puntos/', {
    params: { stop_only: stopOnly, limit }
  });
  return response.data;
};

export const getPointById = async (id) => {
  const response = await apiClient.get(`/puntos/${id}`);
  return response.data;
};

export const searchPointsByCoords = async (lat, lon, radio = 500) => {
  const response = await apiClient.get('/puntos/buscar/coordenadas', {
    params: { lat, lon, radio }
  });
  return response.data;
};

// ===== RUTAS =====
export const getRoutesByLine = async (lineaId) => {
  const response = await apiClient.get(`/rutas/linea/${lineaId}`);
  return response.data;
};

export const getNearbyPoints = async (lat, lon, radio = 200) => {
  const response = await apiClient.get('/rutas/puntos/cercanos', {
    params: { lat, lon, radio }
  });
  return response.data;
};

export const getLinesByPoint = async (puntoId) => {
  const response = await apiClient.get(`/rutas/punto/${puntoId}/lineas`);
  return response.data;
};

// ===== PLANIFICADOR =====
export const calculateRoute = async (origenId, destinoId) => {
  const response = await apiClient.post('/planificador/calcular', {
    origen_id: origenId,
    destino_id: destinoId
  });
  return response.data;
};

export const getNearbyStops = async (lat, lon, radio = 200) => {
  const response = await apiClient.get('/planificador/puntos-cercanos', {
    params: { lat, lon, radio }
  });
  return response.data;
};

// ===== TRANSFERENCIAS =====
export const getTransfersByPoint = async (puntoId) => {
  const response = await apiClient.get(`/transferencias/punto/${puntoId}`);
  return response.data;
};