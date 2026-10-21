(() => {
  const form = document.getElementById('searchPageForm');
  const input = document.getElementById('searchPageInput');
  const grid = document.getElementById('searchPageGrid');
  const status = document.getElementById('searchStatus');
  const params = new URLSearchParams(location.search);
  const query = (params.get('q') || '').trim();
  input.value = query;
  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim();
    if (value) location.href = `search.html?q=${encodeURIComponent(value)}`;
  });
  async function load() {
    if (!query) { input.focus(); return; }
    document.title = `${query} — Search | Monetteflix`;
    status.textContent = `Searching for “${query}”…`;
    UI.setLoading(grid);
    try {
      const [movies, shows] = await Promise.allSettled([API.searchMovies(query), API.searchTV(query)]);
      if (movies.status === 'rejected' && shows.status === 'rejected') throw new Error('Both searches failed');
      const combined = [
        ...(movies.status === 'fulfilled' ? movies.value : []),
        ...(shows.status === 'fulfilled' ? shows.value : [])
      ].sort((a,b) => (b.popularity || 0) - (a.popularity || 0));
      UI.renderCards(grid, combined);
      status.textContent = combined.length ? `${combined.length} results for “${query}”` : `No results for “${query}”. Try another title.`;
    } catch (error) {
      console.error('Search error:', error);
      UI.setError(grid, 'Search failed. Please try again.');
      status.textContent = 'Unable to load search results.';
    }
  }
  load();
})();
