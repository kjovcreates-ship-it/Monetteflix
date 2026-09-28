// ── PLAYER ──
// Controls the video iframe and TV episode selector

const Player = {
  currentItem: null,
  tvSeasons: [],

  elements: {
    section: () => document.getElementById('player-section'),
    frame: () => document.getElementById('playerFrame'),
    title: () => document.getElementById('playerTitle'),
    meta: () => document.getElementById('playerMeta'),
    controls: () => document.getElementById('episodeControls'),
    seasonSel: () => document.getElementById('seasonSelect'),
    episodeSel: () => document.getElementById('episodeSelect'),
  },


  // ==========================================
  // PROVIDER URLS
  // ==========================================

  getMovieURL(id) {
    return `${https://cinesrc.st/embed/movie/{tmdb_id}`;
  },

  getTVURL(id, season, episode) {
    return `${https://cinesrc.st/embed/tv/{tmdb_id}?s={season}&e={episode}`;
  },


  // ==========================================
  // OPEN PLAYER
  // ==========================================

  async open(id, type, title, year) {
    this.currentItem = {
      id,
      type,
      title,
      year
    };

    this.elements.title().textContent = title;

    this.elements.meta().textContent =
      `${type === 'tv' ? 'TV Series' : 'Movie'} · ${year || 'Unknown'}`;

    this.elements.section().style.display = 'block';


    // MOVIE
    if (type === 'movie') {
      this.elements.controls().classList.remove('visible');

      this.elements.frame().src =
        this.getMovieURL(id);
    }


    // TV SHOW
    else {
      this.elements.controls().classList.add('visible');

      await this.loadSeasons(id);

      this.updateFrame();
    }


    this.elements.section().scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  },


  // ==========================================
  // CLOSE PLAYER
  // ==========================================

  close() {
    this.elements.section().style.display = 'none';

    this.elements.frame().src = '';

    this.elements.controls().classList.remove('visible');

    this.currentItem = null;
  },


  // ==========================================
  // LOAD TV SEASONS FROM TMDB
  // ==========================================

  async loadSeasons(id) {
    const seasonSel = this.elements.seasonSel();
    const episodeSel = this.elements.episodeSel();

    seasonSel.innerHTML =
      '<option>Loading...</option>';

    episodeSel.innerHTML =
      '<option>—</option>';

    try {
      const data = await API.tvDetails(id);

      this.tvSeasons = data.seasons.filter(
        season =>
          season.season_number > 0 &&
          season.episode_count > 0
      );

      seasonSel.innerHTML = this.tvSeasons
        .map(
          season => `
            <option
              value="${season.season_number}"
              data-eps="${season.episode_count}"
            >
              Season ${season.season_number}
            </option>
          `
        )
        .join('');

    } catch (error) {
      console.error(
        'Could not load TV seasons:',
        error
      );

      seasonSel.innerHTML = `
        <option
          value="1"
          data-eps="20"
        >
          Season 1
        </option>
      `;
    }

    this.updateEpisodeList();
  },


  // ==========================================
  // CREATE EPISODE LIST
  // ==========================================

  updateEpisodeList() {
    const seasonSel =
      this.elements.seasonSel();

    const selected =
      seasonSel.options[
        seasonSel.selectedIndex
      ];

    const episodeCount =
      parseInt(selected?.dataset?.eps) || 1;

    const episodeSel =
      this.elements.episodeSel();

    episodeSel.innerHTML =
      Array.from(
        { length: episodeCount },
        (_, index) => `
          <option value="${index + 1}">
            Episode ${index + 1}
          </option>
        `
      ).join('');
  },


  // ==========================================
  // UPDATE TV PLAYER
  // ==========================================

  updateFrame() {
    if (!this.currentItem) return;

    const season =
      this.elements.seasonSel().value || 1;

    const episode =
      this.elements.episodeSel().value || 1;

    this.elements.frame().src =
      this.getTVURL(
        this.currentItem.id,
        season,
        episode
      );
  },


  // ==========================================
  // PREVIOUS EPISODE
  // ==========================================

  prevEpisode() {
    const episodes =
      this.elements.episodeSel();

    const seasons =
      this.elements.seasonSel();

    if (episodes.selectedIndex > 0) {
      episodes.selectedIndex--;

      this.updateFrame();

      return;
    }


    if (seasons.selectedIndex > 0) {
      seasons.selectedIndex--;

      this.updateEpisodeList();

      const newEpisodes =
        this.elements.episodeSel();

      newEpisodes.selectedIndex =
        newEpisodes.options.length - 1;

      this.updateFrame();
    }
  },


  // ==========================================
  // NEXT EPISODE
  // ==========================================

  nextEpisode() {
    const episodes =
      this.elements.episodeSel();

    const seasons =
      this.elements.seasonSel();


    if (
      episodes.selectedIndex <
      episodes.options.length - 1
    ) {
      episodes.selectedIndex++;

      this.updateFrame();

      return;
    }


    if (
      seasons.selectedIndex <
      seasons.options.length - 1
    ) {
      seasons.selectedIndex++;

      this.updateEpisodeList();

      this.elements.episodeSel()
        .selectedIndex = 0;

      this.updateFrame();
    }
  },


  // ==========================================
  // EVENTS
  // ==========================================

  bindEvents() {
    document
      .getElementById('closePlayer')
      .addEventListener(
        'click',
        () => this.close()
      );


    document
      .getElementById('seasonSelect')
      .addEventListener(
        'change',
        () => {
          this.updateEpisodeList();
          this.updateFrame();
        }
      );


    document
      .getElementById('episodeSelect')
      .addEventListener(
        'change',
        () => this.updateFrame()
      );


    document
      .getElementById('prevEp')
      .addEventListener(
        'click',
        () => this.prevEpisode()
      );


    document
      .getElementById('nextEp')
      .addEventListener(
        'click',
        () => this.nextEpisode()
      );
  }
};
