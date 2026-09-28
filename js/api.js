// =========================================
// TMDB API
// =========================================

const API = {

  headers: {
    Authorization: `Bearer ${CONFIG.TMDB_TOKEN}`,
    'Content-Type': 'application/json',
  },


  async fetch(path) {

    const response = await fetch(
      `${CONFIG.TMDB_BASE}${path}`,
      {
        headers: this.headers,
      }
    );

    if (!response.ok) {

      throw new Error(
        `TMDB request failed: ${response.status}`
      );

    }

    return response.json();

  },


  // -----------------------------------------
  // MOVIE SEARCH
  // -----------------------------------------

  async searchMovies(query) {

    const data = await this.fetch(
      `/search/movie?query=${encodeURIComponent(query)}&page=1&include_adult=false`
    );

    return data.results.map(item => ({
      ...item,
      media_type: 'movie',
    }));

  },


  // -----------------------------------------
  // TV SEARCH
  // -----------------------------------------

  async searchTV(query) {

    const data = await this.fetch(
      `/search/tv?query=${encodeURIComponent(query)}&page=1`
    );

    return data.results.map(item => ({
      ...item,
      media_type: 'tv',
    }));

  },


  // -----------------------------------------
  // TRENDING
  // -----------------------------------------

  async trending(type = 'all') {

    const data = await this.fetch(
      `/trending/${type}/week`
    );

    if (type === 'all') {

      return data.results.filter(item =>
        item.media_type === 'movie' ||
        item.media_type === 'tv'
      );

    }

    return data.results.map(item => ({
      ...item,
      media_type: type,
    }));

  },


  // -----------------------------------------
  // TV DETAILS
  // -----------------------------------------

  async tvDetails(id) {

    return this.fetch(`/tv/${id}`);

  },

};
