import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-icon">🚌</span>
            <span className="logo-text">MicroRuta</span>
          </Link>
        </div>
        <nav className="nav-menu">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link 
            to="/lines" 
            className={`nav-link ${isActive('/lines') ? 'active' : ''}`}
          >
            Líneas
          </Link>
          <Link 
            to="/planner" 
            className={`nav-link ${isActive('/planner') ? 'active' : ''}`}
          >
            Planificador
          </Link>
          <Link
            to="/figura-4"
            className={`nav-link ${isActive('/figura-4') ? 'active' : ''}`}
          >
            Mapa
          </Link>
          <Link
            to="/figura-3"
            className={`nav-link ${location.pathname.startsWith('/figura-3') ? 'active' : ''}`}
          >
            Recorrido
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
