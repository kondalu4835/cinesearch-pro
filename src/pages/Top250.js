import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { img } from '../utils/tmdb';

const Top250 = () => {
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const pages = await Promise.all([1,2,3,4,5].map(p =>
          fetch(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.REACT_APP_TMDB_KEY}&page=${p}`).then(r => r.json())
        ));
        const all = pages.flatMap(p => p.results || []);
        setMovies(all.slice(0, 250));
      } catch { } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">TOP 250 MOVIES</h1>
          <p className="text-dark-400 text-sm mt-1">The greatest films of all time ranked by user ratings</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array(10).fill(0).map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {movies.map((movie, i) => (
              <Link key={movie.id} to={`/movie/${movie.id}`}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.01, 0.5) }}
                  className="flex items-center gap-4 p-3 rounded-xl border border-dark-800 hover:border-dark-600 hover:bg-dark-900/60 transition-all group cursor-pointer"
                >
                  {/* Rank */}
                  <div className={`w-10 text-center flex-shrink-0 font-black text-lg ${
                    i < 3 ? 'gold-text' : i < 10 ? 'text-dark-300' : 'text-dark-600'
                  }`}>
                    {i + 1}
                  </div>

                  {/* Poster */}
                  <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800">
                    {movie.poster_path
                      ? <img src={img(movie.poster_path, 'w92')} alt={movie.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">🎬</div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm group-hover:text-brand-400 transition-colors truncate">
                      {movie.title}
                    </p>
                    <p className="text-dark-500 text-xs mt-0.5">
                      {movie.release_date?.slice(0, 4)}
                      {movie.vote_count > 0 && ` · ${(movie.vote_count / 1000).toFixed(0)}K votes`}
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-brand-400 font-bold text-sm">★</span>
                    <span className="text-white font-bold text-sm">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Top250;
