// import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Eventos from './pages/Eventos';
import Escultores from './pages/Escultores';
import Esculturas from './pages/Esculturas';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Eventos" replace />} />
        <Route path="/Eventos" element={<Eventos />} />
        <Route path="/Escultures" element={<Escultores />} />
        <Route path="/Esculturas" element={<Esculturas />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
