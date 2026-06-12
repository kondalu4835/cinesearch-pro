import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getGenres, discover } from '../utils/tmdb';
import MovieCard from '../components/MovieCard';

const ICONS = { Action:'💥',Adventure:'🗺️',Animation:'🎨',Comedy:'😂',Crime:'🔫',Documentary:'📽️',Drama:'🎭',Family:'👨‍👩‍👧',Fantasy:'🧙',History:'📜',Horror:'👻',Music:'🎵',Mystery:'🔍',Romance:'❤️','Science Fiction':'🚀',Thriller:'😱',War:'⚔️',Western:'🤠' };

const COLORS = [
  ['from-red-900/60','to-red-950'],['from-blue-900/60','to-blue-950'],
  ['from-purple-900/60','to-purple-950'],['from-green-900/60','to-green-950'],
  ['from-orange-900/60','to-orange-950'],['from-pink-900/60','to-pink-950'],
  ['from-cyan-900/60','to-cyan-950'],['from-yellow-900/60','to-yellow-950'],
  ['from-indigo-900/60','to-indigo-950'],['from-teal-900/60','to-teal-950'],
];

const Genres = () => {
  const [searchParams] = useSearchParams();
  const [genres,   setGenres]   = useState([]);
  const [selected, setSelected] = useState(null);
  const [movies,   setMovies]   = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [page,     setPage]     = useState(1);

  useEffect(() => {
  getGenres().then(d => {
    setGenres(d.genres || []);
    const id = searchParams.get('id');
    if (id) {
      const g = d.genres?.find(g => g.id === parseInt(id));
      if (g) handleSelect(g);
    }
  });
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = async (genre) => {
    setSelected(genre); setLoading(true); setPage(1);
    try {
      const data = await discover({ with_genres: genre.id });
      setMovies(data.results || []);
    } finally { setLoading(false); }
  };

  const loadMore = async () => {
    const next = page + 1; setPage(next);
    const data = await discover({ with_genres: selected.id, page: next });
    setMovies(prev => [...prev, ...(data.results || [])]);
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">BROWSE BY GENRE</h1>
          <p className="text-dark-400 text-sm mt-1">Discover movies in your favourite category</p>
        </div>

        {/* Genre grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
          {genres.map((g, i) => {
            const [from, to] = COLORS[i % COLORS.length];
            return (
              <motion.button key={g.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => handleSelect(g)}
                className={`relative overflow-hidden rounded-2xl p-5 text-center cursor-pointer transition-all hover:-translate-y-1 border-2 bg-gradient-to-br ${from} ${to} ${
                  selected?.id === g.id ? 'border-brand-400 shadow-lg shadow-brand-500/20' : 'border-transparent hover:border-dark-600'
                }`}
              >
                <div className="text-3xl mb-2">{ICONS[g.name] || '🎬'}</div>
                <p className="text-white font-semibold text-sm">{g.name}</p>
                {selected?.id === g.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-400 flex items-center justify-center text-dark-950 text-xs font-black">✓</div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Movies for selected genre */}
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="section-heading">
              {ICONS[selected.name] || '🎬'} {selected.name} Movies
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {movies.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={m} index={i} />)}
                </div>
                <div className="text-center mt-8">
                  <button onClick={loadMore} className="btn-secondary px-10 py-3">Load More</button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Genres;
