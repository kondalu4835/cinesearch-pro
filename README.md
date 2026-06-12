# CineSearch Pro 🎬

The ultimate movie discovery platform. Find any movie by name, YouTube link, screenshot, or video clip.

## Features

- Search movies, TV shows, actors instantly
- Upload screenshot or video clip to identify movie
- Paste YouTube link to find movie
- Watchlist to save movies
- Top 250 movies of all time
- Browse by genre, language, trending
- Full actor profiles with filmography
- Streaming platforms — where to watch
- Works in English, Hindi, Tamil, Telugu

## Tech Stack

- React 18 + Tailwind CSS + Framer Motion
- TMDB API for all movie data
- Google Gemini Vision API for image/video AI search
- Three.js for 3D effects
- Vercel deployment ready

## Setup

```bash
npm install
npm start
```

## Environment Variables

Create `.env` file:

```
REACT_APP_TMDB_KEY=your_tmdb_api_key
REACT_APP_TMDB_BASE=https://api.themoviedb.org/3
REACT_APP_TMDB_IMG=https://image.tmdb.org/t/p
REACT_APP_GEMINI_KEY=your_gemini_api_key
```

Get TMDB key: https://www.themoviedb.org/settings/api
Get Gemini key: https://aistudio.google.com/app/apikey

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

Or connect GitHub repo to Vercel for auto-deploy.

## Pages

| Page | URL |
|------|-----|
| Home | / |
| Search | /search?q=query |
| Movie | /movie/:id |
| TV Show | /tv/:id |
| Actor | /person/:id |
| Trending | /trending |
| Genres | /genres |
| Actors | /actors |
| Top 250 | /top250 |
| Watchlist | /watchlist |
| Movies | /movies |
| TV Shows | /tv-shows |
| Discover | /discover |
