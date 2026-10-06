import React from 'react';
import { Star, Target, Eye } from 'lucide-react';

function Galeria() {
  return (
    <>
      {/* About Us */}
      <section id="nosotros" className="relative rounded-[4rem] overflow-hidden border border-amber-600/10 bg-[#0a0806] p-8 md:p-20">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-600/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-600/20 to-transparent" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 text-left">
            <p className="text-amber-700 text-[9px] uppercase tracking-[0.5em] font-bold">Our Story</p>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              ABOUT <span className="text-amber-600">US</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="h-[2px] w-16 bg-amber-600" />
              <div className="w-1.5 h-1.5 bg-amber-600 rotate-45" />
            </div>
            <p className="text-stone-300 text-lg leading-relaxed italic font-light">
              Gomez Western Wear Arena was born as a one-of-a-kind space, designed to blend modern elegance with the untamed spirit of Western culture. Every corner of our arena reflects a commitment to quality and world-class hospitality.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-white/5">
              <div>
                <div className="text-amber-500 font-black text-4xl mb-1">10k+</div>
                <div className="text-stone-500 uppercase text-[9px] tracking-widest font-bold">Total Capacity</div>
              </div>
              <div>
                <div className="text-amber-500 font-black text-4xl mb-1">60</div>
                <div className="text-stone-500 uppercase text-[9px] tracking-widest font-bold">VIP Tables</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5">
            <div className="bg-black/40 p-8 rounded-[2rem] border border-amber-600/10 hover:border-amber-600/30 transition-all duration-500 group">
              <div className="flex items-center gap-4 mb-4 text-amber-600">
                <Target size={24} />
                <h4 className="text-base font-black uppercase tracking-wider italic">Our Mission</h4>
              </div>
              <p className="text-stone-400 leading-relaxed text-sm">We elevate the standard of Western entertainment, providing an unmatched hospitality experience that honors our roots while looking toward the future.</p>
            </div>
            <div className="bg-black/40 p-8 rounded-[2rem] border border-amber-600/10 hover:border-amber-600/30 transition-all duration-500">
              <div className="flex items-center gap-4 mb-4 text-amber-600">
                <Eye size={24} />
                <h4 className="text-base font-black uppercase tracking-wider italic">Our Vision</h4>
              </div>
              <p className="text-stone-400 leading-relaxed text-sm">To be recognized as the global epicenter of the Western lifestyle, where exclusivity and passion come together under one roof.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="w-full text-center space-y-12">
        <div className="flex items-center justify-center gap-4">
          <div className="h-[1px] w-12 bg-amber-800/50" />
          <Star size={14} className="text-amber-500" fill="currentColor" />
          <span className="text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em]">Exclusive Suite Gallery</span>
          <Star size={14} className="text-amber-500" fill="currentColor" />
          <div className="h-[1px] w-12 bg-amber-800/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className="group relative rounded-[2rem] overflow-hidden border border-amber-600/10 aspect-[4/3] bg-stone-900 shadow-xl hover:border-amber-600/30 transition-all duration-500">
              <img src={`/suite-ejemplo${num}.jpg`} alt={`Suite ${num}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] border border-amber-600/50 px-5 py-2.5 rounded-full">View Details</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default Galeria;
