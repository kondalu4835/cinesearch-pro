import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWatchlist } from '../context/WatchlistContext';
import { discover, discoverTV } from '../utils/tmdb';
import MovieCard from '../components/MovieCard';
import DiscoverSearch from '../components/DiscoverSearch';

// ─── Watchlist ────────────────────────────────────────────────────
export const Watchlist = () => {
  const { watchlist, toggle } = useWatchlist();

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">MY WATCHLIST</h1>
            <p className="text-dark-400 text-sm mt-1">{watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved</p>
          </div>
          {watchlist.length > 0 && (
            <button onClick={() => { if(window.confirm('Clear entire watchlist?')) { localStorage.removeItem('cs_wl'); window.location.reload(); } }}
              className="btn-secondary text-sm text-red-400 hover:text-red-300">Clear All</button>
          )}
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-6xl mb-5">🎬</p>
            <h3 className="text-xl font-bold text-white mb-2">Your watchlist is empty</h3>
            <p className="text-dark-500 text-sm mb-8">Add movies and shows you want to watch later</p>
            <Link to="/" className="btn-primary">Browse Movies</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/${item.type || 'movie'}/${item.id}`}>
                  <div className="group relative card overflow-hidden hover:border-dark-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ aspectRatio: '2/3' }}>
                    {item.poster
                      ? <img src={`https://image.tmdb.org/t/p/w342${item.poster}`} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full bg-dark-800 flex items-center justify-center text-4xl">🎬</div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); toggle(item); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-600/90 hover:bg-red-500 rounded-lg flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-all">
                      ✕
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white font-semibold text-xs truncate">{item.title}</p>
                      {item.year && <p className="text-dark-400 text-xs">{item.year}</p>}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Movies browse ────────────────────────────────────────────────
export const Movies = () => {
  const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang');
  const [movies,  setMovies]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState('popularity.desc');
  const [page,    setPage]    = useState(1);

  const langLabels = { hi: 'Bollywood', ta: 'Kollywood', te: 'Tollywood', ml: 'Malayalam' };

  useEffect(() => {
    setLoading(true); setPage(1);
    discover({ sort_by: sort, ...(lang ? { with_original_language: lang } : {}) })
      .then(d => setMovies(d.results || [])).finally(() => setLoading(false));
  }, [sort, lang]);

  const loadMore = async () => {
    const next = page + 1; setPage(next);
    const data = await discover({ sort_by: sort, page: next, ...(lang ? { with_original_language: lang } : {}) });
    setMovies(prev => [...prev, ...(data.results || [])]);
  };

  const title = lang ? (langLabels[lang] || 'Movies') : 'All Movies';

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">{title.toUpperCase()}</h1>
            <p className="text-dark-400 text-sm mt-1">Browse and discover films</p>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input w-auto text-sm py-2">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="release_date.desc">Newest First</option>
            <option value="revenue.desc">Highest Grossing</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(18).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={m} index={i} />)}
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

// ─── TV Shows ─────────────────────────────────────────────────────
export const TVShows = () => {
  const [shows,   setShows]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort,    setSort]    = useState('popularity.desc');
  const [page,    setPage]    = useState(1);

  useEffect(() => {
    setLoading(true); setPage(1);
    discoverTV({ sort_by: sort }).then(d => setShows(d.results || [])).finally(() => setLoading(false));
  }, [sort]);

  const loadMore = async () => {
    const next = page + 1; setPage(next);
    const data = await discoverTV({ sort_by: sort, page: next });
    setShows(prev => [...prev, ...(data.results || [])]);
  };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-display tracking-wider text-white">TV SHOWS</h1>
            <p className="text-dark-400 text-sm mt-1">Series, web shows and more</p>
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)} className="input w-auto text-sm py-2">
            <option value="popularity.desc">Most Popular</option>
            <option value="vote_average.desc">Highest Rated</option>
            <option value="first_air_date.desc">Newest First</option>
          </select>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(18).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {shows.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={{ ...m, media_type: 'tv' }} index={i} />)}
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

// ─── Discover (Smart Search) ──────────────────────────────────────
export const Discover = () => (
  <div className="min-h-screen bg-dark-950 pt-20 pb-16">
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display tracking-wider text-white mb-3">DISCOVER</h1>
        <p className="text-dark-400">Search by name · YouTube link · Screenshot · Video clip</p>
      </div>
      <DiscoverSearch />
    </div>
  </div>
);
// ─── Anime & Cartoons ─────────────────────────────────────────────
export const Anime = () => {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('anime');
  const [page,    setPage]    = useState(1);

  const load = (type, p = 1) => {
    setLoading(true);
    const params = type === 'anime'
      ? { with_genres: 16, with_origin_country: 'JP', sort_by: 'popularity.desc', page: p }
      : { with_genres: 16, sort_by: 'popularity.desc', page: p };
    discoverTV(params)
      .then(d => setItems(prev => p === 1 ? (d.results || []) : [...prev, ...(d.results || [])]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { setPage(1); load(tab, 1); }, [tab]);

  const loadMore = () => { const next = page + 1; setPage(next); load(tab, next); };

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">ANIME & CARTOONS</h1>
          <p className="text-dark-400 text-sm mt-1">Japanese anime and animated shows</p>
        </div>

        <div className="flex gap-2 mb-8">
          {[['anime','🎌 Anime'],['cartoon','🎨 Cartoons']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === id ? 'btn-primary' : 'btn-secondary'
              }`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(18).fill(0).map((_, i) => <div key={i} className="skeleton rounded-xl" style={{ aspectRatio: '2/3' }} />)}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={{ ...m, media_type: 'tv' }} index={i} />)}
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