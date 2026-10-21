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


  // TMDB discover endpoints; movie and TV genre IDs can differ.
  async discover(type, genreId, page = 1) {
    const params = new URLSearchParams({sort_by:'popularity.desc',page:String(page),include_adult:'false'});
    if (genreId) params.set('with_genres', String(genreId));
    const data = await this.fetch(`/discover/${type}?${params.toString()}`);
    return { ...data, results:(data.results || []).map(item => ({...item,media_type:type})) };
  },

  // Upcoming theatrical movies, using TMDB's upcoming endpoint.
  async upcoming(page = 1) {
    const data = await this.fetch(`/movie/upcoming?language=en-US&region=US&page=${encodeURIComponent(page)}`);
    const today = new Date().toISOString().slice(0,10);
    return { ...data, results:(data.results || []).filter(item => item.release_date && item.release_date >= today).sort((x,y)=>x.release_date.localeCompare(y.release_date)).map(item=>({...item,media_type:'movie'})) };
  },

  async movieVideos(id) {
    const data = await this.fetch(`/movie/${encodeURIComponent(id)}/videos?language=en-US`);
    return data.results || [];
  },

  // -----------------------------------------
  // TV DETAILS
  // -----------------------------------------

  async tvDetails(id) {

    return this.fetch(`/tv/${id}`);

  },

};
