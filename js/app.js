// =========================================
// MONETTEFLIX APP
// =========================================

const App = {

  activeTab: 'all',

  isSearching: false,
  trendingRequest: 0,
  searchRequest: 0,
  upcomingDetailRequest: 0,


  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  async search(query) {

    query = query.trim();
    const request = ++this.searchRequest;


    if (!query) {
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


      if (request !== this.searchRequest) return;
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


      if (request === this.searchRequest) UI.setError(grid, 'Search failed. Please try again.');

    }

    finally {

      if (request === this.searchRequest) {
        this.isSearching = false;
        button.disabled = false;
        button.textContent = 'Search';
      }

    }

  },


  // -----------------------------------------
  // TRENDING
  // -----------------------------------------

  async loadTrending() {
    const request = ++this.trendingRequest;

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


      if (request !== this.trendingRequest) return;
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


      if (request === this.trendingRequest) UI.setError(grid, 'Trending titles could not be loaded.');
      if (request === this.trendingRequest) this.renderFeatured([]);

    }

  },


  // -----------------------------------------
  // FEATURED TITLE
  // -----------------------------------------
  renderFeatured(items) {
    const el = document.getElementById('heroFeature');
    if (!el) return;
    // Use the current page's media type; prefer backdrop artwork but accept posters.
    const typeFilter = this.activeTab;
    const candidates = (Array.isArray(items) ? items : []).filter(i =>
      i && i.id && (i.title || i.name) &&
      (typeFilter === 'all' || (i.media_type || (i.title ? 'movie' : 'tv')) === typeFilter)
    );
    const item = candidates.find(i => i.backdrop_path) || candidates.find(i => i.poster_path) || candidates[0];
    if (!item) {
      el.innerHTML = '<div class="feature-unavailable">Featured titles are unavailable right now.</div>';
      return;
    }
    const title = item.title || item.name;
    const year = (item.release_date || item.first_air_date || '').slice(0, 4);
    const type = item.media_type || (item.title ? 'movie' : 'tv');
    const artwork = item.backdrop_path || item.poster_path;
    const imageURL = artwork ? `https://image.tmdb.org/t/p/w1280${artwork}` : '';
    el.innerHTML = `
      ${imageURL ? '<div class="feature-image"></div>' : ''}
      <div class="feature-info">
        <span class="feature-kicker">FEATURED ${type === 'tv' ? 'SERIES' : 'MOVIE'}</span>
        <h2>${UI.escapeHTML(title)}</h2>
        <p>${UI.escapeHTML(year || 'Featured')} <span>·</span> ${type === 'tv' ? 'TV Series' : 'Movie'}</p>
        <button class="feature-play" type="button">▶ &nbsp; Watch now</button>
      </div>`;
    if (imageURL) {
      const image = el.querySelector('.feature-image');
      image.style.backgroundImage = `url("${imageURL}")`;
    }
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


    ++this.searchRequest;
    this.isSearching = false;
    const searchButton = document.getElementById('searchBtn');
    searchButton.disabled = false;
    searchButton.textContent = 'Search';
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

  upcomingPage: 1,
  upcomingExpanded: false,
  upcomingRequest: 0,

  async loadUpcoming() {
    const grid = document.getElementById('upcomingGrid');
    const pager = document.getElementById('upcomingPagination');
    const request = ++this.upcomingRequest;
    UI.setLoading(grid);
    try {
      const data = await API.upcoming(this.upcomingPage);
      if (request !== this.upcomingRequest) return;
      const items = this.upcomingExpanded ? data.results : data.results.slice(0, 6);
      if (!items.length) { UI.setError(grid, 'No upcoming titles found for this page.'); }
      else {
        grid.innerHTML = items.map(item => {
          const title = UI.escapeHTML(item.title || 'Untitled');
          const date = new Date(item.release_date + 'T12:00:00');
          const days = Math.max(0, Math.ceil((date - new Date()) / 86400000));
          const formatted = date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
          const poster = item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '';
          return `<button type="button" class="upcoming-card" data-id="${item.id}" aria-label="View details for ${title}">
            <div class="upcoming-poster">${poster ? `<img src="${poster}" alt="" loading="lazy">` : '<span class="poster-fallback">MONETTEFLIX</span>'}<span class="coming-label">COMING SOON</span></div>
            <span class="upcoming-title">${title}</span><span class="upcoming-date">${formatted} <span class="date-separator">·</span> ${days === 0 ? 'Releases today' : `${days} days to go`}</span>
          </button>`;
        }).join('');
        grid.querySelectorAll('.upcoming-card').forEach(card => card.addEventListener('click', () => {
          const item = items.find(i => String(i.id) === card.dataset.id);
          if (item) this.openUpcomingDetails(item);
        }));
      }
      pager.hidden = !this.upcomingExpanded;
      document.getElementById('upcomingPrev').disabled = this.upcomingPage <= 1;
      document.getElementById('upcomingNext').disabled = this.upcomingPage >= Math.min(data.total_pages || 1, 500);
      document.getElementById('upcomingPageLabel').textContent = `Page ${this.upcomingPage}`;
      document.getElementById('upcomingMore').textContent = this.upcomingExpanded ? 'Show less ↑' : 'Explore upcoming ↗';
    } catch(err) { console.error('Upcoming failed:',err); if(request === this.upcomingRequest) UI.setError(grid,'Could not load upcoming movies. Please try again.'); }
  },

  async openUpcomingDetails(item) {
    const request = ++this.upcomingDetailRequest;
    const dialog = document.getElementById('upcomingDialog');
    const body = document.getElementById('upcomingDialogBody');
    const date = new Date(item.release_date+'T12:00:00').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const poster = item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : '';
    body.innerHTML = `<div class="dialog-art" ${poster ? `style="background-image:url('${poster}')"` : ''}></div><div class="dialog-content"><span class="section-eyebrow">COMING SOON · ${date}</span><h2 id="upcomingDialogTitle">${UI.escapeHTML(item.title || 'Upcoming movie')}</h2><p>${UI.escapeHTML(item.overview || 'More details will be available closer to release.')}</p><div id="upcomingTrailer"></div><p class="dialog-disclaimer">Theatrical release dates may vary by region. Streaming availability is not guaranteed.</p></div>`;
    if (!dialog.open) dialog.showModal();
    try {
      const videos = await API.movieVideos(item.id);
      if (request !== this.upcomingDetailRequest || !dialog.open || !body.querySelector('#upcomingTrailer')) return;
      const trailer = videos.find(v=>v.site==='YouTube' && v.type==='Trailer' && v.official) || videos.find(v=>v.site==='YouTube' && v.type==='Trailer');
      if (trailer && /^[a-zA-Z0-9_-]{11}$/.test(trailer.key)) {
        const link = document.createElement('a'); link.className='trailer-link';link.href=`https://www.youtube.com/watch?v=${trailer.key}`;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Watch trailer ↗';body.querySelector('#upcomingTrailer').append(link);
      }
    } catch(error) { console.warn('Trailer unavailable:',error); }
  },

  setupUpcoming() {
    document.getElementById('upcomingTab').addEventListener('click',()=>document.getElementById('upcoming-section').scrollIntoView({behavior:'smooth'}));
    document.getElementById('upcomingMore').addEventListener('click',()=>{this.upcomingExpanded=!this.upcomingExpanded;this.upcomingPage=1;this.loadUpcoming();});
    document.getElementById('upcomingPrev').addEventListener('click',()=>{if(this.upcomingPage>1){this.upcomingPage--;this.loadUpcoming();document.getElementById('upcoming-section').scrollIntoView({behavior:'smooth'});}});
    document.getElementById('upcomingNext').addEventListener('click',()=>{this.upcomingPage++;this.loadUpcoming();document.getElementById('upcoming-section').scrollIntoView({behavior:'smooth'});});
    const dialog = document.getElementById('upcomingDialog');
    document.getElementById('upcomingDialogClose').addEventListener('click',()=>{++this.upcomingDetailRequest;dialog.close();});
    dialog.addEventListener('click',event=>{if(event.target===dialog){++this.upcomingDetailRequest;dialog.close();}});
    if (document.body.dataset.view === 'upcoming' || location.pathname.endsWith('/upcoming.html')) this.upcomingExpanded = true;
    this.loadUpcoming();
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


    // The old inline player is retained for compatibility, but playback uses watch.html.
    // Do not initialize hidden legacy controls.

  },


  // -----------------------------------------
  // INITIALIZE
  // -----------------------------------------

  init() {

    this.bindEvents();
    const view = location.pathname.split('/').pop();
    if (view !== 'upcoming.html') { this.setupGenres(); this.loadTrending(); }
    else { this.setupGenres(); }
    this.setupUpcoming();

  },

};


// =========================================
// START
// =========================================

const initialView = location.pathname.split('/').pop();
if (initialView === 'movies.html') App.activeTab = 'movie';
if (initialView === 'shows.html') App.activeTab = 'tv';
App.init();
