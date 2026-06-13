export const INDUSTRIES = [
  {
    id: 'bollywood', label: 'Bollywood', flag: '🇮🇳', icon: '🎭',
    gradient: 'from-orange-600 via-red-600 to-pink-600',
    glow: 'shadow-orange-500/30',
    params: { with_original_language: 'hi', sort_by: 'popularity.desc' },
    type: 'movie',
  },
  {
    id: 'tollywood', label: 'Tollywood', flag: '🎬', icon: '🔥',
    gradient: 'from-amber-500 via-yellow-500 to-orange-600',
    glow: 'shadow-amber-500/30',
    params: { with_original_language: 'te', sort_by: 'popularity.desc' },
    type: 'movie',
  },
  {
    id: 'kollywood', label: 'Kollywood', flag: '🎥', icon: '⭐',
    gradient: 'from-emerald-500 via-green-500 to-teal-600',
    glow: 'shadow-emerald-500/30',
    params: { with_original_language: 'ta', sort_by: 'popularity.desc' },
    type: 'movie',
  },
  {
    id: 'mollywood', label: 'Mollywood', flag: '🌴', icon: '🎞️',
    gradient: 'from-cyan-500 via-sky-500 to-blue-600',
    glow: 'shadow-cyan-500/30',
    params: { with_original_language: 'ml', sort_by: 'popularity.desc' },
    type: 'movie',
  },
  {
    id: 'hollywood', label: 'Hollywood', flag: '🎩', icon: '🌟',
    gradient: 'from-blue-600 via-indigo-600 to-violet-600',
    glow: 'shadow-blue-500/30',
    params: { with_original_language: 'en', sort_by: 'popularity.desc' },
    type: 'movie',
  },
  {
    id: 'anime', label: 'Anime', flag: '🎌', icon: '⚡',
    gradient: 'from-pink-500 via-rose-500 to-red-600',
    glow: 'shadow-pink-500/30',
    params: { with_genres: 16, with_origin_country: 'JP', sort_by: 'popularity.desc' },
    type: 'tv',
  },
  {
    id: 'cartoons', label: 'Cartoons', flag: '🎨', icon: '🌀',
    gradient: 'from-purple-500 via-fuchsia-500 to-pink-600',
    glow: 'shadow-purple-500/30',
    params: { with_genres: 16, sort_by: 'popularity.desc' },
    type: 'tv',
  },
  {
    id: 'korean', label: 'K-Drama', flag: '🇰🇷', icon: '💜',
    gradient: 'from-violet-500 via-purple-500 to-indigo-600',
    glow: 'shadow-violet-500/30',
    params: { with_original_language: 'ko', sort_by: 'popularity.desc' },
    type: 'tv',
  },
];

export const getIndustry = (id) => INDUSTRIES.find(i => i.id === id);