import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import LinesPage from './pages/LinesPage';
import PlannerPage from './pages/PlannerPage';
import RouteDetailPage from './pages/RouteDetailPage';
import Figura3RecorridoLinea from './pages/Figura3RecorridoLinea';
import Figura4MapaRutas from './pages/Figura4MapaRutas';
import './styles/App.css';

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lines" element={<LinesPage />} />
          <Route path="/lines/:id" element={<LinesPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/route/:id" element={<RouteDetailPage />} />
          <Route path="/figura-3" element={<Figura3RecorridoLinea />} />
          <Route path="/figura-3/:id" element={<Figura3RecorridoLinea />} />
          <Route path="/figura-4" element={<Figura4MapaRutas />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
