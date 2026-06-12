import React from 'react';
import { img, PLATFORMS } from '../utils/tmdb';

const StreamingPlatforms = ({ providers }) => {
  if (!providers?.results) return null;

  const region = providers.results?.IN || providers.results?.US || Object.values(providers.results)[0] || {};
  const { flatrate = [], rent = [], buy = [], free = [] } = region;
  const link = region.link;
  const hasAny = flatrate.length || rent.length || buy.length || free.length;

  if (!hasAny) return (
    <div className="rounded-xl border border-dark-700 p-4 text-center">
      <p className="text-dark-400 text-sm">Not available for streaming in your region</p>
      <a
        href={`https://www.google.com/search?q=${encodeURIComponent('where to watch')}`}
        target="_blank" rel="noopener noreferrer"
        className="text-brand-400 text-xs mt-2 inline-block hover:text-brand-300"
      >Search online →</a>
    </div>
  );

  const Section = ({ label, items, color }) => {
    if (!items?.length) return null;
    return (
      <div className="mb-4 last:mb-0">
        <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color }}>{label}</p>
        <div className="flex flex-wrap gap-2.5">
          {items.map(p => {
            const style = PLATFORMS[p.provider_name] || PLATFORMS.default;
            return (
              <a key={p.provider_id} href={link || '#'} target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 group" title={`Watch on ${p.provider_name}`}>
                {p.logo_path ? (
                  <img src={img(p.logo_path, 'w92')} alt={p.provider_name}
                    className="w-10 h-10 rounded-xl object-cover border border-dark-700 group-hover:border-brand-500 transition-all group-hover:scale-110" />
                ) : (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold"
                    style={{ background: style.bg, color: 'white' }}>
                    {p.provider_name.slice(0, 2)}
                  </div>
                )}
                <span className="text-xs text-dark-400 group-hover:text-white transition-colors max-w-12 text-center truncate leading-tight">
                  {style.label || p.provider_name.split(' ')[0]}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-dark-700 p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span>📺</span> Where to Watch
        <span className="text-xs text-dark-500 font-normal ml-1">India</span>
      </h3>
      <Section label="Streaming" items={flatrate} color="#10b981" />
      <Section label="Rent"      items={rent}     color="#3b82f6" />
      <Section label="Buy"       items={buy}       color="#f59e0b" />
      <Section label="Free"      items={free}      color="#8b5cf6" />
    </div>
  );
};

export default StreamingPlatforms;
