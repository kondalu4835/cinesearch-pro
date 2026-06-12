import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getPerson, img } from '../utils/tmdb';
import MovieCard from '../components/MovieCard';

const PersonDetail = () => {
  const { id } = useParams();
  const [person,  setPerson]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('movies');
  const [showBio, setShowBio] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    getPerson(id).then(setPerson).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!person) return (
    <div className="min-h-screen bg-dark-950 pt-20 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">👤</p>
        <h2 className="text-xl font-bold text-white mb-3">Person not found</h2>
        <Link to="/" className="btn-secondary">← Go Home</Link>
      </div>
    </div>
  );

  const movies  = (person.movie_credits?.cast || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const tvShows = (person.tv_credits?.cast   || []).sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  const photos  = person.images?.profiles?.slice(0, 12) || [];
  const social  = person.external_ids || {};
  const age     = person.birthday
    ? Math.floor((new Date() - new Date(person.birthday)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const tabs = [
    { id: 'movies',  label: '🎬 Movies',   count: movies.length },
    { id: 'tv',      label: '📺 TV Shows',  count: tvShows.length },
    { id: 'photos',  label: '📸 Photos',    count: photos.length },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top section */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row gap-8 mb-12">

          {/* Photo */}
          <div className="flex-shrink-0 mx-auto sm:mx-0">
            <div className="w-52 sm:w-64 rounded-2xl overflow-hidden shadow-2xl border border-dark-800">
              {person.profile_path
                ? <img src={img(person.profile_path, 'w500')} alt={person.name} className="w-full" />
                : <div className="aspect-[2/3] bg-dark-800 flex items-center justify-center text-5xl">👤</div>
              }
            </div>

            {/* Social links */}
            <div className="flex gap-2 mt-4 justify-center sm:justify-start flex-wrap">
              {social.imdb_id && (
                <a href={`https://www.imdb.com/name/${social.imdb_id}`} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3">IMDB</a>
              )}
              {social.instagram_id && (
                <a href={`https://instagram.com/${social.instagram_id}`} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3">Instagram</a>
              )}
              {social.twitter_id && (
                <a href={`https://twitter.com/${social.twitter_id}`} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-xs py-1.5 px-3">Twitter / X</a>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            {/* Dept badge */}
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              ⭐ {person.known_for_department}
            </div>

            <h1 className="text-4xl sm:text-5xl font-display tracking-wider text-white mb-6">
              {person.name.toUpperCase()}
            </h1>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: '🎬', label: 'Movies',    value: movies.length },
                { icon: '📺', label: 'TV Shows',  value: tvShows.length },
                { icon: '🔥', label: 'Popularity',value: Math.round(person.popularity || 0) },
                { icon: '🎂', label: 'Age',        value: age || 'N/A' },
              ].map(s => (
                <div key={s.label} className="card p-4 text-center">
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-xl font-bold text-white">{s.value}</div>
                  <div className="text-dark-500 text-xs">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Personal info */}
            <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                { label: 'Born',        value: person.birthday },
                { label: 'Birthplace',  value: person.place_of_birth },
                { label: 'Died',        value: person.deathday },
              ].filter(i => i.value).map(i => (
                <div key={i.label} className="flex flex-col gap-0.5">
                  <span className="text-dark-500 text-xs uppercase tracking-wider">{i.label}</span>
                  <span className="text-white text-sm">{i.value}</span>
                </div>
              ))}
            </div>

            {/* Bio */}
            {person.biography && (
              <div>
                <h3 className="text-white font-semibold mb-2">Biography</h3>
                <p className="text-dark-300 text-sm leading-relaxed">
                  {showBio ? person.biography : person.biography.slice(0, 500) + (person.biography.length > 500 ? '…' : '')}
                </p>
                {person.biography.length > 500 && (
                  <button onClick={() => setShowBio(!showBio)} className="text-brand-400 hover:text-brand-300 text-sm mt-2 transition-colors">
                    {showBio ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-dark-800 pb-4">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {t.label}
              {t.count > 0 && <span className="bg-dark-700 text-dark-300 text-xs px-1.5 py-0.5 rounded-md">{t.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {tab === 'movies' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {movies.filter(m => m.poster_path).map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={m} index={i} />)}
            </div>
          )}
          {tab === 'tv' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {tvShows.filter(m => m.poster_path).map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={{ ...m, media_type: 'tv' }} index={i} />)}
            </div>
          )}
          {tab === 'photos' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {photos.map((p, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-dark-800 hover:border-dark-600 transition-all">
                  <img src={img(p.file_path, 'w342')} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PersonDetail;
