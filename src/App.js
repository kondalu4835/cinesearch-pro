import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WatchlistProvider } from './context/WatchlistContext';
import Navbar from './components/Navbar';
import { Watchlist, Movies, TVShows, Discover,Anime } from './pages/ExtraPages';

const Home         = lazy(() => import('./pages/Home'));
const SearchResults= lazy(() => import('./pages/SearchResults'));
const MovieDetail  = lazy(() => import('./pages/MovieDetail'));
const PersonDetail = lazy(() => import('./pages/PersonDetail'));
const Trending     = lazy(() => import('./pages/Trending'));
const Genres       = lazy(() => import('./pages/Genres'));
const Actors       = lazy(() => import('./pages/Actors'));
const Top250       = lazy(() => import('./pages/Top250'));
const Industries    = lazy(() => import('./pages/Industries'));

const Loader = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      <p className="text-dark-500 text-sm tracking-widest uppercase">Loading</p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-dark-950 border-t border-dark-800 py-10 mt-16">
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fbbf24,#d97706)' }}>
            <span className="text-dark-950 font-black text-xs">C</span>
          </div>
          <span className="font-display text-lg tracking-widest text-white">
            CINE<span className="text-brand-400">SEARCH</span>
          </span>
        </div>
        <p className="text-dark-600 text-xs text-center">
          Powered by TMDB API · Movie data © The Movie Database
        </p>
        <div className="flex items-center gap-4 text-dark-600 text-xs">
          <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="hover:text-dark-300 transition-colors">TMDB</a>
          <span>·</span>
          <span>© {new Date().getFullYear()} CineSearch</span>
        </div>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <WatchlistProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#181818',
              color: '#e8e8e8',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              fontSize: '13px',
              padding: '12px 16px',
            },
            success: { iconTheme: { primary: '#f59e0b', secondary: '#000' } },
            error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            loading: { iconTheme: { primary: '#f59e0b', secondary: '#000' } },
          }}
        />
        <Navbar />
        <main>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/"           element={<Home />} />
              <Route path="/search"     element={<SearchResults />} />
              <Route path="/movie/:id"  element={<MovieDetail />} />
              <Route path="/tv/:id"     element={<MovieDetail />} />
              <Route path="/person/:id" element={<PersonDetail />} />
              <Route path="/trending"   element={<Trending />} />
              <Route path="/genres"     element={<Genres />} />
              <Route path="/actors"     element={<Actors />} />
              <Route path="/top250"     element={<Top250 />} />
              <Route path="/watchlist"  element={<Watchlist />} />
              <Route path="/movies"     element={<Movies />} />
              <Route path="/tv-shows"   element={<TVShows />} />
              <Route path="/discover"   element={<Discover />} />
              <Route path="/anime"      element={<Anime />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="*"           element={<Home />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </BrowserRouter>
    </WatchlistProvider>
  );
}

export default App;
