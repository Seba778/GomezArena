import React from 'react';
import { MapPin, Calendar } from 'lucide-react';

function Eventos({ eventos, onBookTable }) {
  if (!eventos || eventos.length === 0) {
    return (
      <section id="eventos" className="w-full text-center py-20">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-[1px] w-12 bg-amber-800/50" />
          <Calendar size={14} className="text-amber-500" />
          <span className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em]">Upcoming Events</span>
          <Calendar size={14} className="text-amber-500" />
          <div className="h-[1px] w-12 bg-amber-800/50" />
        </div>
        <p className="text-stone-600 text-sm italic">No upcoming events at the moment. Check back soon!</p>
      </section>
    );
  }

  return (
    <section id="eventos" className="w-full text-center">
      <div className="flex items-center justify-center gap-4 mb-3">
        <div className="h-[1px] w-12 bg-amber-800/50" />
        <Calendar size={14} className="text-amber-500" />
        <span className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em]">Upcoming Events</span>
        <Calendar size={14} className="text-amber-500" />
        <div className="h-[1px] w-12 bg-amber-800/50" />
      </div>
      <p className="text-stone-600 text-[9px] uppercase tracking-widest mb-10">Mesquite, TX · Gomez Western Wear Arena</p>

      {eventos.map((evento) => (
        <div key={evento.id} className="group relative rounded-[3rem] overflow-hidden border border-amber-600/25 shadow-2xl max-w-5xl mx-auto mb-10">
          <img
            src={`/${evento.flyer || 'flyer-stage-night.jpg'}`}
            alt={evento.nombre}
            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
            <div className="text-left">
              <p className="text-amber-500 text-[9px] uppercase tracking-[0.4em] font-bold mb-2">Upcoming Event</p>
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none text-white mb-2">{evento.nombre}</h3>
              <div className="flex items-center gap-3 text-stone-300 text-xs">
                <Calendar size={12} className="text-amber-500" />
                <span>{evento.fecha || 'Date TBA'}</span>
                <span className="text-stone-600">·</span>
                <MapPin size={12} className="text-amber-500" />
                <span>Mesquite, TX</span>
              </div>
            </div>
            <button
              onClick={() => onBookTable(evento)}
              className="shrink-0 bg-amber-600 hover:bg-amber-500 text-white font-black py-4 px-10 rounded-full transition-all shadow-xl uppercase tracking-widest text-xs whitespace-nowrap"
            >
              Book a Table
            </button>
          </div>
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-600/50 rounded-tl-lg pointer-events-none" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-600/50 rounded-tr-lg pointer-events-none" />
        </div>
      ))}
    </section>
  );
}

export default Eventos;
