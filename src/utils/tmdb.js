import axios from 'axios';

const BASE = process.env.REACT_APP_TMDB_BASE || 'https://api.themoviedb.org/3';
const KEY  = process.env.REACT_APP_TMDB_KEY;
const IMG  = process.env.REACT_APP_TMDB_IMG || 'https://image.tmdb.org/t/p';

export const img = (path, size = 'w500') =>
  path ? `${IMG}/${size}${path}` : null;

export const backdrop = (path) =>
  path ? `${IMG}/original${path}` : null;

const api = axios.create({ baseURL: BASE, params: { api_key: KEY } });

// ── Search ────────────────────────────────────────────────────────
export const searchMulti   = (q, lang = 'en-US') => api.get('/search/multi',   { params: { query: q, language: lang, include_adult: false } }).then(r => r.data);
export const searchMovies  = (q, page = 1)        => api.get('/search/movie',   { params: { query: q, page, include_adult: false } }).then(r => r.data);
export const searchPeople  = (q)                  => api.get('/search/person',  { params: { query: q, include_adult: false } }).then(r => r.data);
export const searchTV      = (q)                  => api.get('/search/tv',      { params: { query: q, include_adult: false } }).then(r => r.data);

// ── Movie ─────────────────────────────────────────────────────────
export const getMovie        = (id) => api.get(`/movie/${id}`, { params: { append_to_response: 'credits,videos,similar,recommendations,watch/providers,images,keywords,reviews,release_dates' } }).then(r => r.data);
export const getMovieProviders = (id) => api.get(`/movie/${id}/watch/providers`).then(r => r.data);

// ── TV ────────────────────────────────────────────────────────────
export const getTV = (id) => api.get(`/tv/${id}`, { params: { append_to_response: 'credits,videos,similar,recommendations,watch/providers,images,keywords,reviews' } }).then(r => r.data);

// ── Person ────────────────────────────────────────────────────────
export const getPerson = (id) => api.get(`/person/${id}`, { params: { append_to_response: 'movie_credits,tv_credits,images,external_ids' } }).then(r => r.data);

// ── Discover / Lists ──────────────────────────────────────────────
export const getTrending   = (type = 'all', window = 'week') => api.get(`/trending/${type}/${window}`).then(r => r.data);
export const getNowPlaying = ()  => api.get('/movie/now_playing').then(r => r.data);
export const getUpcoming   = ()  => api.get('/movie/upcoming').then(r => r.data);
export const getTopRated   = ()  => api.get('/movie/top_rated').then(r => r.data);
export const getPopular    = ()  => api.get('/movie/popular').then(r => r.data);
export const getGenres     = ()  => api.get('/genre/movie/list').then(r => r.data);
export const getTrendingPeople = () => api.get('/trending/person/week').then(r => r.data);

export const discover = (params = {}) =>
  api.get('/discover/movie', { params: { sort_by: 'popularity.desc', ...params } }).then(r => r.data);

export const discoverTV = (params = {}) =>
  api.get('/discover/tv', { params: { sort_by: 'popularity.desc', ...params } }).then(r => r.data);

// ── Watchlist helpers (localStorage) ─────────────────────────────
export const getWatchlist = () => {
  try { return JSON.parse(localStorage.getItem('cs_watchlist') || '[]'); }
  catch { return []; }
};

export const toggleWatchlist = (item) => {
  const list = getWatchlist();
  const idx  = list.findIndex(i => i.id === item.id);
  if (idx >= 0) list.splice(idx, 1);
  else list.unshift({ ...item, added_at: Date.now() });
  localStorage.setItem('cs_watchlist', JSON.stringify(list));
  return idx < 0;
};

export const isInWatchlist = (id) => getWatchlist().some(i => i.id === id);

// ── Platform styles ───────────────────────────────────────────────
export const PLATFORMS = {
  'Netflix':              { bg: '#E50914', label: 'Netflix' },
  'Amazon Prime Video':   { bg: '#00A8E0', label: 'Prime' },
  'Disney Plus':          { bg: '#113CCF', label: 'Disney+' },
  'Hotstar':              { bg: '#1F80E0', label: 'Hotstar' },
  'Apple TV Plus':        { bg: '#1C1C1E', label: 'Apple TV+' },
  'HBO Max':              { bg: '#6200EA', label: 'HBO Max' },
  'Hulu':                 { bg: '#1CE783', label: 'Hulu' },
  'Zee5':                 { bg: '#8B2FC9', label: 'ZEE5' },
  'SonyLIV':              { bg: '#0057FF', label: 'SonyLIV' },
  'Mubi':                 { bg: '#00B0FF', label: 'MUBI' },
  'JioCinema':            { bg: '#7B2FBE', label: 'JioCinema' },
  'default':              { bg: '#374151', label: 'Stream' },
};
