import React, { useState, useEffect } from 'react';
import { X, Gem, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

function ModalReserva({ evento, onCerrar }) {
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    const fetchMesas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('mesas')
        .select('*')
        .eq('evento', evento.id);

      if (error) console.error('Error fetching mesas:', error);
      else setMesas(data || []);
      setLoading(false);
    };

    fetchMesas();
    const interval = setInterval(fetchMesas, 3000);
    return () => clearInterval(interval);
  }, [evento.id]);

  const isMesaOccupied = (numero, categoria) => {
    return mesas.some(
      (m) => m.numero === numero && m.categoria === categoria && (m.estado === 'vendida' || m.estado === 'bloqueada')
    );
  };

  const getCategoryConfig = (categoria) => {
    if (categoria === 'red' || categoria === 'RED TABLES') {
      return {
        label: 'RED TABLES',
        price: evento.precio_red,
        color: 'text-red-400',
        borderColor: 'border-red-600/50',
        bgColor: 'bg-red-900/10',
        description: '4 seats · Drinks not included',
        numeros: Array.from({ length: evento.mesas_red || 20 }, (_, i) => i + 21),
      };
    }
    if (categoria === 'blue' || categoria === 'BLUE TABLES') {
      return {
        label: 'BLUE TABLES',
        price: evento.precio_blue,
        color: 'text-blue-400',
        borderColor: 'border-blue-600/50',
        bgColor: 'bg-blue-900/10',
        description: '4 seats · Drinks not included',
        numeros: Array.from({ length: evento.mesas_blue || 20 }, (_, i) => i + 41),
      };
    }
    return null;
  };

  const categories = [];
  if (evento.precio_red) categories.push('red');
  if (evento.precio_blue) categories.push('blue');

  const handleConfirmBooking = async () => {
    if (!selectedTable || !selectedCategory) return;
    const link = selectedCategory === 'red' ? evento.link_red : evento.link_blue;
    if (!link) {
      alert('Payment link not available yet. Please contact us.');
      return;
    }
    if (!customerName.trim() || !customerEmail.trim()) {
      alert('Please enter your name and email');
      return;
    }

    const { error } = await supabase.from('mesas').upsert({
      evento: evento.id,
      numero: selectedTable,
      categoria: selectedCategory,
      estado: 'vendida',
      nombre: customerName.trim(),
      email: customerEmail.trim(),
    });

    if (error) {
      console.error('Error saving mesa:', error);
      alert('Error saving reservation. Please try again.');
      return;
    }

    const emailParam = `?customer_email=${encodeURIComponent(customerEmail.trim())}`;
    window.location.href = link + emailParam;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-2xl overflow-y-auto animate-fade-in p-4 md:p-10">
      <div className="max-w-7xl mx-auto relative bg-[#080604] rounded-[3rem] border border-amber-600/15 p-6 md:p-12 shadow-2xl">
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-amber-600/60 to-transparent rounded-full" />

        <button onClick={onCerrar} className="absolute top-8 right-8 text-stone-600 hover:text-amber-500 transition-all hover:rotate-90 duration-300">
          <X size={36} />
        </button>

        <div className="mb-14">
          <span className="text-amber-600 font-bold uppercase tracking-[0.4em] text-[9px]">Booking for</span>
          <h2 className="text-4xl md:text-6xl font-black uppercase italic mt-2 leading-none">{evento.nombre}</h2>
          <p className="text-stone-500 text-sm mt-3">{evento.fecha || 'Date TBA'} · Mesquite, TX</p>
          <div className="flex items-center gap-3 mt-5">
            <div className="h-[1px] w-12 bg-amber-800/50" />
            <div className="w-1 h-1 bg-amber-600 rotate-45" />
            <div className="h-[1px] w-12 bg-amber-800/40" />
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <p className="text-amber-500 font-bold animate-pulse text-[11px] uppercase tracking-widest">Loading availability...</p>
          </div>
        )}

        {/* Table Map */}
        <div className="mb-16">
          <div className="bg-black/60 p-4 rounded-[2.5rem] border border-amber-600/10 shadow-inner">
            <img src={`/${evento.flyer || 'flyer-stage-night.jpg'}`} alt={`${evento.nombre} Table Map`} className="w-full h-auto rounded-2xl shadow-2xl border border-white/5" />
          </div>
        </div>

        {/* VIP Tables */}
        <div>
          <div className="flex items-center gap-3 text-amber-500 font-bold text-[10px] uppercase tracking-[0.4em] mb-2">
            <Gem size={14} /> Select Your VIP Table
          </div>
          <p className="text-stone-500 text-[10px] font-medium mb-10 ml-6 uppercase tracking-wider">
            * Includes <span className="text-white font-black">4 seats</span>. Does not include entry ticket, parking, or drinks. Billed separately.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Category Selector */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-stone-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" /> 1. Table Type
              </h3>

              {categories.map((cat) => {
                const config = getCategoryConfig(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSelectedTable(null); }}
                    className={`w-full flex justify-between items-center p-6 rounded-2xl border transition-all duration-300 text-left
                      ${selectedCategory === cat
                        ? `${config.bgColor} ${config.borderColor} translate-x-2 shadow-lg`
                        : 'bg-white/3 border-white/5 hover:bg-white/6 hover:border-white/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <Gem className={`w-5 h-5 ${config.color}`} />
                      <div className="flex flex-col">
                        <span className={`font-black uppercase tracking-tight text-sm ${config.color}`}>{config.label}</span>
                        <span className="text-amber-500 font-black text-lg mt-0.5">
                          ${config.price?.toLocaleString()} <span className="text-[10px] text-stone-500 font-medium">USD</span>
                        </span>
                        <span className="text-[9px] text-stone-500 uppercase tracking-wider mt-0.5">{config.description}</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className={`transition-opacity ${selectedCategory === cat ? 'opacity-100 text-amber-500' : 'opacity-20'}`} />
                  </button>
                );
              })}
            </div>

            {/* Table Number Selector */}
            <div className={`lg:col-span-3 bg-black/50 p-8 rounded-[3rem] border border-amber-600/8 transition-all duration-700 ${!selectedCategory ? 'opacity-40 grayscale' : 'opacity-100'}`}>
              <h3 className="text-stone-400 font-bold uppercase tracking-[0.3em] text-[10px] mb-8">2. Select Table Number</h3>
              {selectedCategory && (
                <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-3">
                  {getCategoryConfig(selectedCategory).numeros.map((n) => {
                    const occupied = isMesaOccupied(n, selectedCategory === 'red' ? 'red' : 'blue');
                    const isSelected = selectedTable === n;
                    return (
                      <button
                        key={n}
                        disabled={occupied}
                        onClick={() => setSelectedTable(n)}
                        className={`aspect-square flex items-center justify-center rounded-xl font-black text-xs transition-all border
                          ${occupied
                            ? 'bg-red-900/30 border-red-800/40 text-red-600/60 cursor-not-allowed'
                            : isSelected
                              ? 'bg-amber-600 border-amber-500 text-white shadow-xl scale-110'
                              : selectedCategory === 'red'
                                ? 'bg-red-900/20 border-red-600/30 text-red-300 hover:bg-red-900/40'
                                : 'bg-blue-900/20 border-blue-600/30 text-blue-300 hover:bg-blue-900/40'
                          }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                </div>
              )}
              {!selectedCategory && (
                <p className="text-stone-600 text-sm italic text-center mt-8">Select a table type to see availability</p>
              )}
            </div>
          </div>

          {/* Table Confirmed */}
          {selectedTable && (
            <div className="mt-16 animate-slide-up">
              <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 p-[1px] rounded-[3rem] shadow-2xl shadow-amber-900/30">
                <div className="bg-[#0c0a08] rounded-[2.9rem] p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-10">
                  <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 text-amber-500 text-[9px] font-black uppercase tracking-[0.4em] mb-4">
                      <CheckCircle2 size={12}/> VIP Table Selected
                    </div>
                    <h4 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white leading-none">#{selectedTable}</h4>
                    <p className="text-amber-500 font-black text-2xl mt-3">
                      ${getCategoryConfig(selectedCategory)?.price?.toLocaleString()} <span className="text-sm text-stone-400 font-medium">USD</span>
                    </p>
                    <p className="text-stone-400 text-sm italic mt-1">4 seats · Drinks not included</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="bg-stone-900 border border-amber-600/30 rounded-full px-6 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 w-64 text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="bg-stone-900 border border-amber-600/30 rounded-full px-6 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 w-64 text-sm"
                    />
                    <button onClick={handleConfirmBooking} className="bg-amber-600 hover:bg-amber-500 text-white font-black py-5 px-14 rounded-full transition-all shadow-xl uppercase tracking-widest text-xs">
                      Confirm Booking
                    </button>
                    <p className="text-[9px] text-stone-600 uppercase tracking-wider">Secure payment · Stripe</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ModalReserva;
