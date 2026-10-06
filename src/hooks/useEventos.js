import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .eq('activo', true)
        .order('fecha', { ascending: true });

      if (error) throw error;
      setEventos(data || []);
    } catch (err) {
      console.error('Error fetching eventos:', err);
      setError(err.message);
    }
  };

  const fetchMesas = async (eventoId) => {
    try {
      const { data, error } = await supabase
        .from('mesas')
        .select('*')
        .eq('evento', eventoId);

      if (error) throw error;
      setMesas(data || []);
    } catch (err) {
      console.error('Error fetching mesas:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchEventos();
      setLoading(false);
    };
    load();
  }, []);

  return { eventos, mesas, loading, error, fetchMesas, refetchEventos: fetchEventos };
}
