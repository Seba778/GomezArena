import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Eventos from './components/Eventos';
import Galeria from './components/Galeria';
import ModalReserva from './components/ModalReserva';
import Footer from './components/Footer';
import Success from './Success';
import { useEventos } from './hooks/useEventos';

function MainLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  // EVENT HARDCODED FOR TESTING
  const eventos = [
    {
      id: 'los-farmerz-2026',
      nombre: 'Los Farmerz Stage',
      slug: 'los-farmerz',
      fecha: '2026-10-24',
      activo: true,
      precio_red: 700,
      precio_blue: 600,
      mesas_red: 20,
      mesas_blue: 20,
      flyer: 'flyer-stage-night.jpg',
      color: '#8B0000',
      link_red: 'https://buy.stripe.com/8x26oJbnU8Si7hXgSYgIo03',
      link_blue: 'https://buy.stripe.com/bJe9AV9fM6Ka9q56ekgIo02'
    }
  ];
  const loading = false;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openReservationModal = (evento) => {
    setSelectedEvent(evento);
  };

  const closeReservationModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-[#060504] text-white font-sans selection:bg-amber-600 overflow-x-hidden">
      <Navbar scrolled={scrolled} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 space-y-32 mt-16 pb-20">
        <Hero />
        <Eventos eventos={eventos} onBookTable={openReservationModal} />
        <Galeria />
      </main>

      {selectedEvent && (
        <ModalReserva evento={selectedEvent} onCerrar={closeReservationModal} />
      )}

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/success" element={<Success />} />
      </Routes>
    </Router>
  );
}

export default App;
