import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { img } from '../utils/tmdb';
import { useWatchlist } from '../context/WatchlistContext';

const MovieCard = ({ movie, index = 0, showType = false }) => {
  const navigate = useNavigate();
  const { toggle, isAdded } = useWatchlist();
  const [imgErr, setImgErr] = useState(false);

  const title   = movie.title || movie.name || 'Untitled';
  const year    = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const rating  = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null;
  const poster  = !imgErr && movie.poster_path ? img(movie.poster_path, 'w342') : null;
  const type    = movie.media_type === 'tv' ? 'tv' : 'movie';
  const added   = isAdded(movie.id);

  const go = () => navigate(`/${type}/${movie.id}`);

  const handleWatchlist = (e) => {
    e.stopPropagation();
    toggle({
      id: movie.id, title, year, poster: movie.poster_path,
      rating, type, vote_count: movie.vote_count,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
      onClick={go}
      className="group relative cursor-pointer rounded-xl overflow-hidden bg-dark-900 border border-dark-800 hover:border-dark-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60"
      style={{ aspectRatio: '2/3' }}
    >
      {/* Poster image */}
      {poster ? (
        <img
          src={poster}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgErr(true)}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-dark-800 gap-2">
          <span className="text-4xl">🎬</span>
          <p className="text-dark-500 text-xs text-center px-2 leading-tight">{title}</p>
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Rating badge */}
      {rating && (
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-dark-950/80 backdrop-blur-sm text-brand-400 text-xs font-bold px-2 py-1 rounded-lg">
          <span>★</span>
          <span>{rating}</span>
        </div>
      )}

      {/* Type badge */}
      {showType && movie.media_type === 'tv' && (
        <div className="absolute top-2 right-10 bg-blue-600/90 text-white text-xs font-bold px-2 py-1 rounded-lg">
          TV
        </div>
      )}

      {/* Watchlist button */}
      <button
        onClick={handleWatchlist}
        className={`absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center transition-all text-sm ${
          added
            ? 'bg-brand-500 text-dark-950'
            : 'bg-dark-950/80 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100'
        }`}
      >
        {added ? '✓' : '+'}
      </button>

      {/* Bottom info on hover */}
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-white font-semibold text-sm leading-tight truncate">{title}</p>
        {year && <p className="text-dark-400 text-xs mt-0.5">{year}</p>}
      </div>
    </motion.div>
  );
};

export default MovieCard;
