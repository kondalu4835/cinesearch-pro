import { useState, useEffect, useRef } from 'react';

const useSearchSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [show,        setShow]        = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setShow(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi` +
          `?api_key=${process.env.REACT_APP_TMDB_KEY}` +
          `&query=${encodeURIComponent(query)}` +
          `&include_adult=false`
        );
        const data = await res.json();
        const items = (data.results || [])
          .filter(r => (r.poster_path || r.profile_path) && (r.title || r.name))
          .slice(0, 8);
        setSuggestions(items);
        setShow(items.length > 0);
      } catch {
        setSuggestions([]);
        setShow(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return { suggestions, loading, show, setShow, dropRef };
};

export default useSearchSuggestions;