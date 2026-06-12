import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  searchByImage, searchByVideo,
  searchByYouTubeURL, detectLinkType, analyzePrompt
} from '../utils/gemini';
import useSearchSuggestions from '../hooks/useSearchSuggestions.js';
import SuggestionDropdown from './SuggestionDropdown';

const isURL = (s) => { try { new URL(s); return true; } catch { return false; } };

const DiscoverSearch = ({ compact = false }) => {
  const navigate = useNavigate();
  const [mode,     setMode]     = useState('text');
  const [query,    setQuery]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [dragging, setDragging] = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [status,   setStatus]   = useState('');
  const imgRef   = useRef(null);
  const videoRef = useRef(null);

  const {
    suggestions, loading: suggLoading,
    show, setShow, dropRef
  } = useSearchSuggestions(query);

  // Paste image from clipboard
  useEffect(() => {
    const onPaste = (e) => {
      if (mode !== 'image') return;
      const items = Array.from(e.clipboardData?.items || []);
      const imgItem = items.find(i => i.type.startsWith('image/'));
      if (imgItem) {
        e.preventDefault();
        processFile(imgItem.getAsFile());
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Clean up preview object URL
  useEffect(() => {
    return () => { if (preview?.url) URL.revokeObjectURL(preview.url); };
  }, [preview]);

  const processFile = async (file) => {
    if (!file) return;
    const isImg = file.type.startsWith('image/');
    const isVid = file.type.startsWith('video/');

    if (!isImg && !isVid) {
      toast.error('Please upload an image or video file');
      return;
    }
    if (isImg && file.size > 15 * 1024 * 1024) {
      toast.error('Image too large — max 15 MB');
      return;
    }
    if (isVid && file.size > 100 * 1024 * 1024) {
      toast.error('Video too large — max 100 MB');
      return;
    }

    // Show preview
    setPreview({
      url: URL.createObjectURL(file),
      type: isVid ? 'video' : 'image',
      name: file.name
    });
    setLoading(true);

    // Status steps
    const steps = isVid
      ? ['Extracting video frames…', 'Analyzing scenes with AI…', 'Searching movie database…']
      : ['Reading image…', 'Identifying with AI…', 'Searching movie database…'];
    let stepIdx = 0;
    setStatus(steps[0]);
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setStatus(steps[stepIdx]);
    }, 3500);

    try {
      const result = isVid
        ? await searchByVideo(file)
        : await searchByImage(file);

      clearInterval(interval);
      console.log('🎯 Final result:', JSON.stringify(result, null, 2));

      // API completely failed
      if (result?.gemini_failed) {
        toast.error(
          '⚠️ AI quota exceeded. Get a new API key at aistudio.google.com',
          { duration: 8000 }
        );
        setLoading(false);
        setStatus('');
        return;
      }

      // Clean person name
      const personName = (result?.person_name || '')
        .trim()
        .replace(/^null$/i, '')
        .replace(/^undefined$/i, '');

      // Clean movie name
      const movieName = (result?.movie_name || '')
        .trim()
        .replace(/^null$/i, '')
        .replace(/^undefined$/i, '');

      // Filter valid search queries
      const badWords = ['movie','film','actor','video','scene','clip','image','photo','unknown','null'];
      const goodQueries = (result?.search_queries || []).filter(q =>
        q && q.trim().length > 2 &&
        !badWords.includes(q.trim().toLowerCase())
      );

      // Person identified → go directly to actor page
      if (personName.length > 1) {
        toast.loading(`🔍 Finding ${personName}…`, { id: 'result' });
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/person` +
            `?api_key=${process.env.REACT_APP_TMDB_KEY}` +
            `&query=${encodeURIComponent(personName)}`
          );
          const data = await res.json();
          const person = data.results?.[0];
          if (person?.id) {
            toast.success(`👤 ${personName} — showing movies`, { id: 'result' });
            navigate(`/person/${person.id}`);
            return;
          }
        } catch (e) {
          console.warn('Person search failed:', e);
        }
        toast.success(`Searching: ${personName}`, { id: 'result' });
        navigate(`/search?q=${encodeURIComponent(personName)}&type=person`);
        return;
      }

      // Movie identified → search TMDB and go to movie page directly
      if (movieName.length > 1) {
        toast.loading(`🔍 Finding ${movieName}…`, { id: 'result' });
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/search/movie` +
            `?api_key=${process.env.REACT_APP_TMDB_KEY}` +
            `&query=${encodeURIComponent(movieName)}`
          );
          const data = await res.json();
          const movie = data.results?.[0];
          if (movie?.id) {
            toast.success(`🎬 ${movie.title} found!`, { id: 'result' });
            navigate(`/movie/${movie.id}`);
            return;
          }
        } catch (e) {
          console.warn('Movie search failed:', e);
        }
        toast.success(`Searching: ${movieName}`, { id: 'result' });
        navigate(`/search?q=${encodeURIComponent(movieName)}`);
        return;
      }

      // Use search queries as last fallback
      if (goodQueries.length > 0) {
        toast(`🔍 Showing best matches`, { icon: '🎬' });
        navigate(`/search?q=${encodeURIComponent(goodQueries[0])}`);
        return;
      }

      // Nothing at all
      toast.error(
        '😕 Could not identify. Try a clearer screenshot with better lighting.',
        { duration: 5000 }
      );

    } catch (err) {
      clearInterval(interval);
      console.error('processFile error:', err);
      toast.error('Analysis failed — please try again');
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const handleTextSearch = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    setShow(false);
    setLoading(true);
    try {
      if (isURL(q)) {
        const type = detectLinkType(q);
        if (type === 'youtube') {
          toast.loading('Analyzing YouTube link…', { id: 'yt' });
          const r = await searchByYouTubeURL(q);
          toast.dismiss('yt');
          if (r?.movie_name) {
            toast.success(`Found: ${r.movie_name}`);
            navigate(`/search?q=${encodeURIComponent(r.movie_name)}`);
          } else {
            toast.error('Could not identify from this YouTube link');
          }
          return;
        }
        if (type === 'instagram') {
          toast('💡 Download the reel and upload the video file for best results!', { duration: 5000, icon: 'ℹ️' });
          return;
        }
        navigate(`/search?q=${encodeURIComponent(q)}`);
        return;
      }

      const isDesc = q.length > 20 && (
        /movie (where|about|with|when)/i.test(q) ||
        q.includes('scene') || q.includes('like')
      );
      if (isDesc) {
        const r = await analyzePrompt(q);
        navigate(`/search?q=${encodeURIComponent(r?.search_query || q)}`);
        return;
      }
      navigate(`/search?q=${encodeURIComponent(q)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const tabs = [
    { id: 'text',  icon: '🔍', label: 'Search'     },
    { id: 'image', icon: '🖼️', label: 'Screenshot' },
    { id: 'video', icon: '🎬', label: 'Video Clip'  },
  ];

  return (
    <div className={`w-full ${compact ? 'max-w-2xl' : 'max-w-3xl'} mx-auto`}>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 justify-center">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => { setMode(t.id); setPreview(null); setLoading(false); setStatus(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === t.id ? 'btn-primary' : 'btn-secondary'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:block">{t.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ── TEXT ── */}
        {mode === 'text' && (
          <motion.div key="text"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <form onSubmit={handleTextSearch}>
              <div className="flex gap-3">
                {/* Input + suggestions */}
                <div className="relative flex-1" ref={dropRef}>
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500 pointer-events-none"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => suggestions.length > 0 && setShow(true)}
                    placeholder={compact
                      ? 'Search movies, actors, shows…'
                      : 'Search, paste YouTube link, or describe a movie scene…'}
                    className="input pl-12 text-base py-4 w-full"
                  />
                  {(suggLoading || loading) && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2
                      border-brand-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {query && isURL(query) && (
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs
                      bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full">
                      {detectLinkType(query)}
                    </span>
                  )}
                  {/* Suggestions dropdown */}
                  {show && (
                    <SuggestionDropdown
                      suggestions={suggestions}
                      query={query}
                      loading={suggLoading}
                      onSelect={() => { setQuery(''); setShow(false); }}
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="btn-primary px-6 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading
                    ? <span className="w-5 h-5 border-2 border-dark-900/40 border-t-dark-900 rounded-full animate-spin" />
                    : 'Search'}
                </button>
              </div>

              {/* Quick chips */}
              {!compact && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['Allu Arjun','Pushpa 2','KGF Chapter 2','Prabhas','RRR','Avengers Endgame','Shah Rukh Khan','Vijay'].map(chip => (
                    <button key={chip} type="button"
                      onClick={() => navigate(`/search?q=${encodeURIComponent(chip)}`)}
                      className="text-xs bg-dark-800 hover:bg-dark-700 border border-dark-700
                        hover:border-dark-600 text-dark-300 hover:text-white px-3 py-1.5 rounded-full transition-all">
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* ── IMAGE ── */}
        {mode === 'image' && (
          <motion.div key="image"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <input
              ref={imgRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/*"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
                e.target.value = '';
              }}
            />
            <div
              onClick={() => !loading && imgRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                loading   ? 'border-dark-600 bg-dark-900/50 cursor-wait' :
                dragging  ? 'border-brand-400 bg-brand-500/10 cursor-copy' :
                            'border-dark-700 hover:border-brand-500/60 hover:bg-dark-900/50 cursor-pointer'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-4 pointer-events-none">
                  <div className="w-14 h-14 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-white font-semibold mb-1">{status}</p>
                    <p className="text-dark-500 text-sm">This may take 10–20 seconds</p>
                  </div>
                </div>
              ) : preview ? (
                <div className="flex flex-col items-center gap-4">
                  <img src={preview.url} alt="preview"
                    className="max-h-56 rounded-xl object-contain border border-dark-700 mx-auto" />
                  <p className="text-dark-400 text-sm truncate max-w-xs">{preview.name}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setPreview(null); }}
                    className="btn-secondary text-sm py-2">
                    Choose different image
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-5xl mb-4">🖼️</div>
                  <p className="text-white font-bold text-lg mb-2">Drop a screenshot here</p>
                  <p className="text-dark-400 text-sm mb-1">Upload any movie scene, poster, or actor photo</p>
                  <p className="text-dark-600 text-xs mb-6">JPG, PNG, WEBP — up to 15 MB</p>
                  <span className="btn-primary pointer-events-none">📁 Choose Screenshot</span>
                  <p className="text-dark-600 text-xs mt-4">or drag & drop · or paste (Ctrl+V)</p>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* ── VIDEO ── */}
        {mode === 'video' && (
          <motion.div key="video"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <input
              ref={videoRef}
              type="file"
              accept="video/mp4,video/avi,video/mov,video/mkv,video/webm,video/*"
              style={{ display: 'none' }}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
                e.target.value = '';
              }}
            />
            <div
              onClick={() => !loading && videoRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                loading   ? 'border-dark-600 bg-dark-900/50 cursor-wait' :
                dragging  ? 'border-brand-400 bg-brand-500/10 cursor-copy' :
                            'border-dark-700 hover:border-brand-500/60 hover:bg-dark-900/50 cursor-pointer'
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-4 pointer-events-none">
                  <div className="w-14 h-14 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-white font-semibold mb-1">{status}</p>
                    <p className="text-dark-500 text-sm">Extracting frames and analyzing…</p>
                  </div>
                </div>
              ) : preview ? (
                <div className="flex flex-col items-center gap-4">
                  <video src={preview.url} className="max-h-52 rounded-xl w-full border border-dark-700" controls muted />
                  <p className="text-dark-400 text-sm truncate max-w-xs">{preview.name}</p>
                  <button
                    onClick={e => { e.stopPropagation(); setPreview(null); }}
                    className="btn-secondary text-sm py-2">
                    Choose different video
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="text-white font-bold text-lg mb-2">Drop a video clip here</p>
                  <p className="text-dark-400 text-sm mb-1">Upload a clip from any movie, series, or Instagram reel</p>
                  <p className="text-dark-600 text-xs mb-6">MP4, MOV, AVI, MKV — up to 100 MB</p>
                  <span className="btn-primary pointer-events-none">📁 Choose Video Clip</span>
                  <p className="text-dark-600 text-xs mt-4">or drag & drop</p>
                </>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default DiscoverSearch;