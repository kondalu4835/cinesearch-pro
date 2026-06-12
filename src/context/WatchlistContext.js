import React, { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const WatchlistContext = createContext(null);

const load = () => { try { return JSON.parse(localStorage.getItem('cs_wl') || '[]'); } catch { return []; } };
const save = (list) => localStorage.setItem('cs_wl', JSON.stringify(list));

export const WatchlistProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(load);

  const toggle = useCallback((item) => {
    setWatchlist(prev => {
      const exists = prev.some(i => i.id === item.id);
      const next = exists ? prev.filter(i => i.id !== item.id) : [{ ...item, added: Date.now() }, ...prev];
      save(next);
      toast(exists ? 'Removed from watchlist' : '✅ Added to watchlist', {
        style: { background: '#181818', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      return next;
    });
  }, []);

  const isAdded = useCallback((id) => watchlist.some(i => i.id === id), [watchlist]);

  return (
    <WatchlistContext.Provider value={{ watchlist, toggle, isAdded }}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => useContext(WatchlistContext);
