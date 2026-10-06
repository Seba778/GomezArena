import React from 'react';

function Navbar({ scrolled }) {
  return (
    <div className="fixed top-0 w-full z-50">
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-600 to-transparent" />
      <nav className={`transition-all duration-500 ${scrolled ? 'py-3 bg-black/95 backdrop-blur-xl border-b border-amber-600/20' : 'py-7 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-[2px] rounded-full bg-gradient-to-br from-amber-600/60 to-amber-900/40">
              <img src="/logo.jpg" alt="Logo" className={`rounded-full transition-all duration-500 ${scrolled ? 'h-9' : 'h-11'} block`} />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tighter text-lg md:text-xl uppercase leading-none text-white">Gomez Western Wear</span>
              <span className="text-amber-500 font-bold text-[9px] tracking-[0.35em] uppercase mt-[2px]">Arena · Mesquite, TX</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">
            <a href="#eventos" className="hover:text-amber-500 transition-colors duration-300 relative group">
              Events
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-600 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#nosotros" className="hover:text-amber-500 transition-colors duration-300 relative group">
              About Us
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-600 group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#eventos" className="relative overflow-hidden border border-amber-600/60 hover:border-amber-500 text-amber-400 hover:text-white px-7 py-2.5 rounded-full transition-all duration-300 group">
              <span className="absolute inset-0 bg-amber-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative">Upcoming Events</span>
            </a>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
