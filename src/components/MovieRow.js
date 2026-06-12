import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from './MovieCard';

const SkeletonCard = () => (
  <div className="flex-shrink-0 w-36 sm:w-40 rounded-xl overflow-hidden skeleton" style={{ aspectRatio: '2/3' }} />
);

const MovieRow = ({ title, movies = [], loading = false, viewAllLink, icon, showType = false }) => {
  const ref = useRef();
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 320, behavior: 'smooth' });

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-heading mb-0">
          {icon && <span>{icon}</span>}
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link to={viewAllLink} className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
              View all →
            </Link>
          )}
          <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-300 hover:text-white transition-all text-sm">‹</button>
          <button onClick={() => scroll(1)}  className="w-7 h-7 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-300 hover:text-white transition-all text-sm">›</button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
        {loading
          ? Array(10).fill(0).map((_, i) => <div key={i} className="flex-shrink-0 w-36 sm:w-40"><SkeletonCard /></div>)
          : movies.map((m, i) => (
            <div key={`${m.id}-${i}`} className="flex-shrink-0 w-36 sm:w-40">
              <MovieCard movie={m} index={i} showType={showType} />
            </div>
          ))
        }
      </div>
    </section>
  );
};

export default MovieRow;
