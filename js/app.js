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
      this.renderFeatured(results);

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
  // FEATURED TITLE
  // -----------------------------------------
  renderFeatured(items) {
    const el = document.getElementById('heroFeature');
    if (!el) return;
    const item = items.find(i => i.backdrop_path && (i.title || i.name));
    if (!item) return;
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    el.innerHTML = `
      <div class="feature-image" style="background-image:linear-gradient(90deg,rgba(9,9,13,.12),rgba(9,9,13,.05)),url('https://image.tmdb.org/t/p/w1280${item.backdrop_path}')"></div>
      <div class="feature-info">
        <span class="feature-kicker">FEATURED TITLE</span>
        <h2>${UI.escapeHTML(title)}</h2>
        <p>${year || 'Featured'} <span>·</span> ${type === 'tv' ? 'TV Series' : 'Movie'}</p>
        <button class="feature-play" type="button">▶ &nbsp; Play title</button>
      </div>`;
    el.querySelector('.feature-play').addEventListener('click', () =>
      Player.open(item.id, type, title, year)
    );
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
    this.loadGenres();


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


  genreList: [
    {name:'All genres',movie:null,tv:null},
    {name:'Action',movie:28,tv:10759},
    {name:'Comedy',movie:35,tv:35},
    {name:'Horror',movie:27,tv:null},
    {name:'Romance',movie:10749,tv:null},
    {name:'Sci-Fi',movie:878,tv:10765},
    {name:'Thriller',movie:53,tv:null},
    {name:'Drama',movie:18,tv:18},
    {name:'Animation',movie:16,tv:16},
    {name:'Documentary',movie:99,tv:99},
    {name:'Mystery',movie:9648,tv:9648},
    {name:'Crime',movie:80,tv:80}
  ],
  selectedGenre: 'All genres',
  genrePage: 1,
  genreRequest: 0,

  async genreData(name, page = 1) {
    const genre = this.genreList.find(g => g.name === name) || this.genreList[0];
    const types = this.activeTab === 'all' ? ['movie','tv'] : [this.activeTab];
    const usable = types.filter(type => genre[type] !== null || name === 'All genres');
    const responses = await Promise.all(usable.map(type => API.discover(type,genre[type],page)));
    const results = responses.flatMap(r => r.results).sort((a,b) => (b.popularity||0)-(a.popularity||0));
    return {results,hasMore:responses.some(r=>page < (r.total_pages||1))};
  },

  async loadGenres(append = false) {
    const grid = document.getElementById('genreGrid');
    const more = document.getElementById('genreMore');
    const request = ++this.genreRequest;
    if (!append) {this.genrePage = 1; UI.setLoading(grid);}
    more.hidden = true;
    document.getElementById('genreResultsTitle').textContent = this.selectedGenre === 'All genres' ? 'Popular picks' : `${this.selectedGenre} ${this.activeTab === 'movie' ? 'movies' : this.activeTab === 'tv' ? 'TV shows' : 'movies & shows'}`;
    document.getElementById('clearGenre').hidden = this.selectedGenre === 'All genres';
    try {
      const data = await this.genreData(this.selectedGenre,this.genrePage);
      if (request !== this.genreRequest) return;
      if (append) {
        const existing = [...grid.querySelectorAll('.card')].map(card=>card.dataset.type+':'+card.dataset.id);
        const unique = data.results.filter(item=>!existing.includes(item.media_type+':'+item.id));
        const temp = document.createElement('div'); UI.renderCards(temp,unique);
        grid.append(...temp.children);
      } else UI.renderCards(grid,data.results);
      more.hidden = !data.hasMore;
    } catch(error) {if(request === this.genreRequest) UI.setError(grid,'Could not load this genre. Please try again.'); console.error(error);}
  },

  chooseGenre(name) {
    this.selectedGenre = name;
    document.querySelectorAll('.genre-chip').forEach(b=>{const active=b.dataset.genre===name;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    this.loadGenres();
  },

  setupGenres() {
    const chips = document.getElementById('genreChips');
    this.genreList.forEach(g=>{
      const btn=document.createElement('button'); btn.type='button'; btn.className='genre-chip'; btn.textContent=g.name;btn.dataset.genre=g.name;
      btn.addEventListener('click',()=>this.chooseGenre(g.name));chips.append(btn);
    });
    document.getElementById('clearGenre').addEventListener('click',()=>this.chooseGenre('All genres'));
    document.getElementById('genreMore').addEventListener('click',()=>{this.genrePage++;this.loadGenres(true);});
    this.chooseGenre('All genres');
    this.loadCollections();
  },

  async loadCollections() {
    const host=document.getElementById('curatedRows');
    const collections=[{title:'Action-packed movies',type:'movie',genre:28},{title:'Comedy favorites',type:'movie',genre:35},{title:'Sci-Fi & fantasy series',type:'tv',genre:10765},{title:'Top drama series',type:'tv',genre:18}];
    host.replaceChildren();
    collections.forEach(async c=>{
      const section=document.createElement('section');section.className='collection-row';
      const title=document.createElement('h3');title.textContent=c.title;
      const grid=document.createElement('div');grid.className='grid collection-grid';
      section.append(title,grid);host.append(section);UI.setLoading(grid);
      try {const data=await API.discover(c.type,c.genre);UI.renderCards(grid,data.results.slice(0,8));}
      catch(error){console.error(error);UI.setError(grid,'Collection unavailable.');}
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
    this.setupGenres();
    this.loadTrending();

  },

};


// =========================================
// START
// =========================================

App.init();
