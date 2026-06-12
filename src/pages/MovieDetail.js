import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMovie, getTV, img, backdrop } from '../utils/tmdb';
import StreamingPlatforms from '../components/StreamingPlatforms';
import MovieRow from '../components/MovieRow';
import { useWatchlist } from '../context/WatchlistContext';

const Skeleton = () => (
  <div className="min-h-screen bg-dark-950 pt-16">
    <div className="h-[55vh] skeleton" />
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1"><div className="aspect-[2/3] skeleton rounded-2xl" /></div>
      <div className="lg:col-span-3 space-y-4">
        {[80,60,40,90,50].map((w,i) => <div key={i} className={`h-5 skeleton rounded w-${w === 80 ? 'full' : w+'%'}`} />)}
      </div>
    </div>
  </div>
);

const MovieDetail = () => {
  const { id }       = useParams();
  const location     = useLocation();
  const isTV         = location.pathname.startsWith('/tv/');
  const { toggle, isAdded } = useWatchlist();

  const [movie,         setMovie]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [showTrailer,   setShowTrailer]   = useState(false);
  

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setMovie(null);
    const fn = isTV ? getTV : getMovie;
    fn(id).then(setMovie).catch(console.error).finally(() => setLoading(false));
  }, [id, isTV]);

  if (loading) return <Skeleton />;
  if (!movie) return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center pt-16">
      <div className="text-center">
        <p className="text-5xl mb-4">🎬</p>
        <h2 className="text-xl font-bold text-white mb-2">Not found</h2>
        <Link to="/" className="text-brand-400 hover:text-brand-300 text-sm">← Go home</Link>
      </div>
    </div>
  );

  const title      = movie.title || movie.name;
  const year       = (movie.release_date || movie.first_air_date || '').slice(0, 4);
  const runtime    = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : (movie.episode_run_time?.[0] ? `${movie.episode_run_time[0]}m / ep` : '');
  const trailer    = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast       = movie.credits?.cast?.slice(0, 14) || [];
  const crew       = movie.credits?.crew?.filter(c => ['Director','Screenplay','Story','Producer'].includes(c.job)).slice(0, 4) || [];
  const similar    = (movie.similar?.results || movie.recommendations?.results || []).slice(0, 12);
  const bg         = backdrop(movie.backdrop_path);
  const added      = isAdded(movie.id);

  const score = movie.vote_average?.toFixed(1);
  const scoreColor = score >= 7 ? '#10b981' : score >= 5 ? '#f59e0b' : '#ef4444';

  return (
    <div className="bg-dark-950 min-h-screen pt-16">
      {/* Backdrop hero */}
      <div className="relative h-[55vh] overflow-hidden">
        {bg ? (
          <>
            <img src={bg} alt="" className="w-full h-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-dark-950/40" />
          </>
        ) : <div className="w-full h-full bg-dark-900" />}

        {/* Play trailer overlay button */}
        {trailer && (
          <button onClick={() => setShowTrailer(true)}
            className="absolute inset-0 flex items-center justify-center group">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-2xl group-hover:bg-white/20 group-hover:scale-110 transition-all">
              ▶
            </div>
          </button>
        )}
      </div>

      {/* Trailer modal */}
      {showTrailer && trailer && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setShowTrailer(false)}>
          <div className="w-full max-w-5xl aspect-video" onClick={e => e.stopPropagation()}>
            <iframe src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`} className="w-full h-full rounded-2xl" allowFullScreen title="trailer" />
          </div>
          <button onClick={() => setShowTrailer(false)} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-dark-800 text-white flex items-center justify-center hover:bg-dark-700 transition-all">✕</button>
        </div>
      )}

      {/* Main content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left: Poster + quick info */}
          <div className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Poster */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-dark-800">
                {movie.poster_path
                  ? <img src={img(movie.poster_path, 'w500')} alt={title} className="w-full" />
                  : <div className="aspect-[2/3] bg-dark-800 flex items-center justify-center text-5xl">🎬</div>
                }
              </div>

              {/* Score */}
              {score && (
                <div className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="text-dark-400 text-xs mb-1">User Score</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black" style={{ color: scoreColor }}>{score}</span>
                      <span className="text-dark-500 text-sm">/ 10</span>
                    </div>
                    <p className="text-dark-500 text-xs mt-0.5">{movie.vote_count?.toLocaleString()} votes</p>
                  </div>
                  <svg className="w-14 h-14" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#282828" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={scoreColor} strokeWidth="2.5"
                      strokeDasharray={`${(parseFloat(score) / 10) * 100} 100`}
                      strokeLinecap="round" transform="rotate(-90 18 18)" />
                  </svg>
                </div>
              )}

              {/* Quick info */}
              <div className="card p-4 space-y-3">
                {[
                  { label: 'Status',    val: movie.status },
                  { label: 'Year',      val: year },
                  { label: 'Runtime',   val: runtime },
                  { label: 'Language',  val: movie.original_language?.toUpperCase() },
                  { label: 'Budget',    val: movie.budget > 0 ? `$${(movie.budget/1e6).toFixed(1)}M` : null },
                  { label: 'Box Office',val: movie.revenue > 0 ? `$${(movie.revenue/1e6).toFixed(1)}M` : null },
                ].filter(i => i.val).map(i => (
                  <div key={i.label} className="flex justify-between items-center text-sm">
                    <span className="text-dark-400">{i.label}</span>
                    <span className="text-white font-medium">{i.val}</span>
                  </div>
                ))}
              </div>

              {/* Watchlist button */}
              <button
                onClick={() => toggle({ id: movie.id, title, year, poster: movie.poster_path, rating: score, type: isTV ? 'tv' : 'movie' })}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                  added ? 'bg-brand-500/20 border border-brand-500/40 text-brand-400' : 'btn-secondary'
                }`}
              >
                {added ? '✓ In Watchlist' : '+ Add to Watchlist'}
              </button>
            </motion.div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map(g => (
                  <Link key={g.id} to={`/genres?id=${g.id}`}
                    className="text-xs bg-dark-800 hover:bg-dark-700 border border-dark-700 hover:border-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-full transition-all">
                    {g.name}
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl font-display tracking-wider text-white mb-2">{title.toUpperCase()}</h1>
              {movie.tagline && <p className="text-brand-400 text-base italic mb-6">"{movie.tagline}"</p>}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mb-8">
                {trailer && (
                  <button onClick={() => setShowTrailer(true)} className="btn-primary">
                    ▶ Watch Trailer
                  </button>
                )}
                <a href={`https://www.google.com/search?q=${encodeURIComponent(title + ' watch online')}`}
                  target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  🔍 Find Online
                </a>
                {movie.homepage && (
                  <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                    🌐 Official Site
                  </a>
                )}
              </div>

              {/* Overview */}
              <div className="mb-8">
                <h3 className="text-white font-semibold mb-2">Overview</h3>
                <p className="text-dark-300 leading-relaxed text-sm sm:text-base">{movie.overview || 'No overview available.'}</p>
              </div>

              {/* Crew */}
              {crew.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {crew.map(c => (
                    <div key={`${c.id}-${c.job}`}>
                      <p className="text-white font-semibold text-sm">{c.name}</p>
                      <p className="text-dark-400 text-xs">{c.job}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Streaming */}
              <div className="mb-8">
                <StreamingPlatforms providers={movie['watch/providers']} />
              </div>

              {/* Cast */}
              {cast.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-4">Cast</h3>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {cast.map(actor => (
                      <Link key={actor.id} to={`/person/${actor.id}`} className="flex-shrink-0 group">
                        <div className="w-20">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-dark-800 mb-2 border border-dark-700 group-hover:border-brand-500 transition-all">
                            {actor.profile_path
                              ? <img src={img(actor.profile_path, 'w185')} alt={actor.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              : <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                            }
                          </div>
                          <p className="text-white text-xs font-medium text-center leading-tight truncate">{actor.name}</p>
                          <p className="text-dark-500 text-xs text-center truncate">{actor.character}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {movie.keywords?.keywords?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-white font-semibold mb-3 text-sm">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.keywords.keywords.slice(0, 12).map(k => (
                      <span key={k.id} className="text-xs text-dark-400 bg-dark-800 border border-dark-700 px-3 py-1 rounded-full">{k.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Similar movies */}
        {similar.length > 0 && (
          <div className="mt-12">
            <MovieRow title="More Like This" icon="🎯" movies={similar} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;
