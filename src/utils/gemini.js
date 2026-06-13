const GEMINI_KEY = process.env.REACT_APP_GEMINI_KEY;

const MODEL_CONFIGS = [
  { model: 'gemini-2.0-flash',      version: 'v1beta' },
  { model: 'gemini-2.0-flash-001',  version: 'v1beta' },
  { model: 'gemini-2.5-flash',      version: 'v1beta' },
  { model: 'gemini-flash-latest',   version: 'v1beta' },
];

const callGemini = async (body) => {
  for (const cfg of MODEL_CONFIGS) {
    const url = `https://generativelanguage.googleapis.com/${cfg.version}/models/${cfg.model}:generateContent?key=${GEMINI_KEY}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 404) { console.warn('404 skip:', cfg.model); continue; }
      if (res.status === 429) { console.warn('429 quota:', cfg.model, '- waiting 8s'); await new Promise(r => setTimeout(r, 8000)); continue; }
      const data = await res.json();
      if (data.error) { console.warn('API error:', cfg.model, data.error.message); continue; }
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) { console.log('✅ SUCCESS:', cfg.model, cfg.version); return text; }
    } catch (e) { console.warn('fetch error:', cfg.model, e.message); continue; }
  }
  console.error('❌ All Gemini models failed');
  return null;
};

const parseJSON = (text) => {
  if (!text) return null;
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch {
    const m = text.match(/\{[\s\S]*\}/);
    try { return m ? JSON.parse(m[0]) : null; } catch { return null; }
  }
};

const toBase64 = (file) => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(r.result.split(',')[1]);
  r.onerror = rej;
  r.readAsDataURL(file);
});

export const extractFrame = (file, pct) => new Promise((resolve) => {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  const url = URL.createObjectURL(file);
  video.src = url;
  let done = false;
  const finish = (val) => {
    if (!done) { done = true; URL.revokeObjectURL(url); resolve(val); }
  };
  video.onloadedmetadata = () => { video.currentTime = video.duration * pct; };
  video.onseeked = () => {
    try {
      const c = document.createElement('canvas');
      c.width = Math.min(video.videoWidth, 1280);
      c.height = Math.min(video.videoHeight, 720);
      c.getContext('2d').drawImage(video, 0, 0, c.width, c.height);
      finish(c.toDataURL('image/jpeg', 0.85).split(',')[1]);
    } catch { finish(null); }
  };
  video.onerror = () => finish(null);
  setTimeout(() => finish(null), 12000);
});

const IMAGE_PROMPT = `You are the world's best movie and celebrity identification expert specializing in Indian and Hollywood cinema.

A user uploaded this image wanting to know what movie it is from or who this actor is.

ANALYZE EVERY SINGLE DETAIL:
- FACES: Identify any actor or actress visible by their FULL NAME
- SCENE: Movie sets, costumes, props, lighting style, cinematography
- TEXT: Any subtitles, title cards, watermarks, studio logos, magazine names
- POSTER: Movie poster text, taglines, design elements
- STYLE: Color grading, visual aesthetic typical of specific films

CRITICAL RULES:
1. Actor photoshoot photo = VALID → identify the actor by full name
2. Magazine cover = VALID → identify the actor
3. Movie scene = VALID → identify the movie title
4. Movie poster = VALID → identify the movie title
5. Behind the scenes = VALID → identify actor and movie
6. NEVER say not movie related for any celebrity or film content
7. When 50% sure still give your best answer

Known Indian actors YOU MUST RECOGNIZE:
Telugu: Allu Arjun, Prabhas, Jr NTR, Ram Charan, Mahesh Babu, Vijay Deverakonda, Nani, Ram Pothineni
Tamil: Vijay, Ajith Kumar, Rajinikanth, Dhanush, Vikram, Suriya, Sivakarthikeyan, Karthi
Hindi: Shah Rukh Khan, Salman Khan, Aamir Khan, Hrithik Roshan, Ranveer Singh, Ranbir Kapoor, Akshay Kumar, Tiger Shroff
Actresses: Deepika Padukone, Rashmika Mandanna, Samantha, Nayanthara, Priyanka Chopra, Alia Bhatt, Katrina Kaif, Tamannaah, Pooja Hegde, Anushka Shetty, Keerthy Suresh, Kajal Aggarwal
Hollywood: Tom Cruise, Leonardo DiCaprio, Robert Downey Jr, Chris Evans, Chris Hemsworth, Scarlett Johansson, Dwayne Johnson, Ryan Reynolds, Will Smith, Brad Pitt
Anime characters and shows: Naruto, One Piece, Attack on Titan, Demon Slayer,
Jujutsu Kaisen, My Hero Academia, Dragon Ball, Death Note, Tokyo Revengers,
Solo Leveling, Chainsaw Man, Spy x Family, One Punch Man, Bleach, Hunter x Hunter
Western Cartoons: SpongeBob SquarePants, Tom and Jerry, Avatar The Last Airbender, Rick and Morty, The Simpsons, Family Guy, Adventure Time, Gravity Falls, Teen Titans, Ben 10, Phineas and Ferb, Regular Show, Steven Universe

YOU MUST RETURN ONLY THIS EXACT JSON FORMAT — NO OTHER TEXT:
{
  "identified": true or false,
  "type": "person or movie or poster or scene or anime or unknown",
  "anime_name": "Anime or Cartoon title if this is anime/cartoon character/scene or null",
  "person_name": "Full Actor Name if person detected else null",
  "movie_name": "Exact Movie Title if movie detected else null",
  "year": "release year or null",
  "language": "telugu or hindi or tamil or english or null",
  "confidence": "high or medium or low",
  "search_queries": ["most specific query", "second query", "third query"]
}`;

export const searchByImage = async (file) => {
  try {
    const base64 = await toBase64(file);
    const mimeType = file.type || 'image/jpeg';
    console.log('🔍 Sending image to Gemini, size:', (file.size / 1024).toFixed(0), 'KB');
    const text = await callGemini({
      contents: [{
        parts: [
          { text: IMAGE_PROMPT },
          { inline_data: { mime_type: mimeType, data: base64 } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
    });
    console.log('📝 Raw Gemini response:', text);
    if (!text) {
      console.error('Gemini returned null - all models failed');
      return { identified: false, search_queries: [], gemini_failed: true };
    }
    const result = parseJSON(text);
    console.log('✅ Parsed result:', result);
    if (!result) return { identified: false, search_queries: [], gemini_failed: false };
    result.valid = true;
    return result;
  } catch (e) {
    console.error('searchByImage error:', e);
    return { identified: false, search_queries: [], error: e.message };
  }
};

export const searchByVideo = async (file) => {
  try {
    console.log('🎬 Extracting frames from video...');
    const frames = (await Promise.all([0.1, 0.3, 0.6, 0.85].map(p => extractFrame(file, p)))).filter(Boolean);
    console.log('📹 Extracted frames:', frames.length);
    if (!frames.length) return { identified: false, search_queries: [], error: 'No frames extracted' };

    for (let i = 0; i < frames.length; i++) {
      console.log(`🔍 Analyzing frame ${i + 1}/${frames.length}...`);
      const text = await callGemini({
        contents: [{
          parts: [
            { text: IMAGE_PROMPT.replace('uploaded this image', 'uploaded a video clip. This is frame ' + (i + 1) + ' extracted from the video') },
            { inline_data: { mime_type: 'image/jpeg', data: frames[i] } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
      });
      console.log('📝 Frame', i + 1, 'response:', text);
      const result = parseJSON(text);
      if (result?.identified && (result.movie_name || result.person_name || result.anime_name)) {
        result.valid = true;
        return result;
      }
    }
    return { identified: false, search_queries: [], error: 'Could not identify from any frame' };
  } catch (e) {
    console.error('searchByVideo error:', e);
    return { identified: false, search_queries: [], error: e.message };
  }
};

export const searchByYouTubeURL = async (url) => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([^&?/]+)/);
  const videoId = m?.[1];
  if (!videoId) return { identified: false, search_queries: [] };
  try {
    const r = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    const d = await r.json();
    if (d.title) {
      const cleaned = d.title
        .replace(/official\s*(trailer|teaser|video|song|promo)/gi, '')
        .replace(/\|.*/g, '')
        .replace(/-.*/g, '')
        .replace(/[([].+?[)\]]/g,'')
        .replace(/HD|4K|Full Movie/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return {
        identified: true,
        movie_name: cleaned,
        raw_title: d.title,
        video_id: videoId,
        search_queries: [cleaned, d.title.split('|')[0].trim()]
      };
    }
  } catch (e) { console.warn('oEmbed failed:', e); }
  return { identified: false, search_queries: [], video_id: videoId };
};

export const analyzePrompt = async (prompt) => {
  const text = await callGemini({
    contents: [{ parts: [{ text: `Extract movie search info from this description: "${prompt}"\nReturn JSON only: { "search_query": "best TMDB search query", "is_person_search": false }` }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 256 }
  });
  return parseJSON(text) || { search_query: prompt, is_person_search: false };
};

export const detectLinkType = (url) => {
  if (!url) return 'unknown';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i)) return 'image_url';
  if (url.startsWith('http')) return 'webpage';
  return 'unknown';
};