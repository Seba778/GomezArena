import React from 'react';
import { Play } from 'lucide-react';

function Hero() {
  return (
    <header className="relative z-10 pt-36 md:pt-52 pb-10 text-center animate-fade-in">
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-amber-600/70" />
        <p className="text-amber-500 font-bold tracking-[0.6em] uppercase text-[10px]">Elite Membership Selection</p>
        <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-amber-600/70" />
      </div>
      <h1 className="text-6xl md:text-9xl font-black leading-[0.85] uppercase tracking-tighter mb-6">
        GOMEZ <span className="text-amber-600 italic">ARENA</span>
      </h1>
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="h-[1px] w-12 bg-amber-800/50" />
        <div className="w-1.5 h-1.5 bg-amber-600 rotate-45" />
        <div className="h-[1px] w-24 bg-amber-700/60" />
        <div className="w-1.5 h-1.5 bg-amber-600 rotate-45" />
        <div className="h-[1px] w-12 bg-amber-800/50" />
      </div>
      <p className="text-stone-400 text-sm md:text-lg font-light italic max-w-xl mx-auto px-6 leading-relaxed">
        "Welcome to Gómez Arena — the exclusive zone where every table is designed for a truly unforgettable experience"
      </p>
      <div className="flex items-center justify-center gap-8 mt-10">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-stone-500 mb-1">Red Tables</p>
          <p className="text-2xl font-black text-red-400">$700 <span className="text-sm font-medium text-stone-400">USD</span></p>
        </div>
        <div className="w-[1px] h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-stone-500 mb-1">Blue Tables</p>
          <p className="text-2xl font-black text-blue-400">$600 <span className="text-sm font-medium text-stone-400">USD</span></p>
        </div>
        <div className="w-[1px] h-10 bg-white/10" />
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.3em] text-stone-500 mb-1">Capacity</p>
          <p className="text-2xl font-black text-white">10k+</p>
        </div>
      </div>

      {/* Video */}
      <section className="w-full mt-16">
        <div className="flex items-center gap-3 text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-8">
          <Play size={14} fill="currentColor"/> Arena Preview
        </div>
        <div className="relative rounded-[2.5rem] overflow-hidden border border-amber-600/20 aspect-video shadow-2xl">
          <video src="/estadio-preview.mp4" autoPlay muted loop className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-amber-600/60 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-amber-600/60 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-amber-600/60 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-amber-600/60 rounded-br-lg" />
        </div>
      </section>
    </header>
  );
}

export default Hero;
