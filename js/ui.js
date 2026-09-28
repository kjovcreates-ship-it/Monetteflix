// =========================================
// UI
// =========================================

const UI = {

  // -----------------------------------------
  // RENDER CARDS
  // -----------------------------------------

  renderCards(container, items) {

    if (!items || !items.length) {

      container.innerHTML = `
        <div class="state-msg">

          <svg
            class="state-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="11" cy="11" r="7"></circle>
            <path d="M20 20l-4-4"></path>
          </svg>

          <strong>No results found</strong>

          Try searching for something else.

        </div>
      `;

      return;
    }


    container.innerHTML = items
      .map(item => this.cardHTML(item))
      .join('');


    container
      .querySelectorAll('.card')
      .forEach(card => {

        card.addEventListener(
          'click',
          () => {

            Player.open(
              card.dataset.id,
              card.dataset.type,
              card.dataset.title,
              card.dataset.year
            );

          }
        );


        card.addEventListener(
          'keydown',
          event => {

            if (
              event.key === 'Enter' ||
              event.key === ' '
            ) {

              event.preventDefault();

              card.click();

            }

          }
        );

      });

  },


  // -----------------------------------------
  // CREATE CARD
  // -----------------------------------------

  cardHTML(item) {

    const type =
      item.media_type ||
      (item.title ? 'movie' : 'tv');


    const title =
      item.title ||
      item.name ||
      'Unknown title';


    const date =
      item.release_date ||
      item.first_air_date ||
      '';


    const year =
      date.slice(0, 4);


    const rating =
      Number(item.vote_average || 0);


    const ratingText =
      rating > 0
        ? rating.toFixed(1)
        : null;


    const safeTitle =
      this.escapeHTML(title);


    const poster = item.poster_path
      ? `
        <img
          class="card-poster"
          src="${CONFIG.TMDB_IMG}${item.poster_path}"
          alt="${safeTitle} poster"
          loading="lazy"
        >
      `
      : `
        <div class="card-poster no-img">

          <svg
            class="no-poster-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
            ></rect>

            <path d="M7 8h.01"></path>

            <path d="M3 16l5-5 4 4 2-2 7 7"></path>

          </svg>

        </div>
      `;


    const badge =
      type === 'tv'
        ? `<span class="card-type tv">TV</span>`
        : `<span class="card-type">Movie</span>`;


    return `

      <article
        class="card"
        data-id="${item.id}"
        data-type="${type}"
        data-title="${safeTitle}"
        data-year="${year}"
        tabindex="0"
        role="button"
        aria-label="Watch ${safeTitle}"
      >

        <div class="card-poster-wrap">

          ${poster}

          ${badge}

          <div class="play-overlay">

            <div class="play-button">

              <svg
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z"></path>
              </svg>

            </div>

          </div>

        </div>


        <div class="card-info">

          <div
            class="card-title"
            title="${safeTitle}"
          >
            ${safeTitle}
          </div>


          <div class="card-sub">

            <span>
              ${year || 'Unknown'}
            </span>

            ${
              ratingText
                ? `
                  <span class="meta-dot">•</span>

                  <span class="rating">
                    ★ ${ratingText}
                  </span>
                `
                : ''
            }

          </div>

        </div>

      </article>
    `;

  },


  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  setLoading(container) {

    container.innerHTML = `
      <div class="spinner"></div>
    `;

  },


  // -----------------------------------------
  // ERROR
  // -----------------------------------------

  setError(container, message) {

    container.innerHTML = `

      <div class="state-msg">

        <svg
          class="state-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >

          <circle
            cx="12"
            cy="12"
            r="9"
          ></circle>

          <path d="M12 8v5"></path>

          <path d="M12 16h.01"></path>

        </svg>

        <strong>Something went wrong</strong>

        ${this.escapeHTML(message)}

      </div>

    `;

  },


  // -----------------------------------------
  // ESCAPE HTML
  // -----------------------------------------

  escapeHTML(value) {

    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  },

};
