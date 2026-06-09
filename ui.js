// ── UI ──
// Handles rendering cards and DOM state

const UI = {
  renderCards(container, items) {
    if (!items.length) {
      container.innerHTML = `<div class="state-msg"><span class="big">🔍</span>No results found.</div>`;
      return;
    }

    container.innerHTML = items.map(item => this.cardHTML(item)).join('');

    container.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        Player.open(
          card.dataset.id,
          card.dataset.type,
          card.dataset.title,
          card.dataset.year
        );
      });
    });
  },

  cardHTML(item) {
    const type   = item.media_type || (item.title ? 'movie' : 'tv');
    const title  = item.title || item.name || 'Unknown';
    const year   = (item.release_date || item.first_air_date || '').slice(0, 4);
    const poster = item.poster_path
      ? `<img class="card-poster" src="${CONFIG.TMDB_IMG}${item.poster_path}" alt="${title}" loading="lazy" />`
      : `<div class="card-poster no-img">🎬</div>`;
    const badge  = type === 'tv'
      ? `<span class="card-type tv">TV</span>`
      : `<span class="card-type">Film</span>`;

    return `
      <div class="card"
        data-id="${item.id}"
        data-type="${type}"
        data-title="${title.replace(/"/g, '&quot;')}"
        data-year="${year}">
        ${poster}
        <div class="play-overlay">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" fill="rgba(230,57,70,0.9)"/>
            <polygon points="24,18 46,30 24,42" fill="white"/>
          </svg>
        </div>
        <div class="card-info">
          <div class="card-title">${title}</div>
          <div class="card-sub">${year || '—'} ${badge}</div>
        </div>
      </div>`;
  },

  setLoading(container) {
    container.innerHTML = '<div class="spinner"></div>';
  },

  setError(container, message) {
    container.innerHTML = `<div class="state-msg"><span class="big">⚠️</span>${message}</div>`;
  },
};
