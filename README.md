# Monetteflix

Minimal cinematic streaming catalog. TMDB powers search, genre browsing, featured titles and upcoming movie listings. CineSrc is configured for movie and TV iframe playback (availability depends on the external provider).

## Deploy
Upload the contents of this folder to your existing GitHub/Vercel project. The site is static and needs no build step.

## Coming Soon
The Coming Soon section pulls TMDB's upcoming US theatrical release list and shows dates, approximate countdowns and YouTube trailer links when TMDB lists one. Release dates and streaming availability can differ by country/provider. Upcoming titles open an information dialog, not the video player.

## Files
- `css/style.css` — all styles (single CSS file)
- `js/config.js` — TMDB configuration (existing client-side token)
- `js/api.js` — TMDB endpoints
- `js/app.js` — browse, search, collections, upcoming
- `js/ui.js` — title cards
- `js/player.js` — CineSrc movie/TV embeds

The TMDB token remains in the browser-accessible config file, as in the original project. For a public or higher-traffic site, consider moving API requests to a server-side proxy and applying rate limits.
