import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTrendingPeople, searchPeople, img } from '../utils/tmdb';
import toast from 'react-hot-toast';

const Actors = () => {
  const [people,   setPeople]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [query,    setQuery]    = useState('');
  const [searching,setSearching]= useState(false);

  useEffect(() => {
    getTrendingPeople().then(d => setPeople(d.results || [])).finally(() => setLoading(false));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const data = await searchPeople(query);
      const results = data.results || [];
      setPeople(results);
      if (!results.length) toast.error('No actors found');
    } finally { setSearching(false); }
  };

  const quickNames = ['Allu Arjun','Shah Rukh Khan','Vijay','Prabhas','Rajinikanth','Deepika Padukone','Tom Cruise','Leonardo DiCaprio'];

  return (
    <div className="min-h-screen bg-dark-950 pt-20 pb-16">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display tracking-wider text-white">ACTORS & DIRECTORS</h1>
          <p className="text-dark-400 text-sm mt-1">Search any actor to see their full filmography</p>

          <form onSubmit={handleSearch} className="flex gap-3 mt-5 max-w-lg">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Actor, actress, director…" className="input pl-10" />
            </div>
            <button type="submit" disabled={searching} className="btn-primary disabled:opacity-50">
              {searching ? <span className="w-4 h-4 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" /> : 'Search'}
            </button>
            {query && (
              <button type="button" onClick={() => { setQuery(''); getTrendingPeople().then(d => setPeople(d.results || [])); }} className="btn-secondary">Reset</button>
            )}
          </form>

          <div className="flex flex-wrap gap-2 mt-4">
            {quickNames.map(name => (
              <button key={name}
                onClick={() => { setQuery(name); setSearching(true); searchPeople(name).then(d => setPeople(d.results || [])).finally(() => setSearching(false)); }}
                className="text-xs bg-dark-800 hover:bg-dark-700 border border-dark-700 text-dark-300 hover:text-white px-3 py-1.5 rounded-full transition-all">
                {name}
              </button>
            ))}
          </div>
        </div>

        <h2 className="section-heading">{query ? `Results for "${query}"` : '🔥 Trending Actors'}</h2>

        {loading || searching ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => <div key={i} className="rounded-xl overflow-hidden"><div className="skeleton" style={{ aspectRatio: '3/4' }} /></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {people.map((p, i) => (
              <Link key={p.id} to={`/person/${p.id}`}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="group card overflow-hidden hover:border-dark-600 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="aspect-[3/4] overflow-hidden bg-dark-800">
                    {p.profile_path
                      ? <img src={img(p.profile_path, 'w342')} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                    }
                  </div>
                  <div className="p-3">
                    <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                    <p className="text-dark-400 text-xs mt-0.5">{p.known_for_department}</p>
                    {p.known_for?.length > 0 && (
                      <p className="text-dark-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {p.known_for.map(k => k.title || k.name).slice(0, 2).join(' · ')}
                      </p>
                    )}
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

export default Actors;
