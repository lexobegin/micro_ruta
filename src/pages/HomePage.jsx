import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MicroRutaMap from '../components/map/MicroRutaMap';
import { getLines } from '../api/endpoints';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import './HomePage.css';

const HomePage = () => {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([-17.783, -63.182]);

  useEffect(() => {
    loadLines();
  }, []);

  const loadLines = async () => {
    try {
      setLoading(true);
      const data = await getLines({ limit: 10 });
      setLines(data);
    } catch (err) {
      setError('Error al cargar las líneas de microbús');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando líneas..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadLines} />;

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="hero-title">
          🚌 MicroRuta
          <span className="hero-subtitle">
            Planifica tus viajes en microbús en Santa Cruz
          </span>
        </h1>
        <div className="hero-actions">
          <Link to="/planner" className="btn-primary">
            Planificar Viaje
          </Link>
          <Link to="/lines" className="btn-secondary">
            Ver Líneas
          </Link>
        </div>
      </div>

      <div className="map-section">
        <MicroRutaMap
          center={mapCenter}
          zoom={13}
          height="450px"
          lines={lines}
        />
      </div>

      <div className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🗺️</div>
          <h3>Visualiza Líneas</h3>
          <p>Consulta todas las líneas de microbús en el mapa</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📱</div>
          <h3>Planificador Inteligente</h3>
          <p>Encuentra la mejor ruta con el algoritmo Dijkstra</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🔄</div>
          <h3>Transbordos</h3>
          <p>Conoce los puntos de transbordo entre líneas</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;