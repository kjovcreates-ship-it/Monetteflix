// ── PLAYER ──
// Controls the Vidking iframe and episode selector

const Player = {
  currentItem: null,
  tvSeasons: [],

  elements: {
    section:    () => document.getElementById('player-section'),
    frame:      () => document.getElementById('playerFrame'),
    title:      () => document.getElementById('playerTitle'),
    meta:       () => document.getElementById('playerMeta'),
    controls:   () => document.getElementById('episodeControls'),
    seasonSel:  () => document.getElementById('seasonSelect'),
    episodeSel: () => document.getElementById('episodeSelect'),
  },

  async open(id, type, title, year) {
    this.currentItem = { id, type, title, year };

    this.elements.title().textContent = title;
    this.elements.meta().textContent  = `${type === 'tv' ? 'TV Series' : 'Movie'} · ${year}`;
    this.elements.section().style.display = 'block';

    if (type === 'movie') {
      this.elements.frame().src = `${CONFIG.VIDKING}/embed/movie/${id}`;
      this.elements.controls().classList.remove('visible');
    } else {
      this.elements.controls().classList.add('visible');
      await this.loadSeasons(id);
      this.updateFrame();
    }

    this.elements.section().scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  close() {
    this.elements.section().style.display = 'none';
    this.elements.frame().src = '';
    this.elements.controls().classList.remove('visible');
    this.currentItem = null;
  },

  async loadSeasons(id) {
    const seasonSel  = this.elements.seasonSel();
    const episodeSel = this.elements.episodeSel();

    seasonSel.innerHTML  = '<option>Loading…</option>';
    episodeSel.innerHTML = '<option>—</option>';

    try {
      const data = await API.tvDetails(id);
      this.tvSeasons = data.seasons.filter(s => s.season_number > 0);

      seasonSel.innerHTML = this.tvSeasons
        .map(s => `<option value="${s.season_number}" data-eps="${s.episode_count}">Season ${s.season_number}</option>`)
        .join('');
    } catch {
      seasonSel.innerHTML = '<option value="1">Season 1</option>';
    }

    this.updateEpisodeList();
  },

  updateEpisodeList() {
    const sel = this.elements.seasonSel();
    const opt = sel.options[sel.selectedIndex];
    const count = parseInt(opt?.dataset?.eps) || 20;
    const episodeSel = this.elements.episodeSel();

    episodeSel.innerHTML = Array.from({ length: count }, (_, i) =>
      `<option value="${i + 1}">Episode ${i + 1}</option>`
    ).join('');
  },

  updateFrame() {
    if (!this.currentItem) return;
    const season  = this.elements.seasonSel().value  || 1;
    const episode = this.elements.episodeSel().value || 1;
    this.elements.frame().src = `${CONFIG.VIDKING}/embed/tv/${this.currentItem.id}/${season}/${episode}`;
  },

  prevEpisode() {
    const ep = this.elements.episodeSel();
    if (ep.selectedIndex > 0) {
      ep.selectedIndex--;
      this.updateFrame();
    } else {
      const s = this.elements.seasonSel();
      if (s.selectedIndex > 0) {
        s.selectedIndex--;
        this.updateEpisodeList();
        const ep2 = this.elements.episodeSel();
        ep2.selectedIndex = ep2.options.length - 1;
        this.updateFrame();
      }
    }
  },

  nextEpisode() {
    const ep = this.elements.episodeSel();
    if (ep.selectedIndex < ep.options.length - 1) {
      ep.selectedIndex++;
      this.updateFrame();
    } else {
      const s = this.elements.seasonSel();
      if (s.selectedIndex < s.options.length - 1) {
        s.selectedIndex++;
        this.updateEpisodeList();
        this.updateFrame();
      }
    }
  },

  bindEvents() {
    document.getElementById('closePlayer').addEventListener('click', () => this.close());
    document.getElementById('seasonSelect').addEventListener('change', () => { this.updateEpisodeList(); this.updateFrame(); });
    document.getElementById('episodeSelect').addEventListener('change', () => this.updateFrame());
    document.getElementById('prevEp').addEventListener('click', () => this.prevEpisode());
    document.getElementById('nextEp').addEventListener('click', () => this.nextEpisode());
  },
};
