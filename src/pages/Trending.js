import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getTrending, getTrendingPeople, img } from '../utils/tmdb';
import MovieCard from '../components/MovieCard';
import { Link } from 'react-router-dom';

const Trending = () => {
  const [movies,  setMovies]  = useState([]);
  const [people,  setPeople]  = useState([]);
  const [window,  setWindow]  = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getTrending('movie', window), getTrendingPeople()])
      .then(([m, p]) => { setMovies(m.results || []); setPeople(p.results || []); })
      .catch(console.error).finally(() => setLoading(false));
  }, [window]);

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">TRENDING</h1>
            <p className="text-dark-400 text-sm mt-1">What everyone is watching right now</p>
          </div>
          <div className="flex gap-2">
            {[['day','Today'],['week','This Week']].map(([val, label]) => (
              <button key={val} onClick={() => setWindow(val)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  window === val ? 'btn-primary' : 'btn-secondary'
                }`}>{label}</button>
            ))}
          </div>
        </div>

        {/* Top 3 hero */}
        {!loading && movies.slice(0, 3).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {movies.slice(0, 3).map((movie, i) => (
              <Link key={movie.id} to={`/movie/${movie.id}`}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl overflow-hidden group cursor-pointer h-52 border border-dark-800 hover:border-dark-600 transition-all"
                  style={{ backgroundImage: `url(https://image.tmdb.org/t/p/w780${movie.backdrop_path})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl flex items-center justify-center font-black text-dark-950 text-lg" style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
                    {i + 1}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold truncate">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-brand-400 text-xs font-semibold">★ {movie.vote_average?.toFixed(1)}</span>
                      <span className="text-dark-400 text-xs">{movie.release_date?.slice(0, 4)}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {/* All trending */}
        <h2 className="section-heading mb-6">All Trending Movies</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-12">
            {movies.map((m, i) => <MovieCard key={m.id} movie={m} index={i} />)}
          </div>
        )}

        {/* Trending actors */}
        <h2 className="section-heading">Trending Actors</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {people.slice(0, 12).map((p, i) => (
            <Link key={p.id} to={`/person/${p.id}`}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="group card overflow-hidden hover:border-dark-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="aspect-square overflow-hidden bg-dark-800">
                  {p.profile_path
                    ? <img src={img(p.profile_path, 'w185')} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>
                  }
                </div>
                <div className="p-2.5 text-center">
                  <p className="text-white text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-dark-500 text-xs">{p.known_for_department}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trending;
