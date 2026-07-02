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
        </nav>
      </div>
    </header>
  );
};

export default Header;