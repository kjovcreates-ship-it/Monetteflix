// =========================================
// MONETTEFLIX APP
// =========================================

const App = {

  activeTab: 'all',

  isSearching: false,


  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  async search(query) {

    query = query.trim();


    if (!query || this.isSearching) {
      return;
    }


    const grid =
      document.getElementById(
        'resultsGrid'
      );


    const section =
      document.getElementById(
        'results-section'
      );


    const label =
      document.getElementById(
        'resultsLabel'
      );


    const button =
      document.getElementById(
        'searchBtn'
      );


    section.style.display = 'block';


    UI.setLoading(grid);


    this.isSearching = true;


    button.disabled = true;

    button.textContent = 'Searching...';


    try {

      let results = [];


      // MOVIES
      if (
        this.activeTab === 'all' ||
        this.activeTab === 'movie'
      ) {

        const movies =
          await API.searchMovies(query);


        results =
          results.concat(movies);

      }


      // TV
      if (
        this.activeTab === 'all' ||
        this.activeTab === 'tv'
      ) {

        const shows =
          await API.searchTV(query);


        results =
          results.concat(shows);

      }


      // Sort by popularity
      results.sort(
        (a, b) =>
          (b.popularity || 0) -
          (a.popularity || 0)
      );


      const safeQuery =
        UI.escapeHTML(query);


      label.innerHTML = `
        Results
        <span class="results-query">
          for "${safeQuery}" ·
          ${results.length}
          ${results.length === 1 ? 'result' : 'results'}
        </span>
      `;


      UI.renderCards(
        grid,
        results
      );


      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

    }

    catch (error) {

      console.error(
        'Search failed:',
        error
      );


      UI.setError(
        grid,
        'Search failed. Please try again.'
      );

    }

    finally {

      this.isSearching = false;


      button.disabled = false;

      button.textContent = 'Search';

    }

  },


  // -----------------------------------------
  // TRENDING
  // -----------------------------------------

  async loadTrending() {

    const grid =
      document.getElementById(
        'trendingGrid'
      );


    UI.setLoading(grid);


    try {

      const results =
        await API.trending(
          this.activeTab
        );


      UI.renderCards(
        grid,
        results.slice(0, 20)
      );

    }

    catch (error) {

      console.error(
        'Trending failed:',
        error
      );


      UI.setError(
        grid,
        'Trending titles could not be loaded.'
      );

    }

  },


  // -----------------------------------------
  // CHANGE TAB
  // -----------------------------------------

  setTab(tab) {

    if (
      this.activeTab === tab
    ) {
      return;
    }


    this.activeTab = tab;


    document
      .querySelectorAll('.tab-btn')
      .forEach(button => {

        button.classList.toggle(
          'active',
          button.dataset.tab === tab
        );

      });


    this.loadTrending();


    const query =
      document
        .getElementById(
          'searchInput'
        )
        .value
        .trim();


    if (query) {

      this.search(query);

    }

  },


  // -----------------------------------------
  // CLEAR SEARCH
  // -----------------------------------------

  clearSearch() {

    const input =
      document.getElementById(
        'searchInput'
      );


    const results =
      document.getElementById(
        'results-section'
      );


    const clear =
      document.getElementById(
        'clearSearch'
      );


    input.value = '';


    clear.classList.remove(
      'visible'
    );


    results.style.display =
      'none';


    input.focus();

  },


  // -----------------------------------------
  // HOME
  // -----------------------------------------

  goHome() {

    Player.close();


    this.clearSearch();


    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

  },


  // -----------------------------------------
  // EVENTS
  // -----------------------------------------

  bindEvents() {

    // Tabs
    document
      .querySelectorAll('.tab-btn')
      .forEach(button => {

        button.addEventListener(
          'click',
          () =>
            this.setTab(
              button.dataset.tab
            )
        );

      });


    // Search
    document
      .getElementById('searchBtn')
      .addEventListener(
        'click',
        () => {

          const query =
            document
              .getElementById(
                'searchInput'
              )
              .value;


          this.search(query);

        }
      );


    // Search input
    const searchInput =
      document.getElementById(
        'searchInput'
      );


    searchInput.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Enter'
        ) {

          this.search(
            event.target.value
          );

        }

      }
    );


    // Show clear button
    searchInput.addEventListener(
      'input',
      event => {

        document
          .getElementById(
            'clearSearch'
          )
          .classList.toggle(
            'visible',
            event.target.value.length > 0
          );

      }
    );


    // Clear search
    document
      .getElementById(
        'clearSearch'
      )
      .addEventListener(
        'click',
        () => this.clearSearch()
      );


    // Logo
    document
      .getElementById(
        'homeLogo'
      )
      .addEventListener(
        'click',
        event => {

          event.preventDefault();

          this.goHome();

        }
      );


    // Escape closes player
    document.addEventListener(
      'keydown',
      event => {

        if (
          event.key === 'Escape' &&
          Player.currentItem
        ) {

          Player.close();

        }

      }
    );


    Player.bindEvents();

  },


  // -----------------------------------------
  // INITIALIZE
  // -----------------------------------------

  init() {

    this.bindEvents();

    this.loadTrending();

  },

};


// =========================================
// START
// =========================================

App.init();
