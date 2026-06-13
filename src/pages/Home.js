import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTrending, getNowPlaying, getTopRated, getUpcoming, discover, discoverTV } from '../utils/tmdb';
import { INDUSTRIES } from '../utils/industries';
import MovieRow from '../components/MovieRow';
import DiscoverSearch from '../components/DiscoverSearch';

const HeroBanner = ({ movie }) => {
  if (!movie) return null;
  const bg = movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null;

  return (
    <div className="relative min-h-[85vh] flex items-end overflow-hidden">
      {bg && (
        <>
          <div className="absolute inset-0" style={{ backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center top' }} />
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-dark-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-transparent" />
        </>
      )}

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-32 w-full">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            <span className="text-brand-400 text-sm font-semibold uppercase tracking-widest">Trending Now</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display tracking-wider text-white mb-4 leading-none">
            {movie.title || movie.name}
          </h1>

          <div className="flex items-center gap-4 mb-5 flex-wrap">
            {movie.vote_average > 0 && (
              <span className="flex items-center gap-1.5 text-brand-400 font-bold text-lg">
                <span>★</span><span>{movie.vote_average.toFixed(1)}</span>
                <span className="text-dark-500 font-normal text-sm">/ 10</span>
              </span>
            )}
            {movie.release_date && <span className="text-dark-300 text-sm">{movie.release_date.slice(0, 4)}</span>}
            {movie.vote_count > 0 && <span className="text-dark-500 text-sm">{(movie.vote_count / 1000).toFixed(0)}K votes</span>}
          </div>

          <p className="text-dark-300 text-base leading-relaxed mb-8 line-clamp-3 max-w-xl">
            {movie.overview}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <Link to={`/movie/${movie.id}`} className="btn-primary text-base px-8 py-3.5">View Details</Link>
            <Link to={`/movie/${movie.id}`} className="btn-secondary text-base px-8 py-3.5">▶ Watch Trailer</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Industry quick-pick grid ────────────────────────────────────
const IndustryGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
    {INDUSTRIES.map((ind, i) => (
      <Link key={ind.id} to={`/industries?id=${ind.id}`}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${ind.glow} bg-gradient-to-br ${ind.gradient}`}
        >
          <div className="text-2xl mb-1">{ind.flag}</div>
          <p className="text-white font-bold text-xs sm:text-sm leading-tight drop-shadow">{ind.label}</p>
        </motion.div>
      </Link>
    ))}
  </div>
);

const Home = () => {
  const [trending,   setTrending]   = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [topRated,   setTopRated]   = useState([]);
  const [upcoming,   setUpcoming]   = useState([]);
  const [industryRows, setIndustryRows] = useState({});
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, n, top, u] = await Promise.all([
          getTrending('movie', 'week'),
          getNowPlaying(),
          getTopRated(),
          getUpcoming(),
        ]);
        setTrending(t.results   || []);
        setNowPlaying(n.results || []);
        setTopRated(top.results || []);
        setUpcoming(u.results   || []);

        // Load a few key industry rows
        const keyIndustries = INDUSTRIES.filter(i => ['bollywood','tollywood','kollywood','anime','cartoons','korean'].includes(i.id));
        const results = await Promise.all(keyIndustries.map(ind =>
          (ind.type === 'tv' ? discoverTV : discover)(ind.params)
        ));
        const map = {};
        keyIndustries.forEach((ind, idx) => { map[ind.id] = results[idx].results || []; });
        setIndustryRows(map);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const hero = trending[0];

  return (
    <div className="bg-dark-950 min-h-screen">
      {/* Hero */}
      <HeroBanner movie={hero} />

      {/* Discover section */}
      <div className="bg-dark-900/50 border-y border-dark-800 py-12">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-display tracking-wider text-white mb-2">FIND ANY MOVIE</h2>
            <p className="text-dark-400 text-sm">Search by name · Paste a YouTube link · Upload a screenshot or video clip</p>
          </div>
          <DiscoverSearch />
        </div>
      </div>

      {/* Industries quick grid */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-heading mb-0">🌍 Browse by Industry</h2>
          <Link to="/industries" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
            View all →
          </Link>
        </div>
        <IndustryGrid />
      </div>

      {/* Movie rows */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <MovieRow title="Trending This Week"      icon="🔥" movies={trending}   loading={loading} viewAllLink="/trending" />
        <MovieRow title="Now Playing in Theatres" icon="🎭" movies={nowPlaying} loading={loading} />

        <MovieRow title="Bollywood"  icon="🇮🇳" movies={industryRows.bollywood || []} loading={loading} viewAllLink="/industries?id=bollywood" />
        <MovieRow title="Tollywood"  icon="🎬" movies={industryRows.tollywood || []} loading={loading} viewAllLink="/industries?id=tollywood" />
        <MovieRow title="Kollywood"  icon="🎥" movies={industryRows.kollywood || []} loading={loading} viewAllLink="/industries?id=kollywood" />

        <MovieRow title="Anime"      icon="🎌" movies={(industryRows.anime || []).map(m => ({...m, media_type:'tv'}))}    loading={loading} viewAllLink="/industries?id=anime" />
        <MovieRow title="Cartoons"   icon="🎨" movies={(industryRows.cartoons || []).map(m => ({...m, media_type:'tv'}))} loading={loading} viewAllLink="/industries?id=cartoons" />
        <MovieRow title="K-Drama"    icon="🇰🇷" movies={(industryRows.korean || []).map(m => ({...m, media_type:'tv'}))}   loading={loading} viewAllLink="/industries?id=korean" />

        <MovieRow title="Top Rated of All Time" icon="⭐" movies={topRated} loading={loading} viewAllLink="/top250" />
        <MovieRow title="Coming Soon"           icon="🗓️" movies={upcoming} loading={loading} />
      </div>
    </div>
  );
};

export default Home;