import React from 'react';
import './LineList.css';

const LineList = ({ lines, selectedId, onSelectLine, loading = false }) => {
  if (loading) {
    return <div className="line-list-loading">Cargando líneas...</div>;
  }

  if (lines.length === 0) {
    return (
      <div className="line-list-empty">
        <p>No se encontraron líneas</p>
      </div>
    );
  }

  return (
    <div className="line-list">
      {lines.map((line) => (
        <div
          key={line.id}
          className={`line-item ${selectedId === line.id ? 'selected' : ''}`}
          onClick={() => onSelectLine(line)}
        >
          <div
            className="line-color-indicator"
            style={{ backgroundColor: line.color_linea || '#3498db' }}
          />
          <div className="line-info">
            <span className="line-name">{line.nombre_linea}</span>
            {line.imagen_microbus && (
              <img
                src={line.imagen_microbus}
                alt={line.nombre_linea}
                className="line-icon"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
          </div>
          <span className="line-arrow">›</span>
        </div>
      ))}
    </div>
  );
};

export default LineList;