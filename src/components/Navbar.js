import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { searchMulti } from '../utils/tmdb';
import { img } from '../utils/tmdb';

const Navbar = () => {
  const [scrolled, setScrolled]       = useState(false);
  const [query, setQuery]             = useState('');
  const [focused, setFocused]         = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading]         = useState(false);
  const [menuOpen, setMenuOpen]       = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const timerRef  = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // close menu on route change
  useEffect(() => {
  setMenuOpen(false);
  setQuery('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [location.pathname]);

  // debounced suggestions
  useEffect(() => {
    clearTimeout(timerRef.current);
    if (query.trim().length < 2) { setSuggestions([]); return; }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await searchMulti(query);
        const items = (data.results || [])
          .filter(r => (r.poster_path || r.profile_path) && (r.title || r.name))
          .slice(0, 7);
        setSuggestions(items);
      } catch {} finally { setLoading(false); }
    }, 280);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setFocused(false);
    setSuggestions([]);
  };

  const handleSuggestion = (item) => {
    const type = item.media_type === 'tv' ? 'tv' : item.media_type === 'person' ? 'person' : 'movie';
    navigate(`/${type}/${item.id}`);
    setQuery(''); setSuggestions([]); setFocused(false);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/trending', label: 'Trending' },
    { to: '/movies', label: 'Movies' },
    { to: '/tv-shows', label: 'TV Shows' },
    { to: '/anime',     label: 'Anime'     },
    { to: '/top250', label: 'Top 250' },
    { to: '/genres', label: 'Genres' },
    { to: '/actors', label: 'Actors' },
    { to: '/watchlist', label: 'Watchlist' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-950/95 backdrop-blur-md shadow-2xl border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
              <span className="text-dark-950 font-black text-sm">C</span>
            </div>
            <span className="font-display text-xl tracking-widest text-white hidden sm:block">
              CINE<span className="gold-text">SEARCH</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  location.pathname === l.to
                    ? 'text-brand-400 bg-brand-400/10'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Search bar */}
          <div className="relative flex-1 lg:max-w-sm xl:max-w-md">
            <form onSubmit={handleSubmit}>
              <div className="relative flex items-center">
                <svg className="absolute left-3.5 w-4 h-4 text-dark-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setTimeout(() => setFocused(false), 150)}
                  placeholder="Search movies, actors..."
                  className="w-full bg-dark-900/80 border border-dark-700 text-white placeholder-dark-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-all focus:border-brand-500 focus:bg-dark-900"
                />
                {loading && (
                  <div className="absolute right-3 w-4 h-4 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </form>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {focused && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-dark-900 border border-dark-700 rounded-xl overflow-hidden shadow-2xl z-50"
                >
                  {suggestions.map(item => {
                    const isMovie  = item.media_type !== 'person';
                    const photo    = item.poster_path || item.profile_path;
                    const title    = item.title || item.name;
                    const year     = (item.release_date || item.first_air_date || '').slice(0, 4);
                    const rating   = item.vote_average?.toFixed(1);
                    return (
                      <button
                        key={item.id}
                        onMouseDown={() => handleSuggestion(item)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-dark-800 last:border-0"
                      >
                        <div className="w-9 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark-800">
                          {photo
                            ? <img src={img(photo, 'w92')} alt={title} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-lg">{isMovie ? '🎬' : '👤'}</div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {year && <span className="text-dark-400 text-xs">{year}</span>}
                            {rating && parseFloat(rating) > 0 && <span className="text-brand-400 text-xs">★ {rating}</span>}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          item.media_type === 'person' ? 'bg-purple-500/20 text-purple-400' :
                          item.media_type === 'tv'     ? 'bg-blue-500/20 text-blue-400' :
                                                         'bg-brand-500/20 text-brand-400'
                        }`}>
                          {item.media_type === 'person' ? 'Actor' : item.media_type === 'tv' ? 'TV' : 'Movie'}
                        </span>
                      </button>
                    );
                  })}
                  <button
                    onMouseDown={handleSubmit}
                    className="w-full px-4 py-3 text-center text-sm text-brand-400 hover:bg-white/5 transition-colors font-medium"
                  >
                    See all results for "{query}" →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/discover" className="btn-secondary hidden sm:inline-flex text-xs py-2 px-3">
              🔍 Discover
            </Link>
            <Link to="/watchlist" className="btn-secondary hidden sm:inline-flex text-xs py-2 px-3">
              🎬 Watchlist
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-dark-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-dark-800 py-3 overflow-hidden"
            >
              {navLinks.map(l => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all ${
                    location.pathname === l.to ? 'text-brand-400 bg-brand-400/10' : 'text-dark-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Navbar;
