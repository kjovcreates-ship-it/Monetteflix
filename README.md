Monetteflix stability audit (Oct 2026)

Fixed: featured card hidden on Movies/TV pages; duplicate legacy player initialization; async search/trending stale responses; upcoming page full listings; stale trailer responses. Kept single CSS and all pages.

TMDB requires a valid API token and internet access. CineSrc is third-party and playback cannot be guaranteed. Test on Vercel before sharing widely.


Search update: New search.html and js/search.js. Searches from Home, Movies, TV Shows, and Coming Soon now navigate to search.html?q=... rather than scrolling down.
