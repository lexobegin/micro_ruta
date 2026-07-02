import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './RouteDetailPage.css';

const RouteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Este componente mostrará el detalle de una ruta específica
  // Se implementará completamente en la siguiente fase

  return (
    <div className="route-detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Volver
      </button>
      <h1 className="page-title">
        Detalle de Ruta
        <span className="subtitle">Ruta #{id}</span>
      </h1>

      <div className="route-detail-container">
        <div className="detail-card">
          <h3>Información de la ruta</h3>
          <p>Detalle completo de la ruta seleccionada...</p>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailPage;