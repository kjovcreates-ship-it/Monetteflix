// =========================================
// PLAYER
// =========================================

const Player = {

  currentItem: null,

  tvSeasons: [],


  elements: {

    section: () =>
      document.getElementById('player-section'),

    frame: () =>
      document.getElementById('playerFrame'),

    title: () =>
      document.getElementById('playerTitle'),

    meta: () =>
      document.getElementById('playerMeta'),

    controls: () =>
      document.getElementById('episodeControls'),

    seasonSel: () =>
      document.getElementById('seasonSelect'),

    episodeSel: () =>
      document.getElementById('episodeSelect'),

    prevButton: () =>
      document.getElementById('prevEp'),

    nextButton: () =>
      document.getElementById('nextEp'),

  },


  // -----------------------------------------
  // OPEN PLAYER
  // -----------------------------------------

  async open(
    id,
    type,
    title,
    year
  ) {

    this.currentItem = {
      id,
      type,
      title,
      year,
    };


    this.elements.title().textContent =
      title;


    this.elements.meta().textContent =
      [
        type === 'tv'
          ? 'TV Series'
          : 'Movie',

        year || null,

      ]
        .filter(Boolean)
        .join(' • ');


    this.elements.section().style.display =
      'block';


    if (type === 'movie') {

      this.elements.controls()
        .classList.remove('visible');


      this.elements.frame().src =
        `${CONFIG.VIDKING}/embed/movie/${id}`;

    }

    else {

      this.elements.controls()
        .classList.add('visible');


      await this.loadSeasons(id);


      this.updateFrame();

    }


    this.elements.section().scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

  },


  // -----------------------------------------
  // CLOSE
  // -----------------------------------------

  close() {

    this.elements.section().style.display =
      'none';


    this.elements.frame().src = '';


    this.elements.controls()
      .classList.remove('visible');


    this.currentItem = null;


    this.tvSeasons = [];

  },


  // -----------------------------------------
  // LOAD TV SEASONS
  // -----------------------------------------

  async loadSeasons(id) {

    const seasonSelect =
      this.elements.seasonSel();


    const episodeSelect =
      this.elements.episodeSel();


    seasonSelect.innerHTML =
      '<option>Loading...</option>';


    episodeSelect.innerHTML =
      '<option>—</option>';


    try {

      const data =
        await API.tvDetails(id);


      this.tvSeasons =
        (data.seasons || [])
          .filter(
            season =>
              season.season_number > 0 &&
              season.episode_count > 0
          );


      if (!this.tvSeasons.length) {

        throw new Error(
          'No seasons available'
        );

      }


      seasonSelect.innerHTML =
        this.tvSeasons
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

    }

    catch (error) {

      console.error(
        'Unable to load seasons:',
        error
      );


      seasonSelect.innerHTML = `
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


  // -----------------------------------------
  // UPDATE EPISODES
  // -----------------------------------------

  updateEpisodeList() {

    const seasonSelect =
      this.elements.seasonSel();


    const selectedOption =
      seasonSelect.options[
        seasonSelect.selectedIndex
      ];


    const episodeCount =
      Number(
        selectedOption?.dataset?.eps
      ) || 1;


    const episodeSelect =
      this.elements.episodeSel();


    episodeSelect.innerHTML =
      Array.from(
        {
          length: episodeCount,
        },

        (_, index) => `

          <option value="${index + 1}">
            Episode ${index + 1}
          </option>

        `
      ).join('');


    this.updateNavigationButtons();

  },


  // -----------------------------------------
  // UPDATE VIDEO
  // -----------------------------------------

  updateFrame() {

    if (!this.currentItem) {
      return;
    }


    if (
      this.currentItem.type ===
      'movie'
    ) {

      this.elements.frame().src =
        `${CONFIG.VIDKING}/embed/movie/${this.currentItem.id}`;

      return;

    }


    const season =
      this.elements.seasonSel().value || 1;


    const episode =
      this.elements.episodeSel().value || 1;


    this.elements.frame().src =
      `${CONFIG.VIDKING}/embed/tv/${this.currentItem.id}/${season}/${episode}`;


    this.updateNavigationButtons();

  },


  // -----------------------------------------
  // PREVIOUS EPISODE
  // -----------------------------------------

  prevEpisode() {

    const episodeSelect =
      this.elements.episodeSel();


    const seasonSelect =
      this.elements.seasonSel();


    if (
      episodeSelect.selectedIndex > 0
    ) {

      episodeSelect.selectedIndex--;

    }

    else if (
      seasonSelect.selectedIndex > 0
    ) {

      seasonSelect.selectedIndex--;


      this.updateEpisodeList();


      const newEpisodeSelect =
        this.elements.episodeSel();


      newEpisodeSelect.selectedIndex =
        newEpisodeSelect.options.length - 1;

    }

    else {

      return;

    }


    this.updateFrame();

  },


  // -----------------------------------------
  // NEXT EPISODE
  // -----------------------------------------

  nextEpisode() {

    const episodeSelect =
      this.elements.episodeSel();


    const seasonSelect =
      this.elements.seasonSel();


    if (
      episodeSelect.selectedIndex <
      episodeSelect.options.length - 1
    ) {

      episodeSelect.selectedIndex++;

    }

    else if (
      seasonSelect.selectedIndex <
      seasonSelect.options.length - 1
    ) {

      seasonSelect.selectedIndex++;


      this.updateEpisodeList();


      this.elements.episodeSel()
        .selectedIndex = 0;

    }

    else {

      return;

    }


    this.updateFrame();

  },


  // -----------------------------------------
  // NAV BUTTON STATE
  // -----------------------------------------

  updateNavigationButtons() {

    const seasonSelect =
      this.elements.seasonSel();


    const episodeSelect =
      this.elements.episodeSel();


    if (
      !seasonSelect.options.length ||
      !episodeSelect.options.length
    ) {
      return;
    }


    const firstEpisode =
      seasonSelect.selectedIndex === 0 &&
      episodeSelect.selectedIndex === 0;


    const lastEpisode =
      seasonSelect.selectedIndex ===
        seasonSelect.options.length - 1 &&
      episodeSelect.selectedIndex ===
        episodeSelect.options.length - 1;


    this.elements.prevButton().disabled =
      firstEpisode;


    this.elements.nextButton().disabled =
      lastEpisode;

  },


  // -----------------------------------------
  // EVENTS
  // -----------------------------------------

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

  },

};
