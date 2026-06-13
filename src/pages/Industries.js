import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { discover, discoverTV } from '../utils/tmdb';
import { INDUSTRIES } from '../utils/industries';
import MovieCard from '../components/MovieCard';

const Industries = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initial = searchParams.get('id') || 'bollywood';
  const [active, setActive] = useState(initial);
  const [items,  setItems]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const industry = INDUSTRIES.find(i => i.id === active) || INDUSTRIES[0];

  const load = (ind, p = 1) => {
    setLoading(true);
    const fetcher = ind.type === 'tv' ? discoverTV : discover;
    fetcher({ ...ind.params, page: p })
      .then(d => setItems(prev => p === 1 ? (d.results || []) : [...prev, ...(d.results || [])]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    load(industry, 1);
    setSearchParams({ id: active }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(industry, next);
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">INDUSTRIES</h1>
          <p className="text-dark-400 text-sm mt-1">Explore cinema, anime &amp; shows from around the world</p>
        </div>

        {/* Industry tab cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
          {INDUSTRIES.map((ind, i) => (
            <motion.button
              key={ind.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActive(ind.id)}
              className={`relative overflow-hidden rounded-2xl p-4 text-center transition-all border-2 ${
                active === ind.id
                  ? `border-white/60 shadow-lg ${ind.glow} scale-105`
                  : 'border-transparent hover:border-white/20 hover:scale-105'
              } bg-gradient-to-br ${ind.gradient}`}
            >
              <div className="text-2xl mb-1">{ind.flag}</div>
              <p className="text-white font-bold text-xs sm:text-sm leading-tight drop-shadow">{ind.label}</p>
              {active === ind.id && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white/90 flex items-center justify-center text-[10px] font-black text-dark-950">✓</div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Active industry banner */}
        <motion.div
          key={industry.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 mb-8 bg-gradient-to-r ${industry.gradient} relative overflow-hidden`}
        >
          <div className="relative z-10 flex items-center gap-4">
            <div className="text-5xl">{industry.icon}</div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-display tracking-wider text-white drop-shadow">{industry.label.toUpperCase()}</h2>
              <p className="text-white/80 text-sm mt-0.5">
                {industry.type === 'tv' ? 'Series & shows' : 'Films'} · sorted by popularity
              </p>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 text-9xl opacity-10">{industry.flag}</div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(18).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((m, i) => (
                <MovieCard key={`${m.id}-${i}`} movie={{ ...m, media_type: industry.type }} index={i} />
              ))}
            </div>
            <div className="text-center mt-10">
              <button onClick={loadMore} className="btn-secondary px-10 py-3">Load More</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Industries;