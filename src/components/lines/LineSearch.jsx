import React from 'react';
import './LineSearch.css';

const LineSearch = ({ value, onChange, onSearch, placeholder = 'Buscar línea...' }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch();
  };

  return (
    <form className="line-search" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {value && (
          <button
            type="button"
            className="clear-btn"
            onClick={() => onChange('')}
          >
            ✕
          </button>
        )}
      </div>
      <button type="submit" className="search-btn">
        Buscar
      </button>
    </form>
  );
};

export default LineSearch;