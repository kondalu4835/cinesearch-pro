import React from 'react';
import { useNavigate } from 'react-router-dom';

const SuggestionDropdown = ({ suggestions, query, onSelect }) => {
  const navigate = useNavigate();

  const handleClick = (item) => {
    const type = item.media_type === 'tv'
      ? 'tv'
      : item.media_type === 'person'
      ? 'person'
      : 'movie';
    if (onSelect) onSelect();
    navigate(`/${type}/${item.id}`);
  };

  const handleSeeAll = (e) => {
    e.preventDefault();
    if (onSelect) onSelect();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  if (!suggestions.length) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-dark-700 rounded-xl overflow-hidden shadow-2xl z-50">
      {suggestions.map(item => {
        const photo  = item.poster_path || item.profile_path;
        const title  = item.title || item.name;
        const year   = (item.release_date || item.first_air_date || '').slice(0, 4);
        const rating = item.vote_average?.toFixed(1);
        const type   = item.media_type === 'tv'
          ? 'tv'
          : item.media_type === 'person'
          ? 'person'
          : 'movie';

        return (
          <button
            key={item.id}
            onMouseDown={() => handleClick(item)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-dark-800 last:border-0"
          >
            {/* Thumbnail */}
            <div className="w-9 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800">
              {photo ? (
                <img
                  src={`https://image.tmdb.org/t/p/w92${photo}`}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  {type === 'person' ? '👤' : '🎬'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {year && (
                  <span className="text-dark-400 text-xs">{year}</span>
                )}
                {rating && parseFloat(rating) > 0 && (
                  <span className="text-brand-400 text-xs">★ {rating}</span>
                )}
              </div>
            </div>

            {/* Type badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
              type === 'person'
                ? 'bg-purple-500/20 text-purple-400'
                : type === 'tv'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-brand-500/20 text-brand-400'
            }`}>
              {type === 'person' ? 'Actor' : type === 'tv' ? 'TV' : 'Movie'}
            </span>
          </button>
        );
      })}

      {/* See all */}
      <button
        onMouseDown={handleSeeAll}
        className="w-full px-4 py-3 text-center text-sm text-brand-400 hover:bg-white/5 transition-colors font-medium"
      >
        See all results for "{query}" →
      </button>
    </div>
  );
};

export default SuggestionDropdown;