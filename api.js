// ── API ──
// Handles all communication with the TMDB API

const API = {
  headers: {
    Authorization: `Bearer ${CONFIG.TMDB_TOKEN}`,
    'Content-Type': 'application/json',
  },

  async fetch(path) {
    const res = await fetch(`${CONFIG.TMDB_BASE}${path}`, { headers: this.headers });
    if (!res.ok) throw new Error(`TMDB error: ${res.statusText}`);
    return res.json();
  },

  async searchMovies(query) {
    const data = await this.fetch(`/search/movie?query=${encodeURIComponent(query)}&page=1`);
    return data.results.map(r => ({ ...r, media_type: 'movie' }));
  },

  async searchTV(query) {
    const data = await this.fetch(`/search/tv?query=${encodeURIComponent(query)}&page=1`);
    return data.results.map(r => ({ ...r, media_type: 'tv' }));
  },

  async trending(type = 'all') {
    const data = await this.fetch(`/trending/${type}/week`);
    return type === 'all'
      ? data.results
      : data.results.map(r => ({ ...r, media_type: type }));
  },

  async tvDetails(id) {
    return this.fetch(`/tv/${id}`);
  },
};
