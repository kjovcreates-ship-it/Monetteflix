(async () => {
 const params = new URLSearchParams(location.search);
 const type = params.get('type') === 'tv' ? 'tv' : 'movie';
 const id = params.get('id');
 const status = document.getElementById('watchStatus');
 const frame = document.getElementById('watchFrame');
 const titleEl = document.getElementById('watchTitle');
 const seasonEl = document.getElementById('watchSeason');
 const episodeEl = document.getElementById('watchEpisode');
 const episodesBox = document.getElementById('watchEpisodes');
 if (!id || !/^\d+$/.test(id)) { titleEl.textContent='Title not found'; status.textContent='Choose a title from the catalog.'; return; }
 const url = () => type === 'movie' ? Player.getMovieURL(id) : Player.getTVURL(id, seasonEl.value, episodeEl.value);
 const updateFrame = () => { frame.src = url(); if(type==='tv') {const q=new URLSearchParams(location.search); q.set('s',seasonEl.value);q.set('e',episodeEl.value);history.replaceState(null,'',`watch.html?${q}`);} };
 const setEpisodes = () => {
  const count = Number(seasonEl.selectedOptions[0]?.dataset.eps || 1);
  episodeEl.replaceChildren(...Array.from({length:count},(_,i)=>{const o=document.createElement('option');o.value=String(i+1);o.textContent=`Episode ${i+1}`;return o;}));
 };
 const move = direction => {const n=episodeEl.selectedIndex+direction;if(n>=0 && n<episodeEl.length){episodeEl.selectedIndex=n;updateFrame();return;} const s=seasonEl.selectedIndex+direction;if(s>=0&&s<seasonEl.length){seasonEl.selectedIndex=s;setEpisodes();episodeEl.selectedIndex=direction>0?0:episodeEl.length-1;updateFrame();}};
 seasonEl.addEventListener('change',()=>{setEpisodes();updateFrame();});
 episodeEl.addEventListener('change',updateFrame);
 document.getElementById('watchPrev').addEventListener('click',()=>move(-1));
 document.getElementById('watchNext').addEventListener('click',()=>move(1));
 try {
  const data = await API.fetch(`/${type}/${encodeURIComponent(id)}?language=en-US`);
  const title = data.title || data.name || 'Untitled';
  const year = (data.release_date || data.first_air_date || '').slice(0,4);
  titleEl.textContent=title;
  document.title=`${title} | MonetteFlix`;
  document.getElementById('watchMeta').textContent=[year,type==='tv'?'TV Series':'Movie',...(data.genres||[]).slice(0,2).map(g=>g.name)].filter(Boolean).join(' · ');
  document.getElementById('watchOverview').textContent=data.overview || 'No synopsis available.';
  if(type==='tv') {
   episodesBox.hidden=false;
   const seasons=(data.seasons||[]).filter(s=>s.season_number>0 && s.episode_count>0);
   if(!seasons.length) throw new Error('Episode information unavailable');
   seasonEl.replaceChildren(...seasons.map(s=>{const o=document.createElement('option');o.value=s.season_number;o.dataset.eps=s.episode_count;o.textContent=`Season ${s.season_number}`;return o;}));
   const requestedSeason=params.get('s');if(requestedSeason && [...seasonEl.options].some(o=>o.value===requestedSeason))seasonEl.value=requestedSeason;
   setEpisodes();const requestedEpisode=params.get('e');if(requestedEpisode && [...episodeEl.options].some(o=>o.value===requestedEpisode))episodeEl.value=requestedEpisode;
  }
  updateFrame();status.textContent='Playback is provided by an external service; availability may vary.';
  try {const rec=await API.fetch(`/${type}/${encodeURIComponent(id)}/recommendations?language=en-US&page=1`);UI.renderCards(document.getElementById('watchRecommendations'),(rec.results||[]).slice(0,8).map(x=>({...x,media_type:type})));}catch(e){console.warn('Recommendations unavailable',e);}
 } catch(e) {console.error(e);titleEl.textContent='Unable to load title';status.textContent='Could not load details. Please go back and try another title.';}
})();
