// ── APP ──
// Main entry point — wires everything together

const App = {
  activeTab: 'all',

  async search(query) {
    const grid    = document.getElementById('resultsGrid');
    const section = document.getElementById('results-section');
    const label   = document.getElementById('resultsLabel');

    section.style.display = 'block';
    UI.setLoading(grid);

    try {
      let results = [];

      if (this.activeTab === 'all' || this.activeTab === 'movie') {
        results = results.concat(await API.searchMovies(query));
      }
      if (this.activeTab === 'all' || this.activeTab === 'tv') {
        results = results.concat(await API.searchTV(query));
      }

      results.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

      label.innerHTML = `Results <span>for "${query}" — ${results.length} found</span>`;
      UI.renderCards(grid, results);
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      UI.setError(grid, 'Search failed. Check your connection.');
    }
  },

  async loadTrending() {
    const grid = document.getElementById('trendingGrid');
    UI.setLoading(grid);

    try {
      const results = await API.trending(this.activeTab);
      UI.renderCards(grid, results.slice(0, 20));
    } catch {
      UI.setError(grid, 'Could not load trending. Check your API key.');
    }
  },

  setTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    this.loadTrending();

    const query = document.getElementById('searchInput').value.trim();
    if (query) this.search(query);
  },

  bindEvents() {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setTab(btn.dataset.tab));
    });

    // Search button
    document.getElementById('searchBtn').addEventListener('click', () => {
      const q = document.getElementById('searchInput').value.trim();
      if (q) this.search(q);
    });

    // Enter key
    document.getElementById('searchInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) this.search(q);
      }
    });

    // Player events
    Player.bindEvents();
  },

  init() {
    this.bindEvents();
    this.loadTrending();
  },
};

// Start the app
App.init();
