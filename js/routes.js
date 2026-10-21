(() => {
  const path = location.pathname.split('/').pop() || 'index.html';
  const view = {'movies.html':'movie','shows.html':'tv','upcoming.html':'upcoming'}[path] || 'home';
  document.body.dataset.view = view;
  document.querySelectorAll('.nav-link').forEach(a => {
    if(a.dataset.view === view) a.setAttribute('aria-current','page');
  });
  if(view === 'movie' || view === 'tv') {
    // The initial page filter is set before App.init() to avoid competing requests.
    const title = document.querySelector('.hero h1');
    if(title) title.innerHTML = view === 'movie' ? 'Explore <em>movies.</em>' : 'Explore <em>TV shows.</em>';
    const note = document.querySelector('.hero-content > p');
    if(note) note.textContent = view === 'movie' ? 'Find your next favorite film across every genre.' : 'Discover acclaimed series and your next binge-watch.';
  }
  if(view === 'upcoming') {
    document.title = 'Coming Soon | MonetteFlix';
  }
})();
