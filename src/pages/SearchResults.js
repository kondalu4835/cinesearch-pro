import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchMulti, searchPeople, img } from '../utils/tmdb';
import MovieCard from '../components/MovieCard';

const PersonCard = ({ person, index }) => (
  <Link to={`/person/${person.id}`}>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group card overflow-hidden hover:border-dark-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className="aspect-[3/4] overflow-hidden bg-dark-800">
        {person.profile_path
          ? <img src={img(person.profile_path, 'w342')} alt={person.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
        }
      </div>
      <div className="p-3">
        <p className="text-white font-semibold text-sm truncate">{person.name}</p>
        <p className="text-dark-400 text-xs mt-0.5">{person.known_for_department}</p>
        {person.known_for?.length > 0 && (
          <p className="text-dark-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {person.known_for.map(k => k.title || k.name).slice(0, 2).join(' · ')}
          </p>
        )}
      </div>
    </motion.div>
  </Link>
);

const SkeletonCard = () => (
  <div className="rounded-xl overflow-hidden">
    <div className="skeleton" style={{ aspectRatio: '2/3' }} />
    <div className="p-2 space-y-1.5">
      <div className="h-3 skeleton rounded w-3/4" />
      <div className="h-2.5 skeleton rounded w-1/2" />
    </div>
  </div>
);

const SearchResults = () => {
  const [params] = useSearchParams();
  const q    = params.get('q') || '';
  const type = params.get('type') || 'all';

  const [movies,  setMovies]  = useState([]);
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tab,     setTab]     = useState('movies');
  const [page,    setPage]    = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    setMovies([]);
    setPersons([]);
    setPage(1);

    const run = async () => {
      try {
        const [multi, people] = await Promise.all([
          searchMulti(q),
          searchPeople(q),
        ]);

        const allResults = (multi.results || []).filter(r => r.title || r.name);

        const movieResults = allResults
          .filter(r => r.media_type !== 'person')
          .filter(r => r.poster_path || r.backdrop_path)
          .filter(r => !r.vote_count || r.vote_count > 3)
          .sort((a, b) => {
            const aMatch = (a.title || a.name || '').toLowerCase() === q.toLowerCase();
            const bMatch = (b.title || b.name || '').toLowerCase() === q.toLowerCase();
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return (b.popularity || 0) - (a.popularity || 0);
          });

        const personResults = (people.results || []).filter(p => p.profile_path);

        setMovies(movieResults);
        setPersons(personResults);
        setHasMore(multi.total_pages > 1);

        // Auto switch to persons tab if type=person
        if (type === 'person' && personResults.length > 0) setTab('persons');
        else setTab('movies');

      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    run();
  }, [q, type]);

  const loadMore = async () => {
    const next = page + 1;
    setPage(next);
    try {
      const data = await searchMulti(q);
      const more = (data.results || []).filter(r => r.media_type !== 'person' && (r.poster_path || r.backdrop_path));
      setMovies(prev => [...prev, ...more]);
      setHasMore(next < data.total_pages);
    } catch {}
  };

  const tabs = [
    { id: 'movies',  label: '🎬 Movies & Shows', count: movies.length },
    { id: 'persons', label: '⭐ Actors',          count: persons.length },
  ];

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">
            {loading ? 'Searching…' : `Results for "${q}"`}
          </h1>
          <p className="text-dark-500 text-sm">
            {!loading && `${movies.length} movies · ${persons.length} people`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-dark-800 pb-4">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className="bg-dark-700 text-dark-300 text-xs px-1.5 py-0.5 rounded-md">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            {tab === 'movies' && (
              <>
                {movies.length === 0 ? (
                  <div className="text-center py-24">
                    <p className="text-5xl mb-4">🎬</p>
                    <h3 className="text-white font-semibold text-lg mb-2">No results found</h3>
                    <p className="text-dark-500 text-sm mb-6">Try a different search term or upload a screenshot</p>
                    <Link to="/" className="btn-secondary">← Back to Home</Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                      {movies.map((m, i) => <MovieCard key={`${m.id}-${i}`} movie={m} index={i} showType />)}
                    </div>
                    {hasMore && (
                      <div className="text-center mt-10">
                        <button onClick={loadMore} className="btn-secondary px-10 py-3">Load More</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {tab === 'persons' && (
              <>
                {persons.length === 0 ? (
                  <div className="text-center py-24">
                    <p className="text-5xl mb-4">👤</p>
                    <p className="text-dark-500">No actors found for this search</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {persons.map((p, i) => <PersonCard key={p.id} person={p} index={i} />)}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
