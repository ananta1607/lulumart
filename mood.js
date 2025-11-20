// Minimal interactions: play/pause, mood filter
(function(){
  const moodButtons = Array.from(document.querySelectorAll('.mood-card'));
  const playlistCards = Array.from(document.querySelectorAll('.playlist-card'));
  const playBtn = document.getElementById('play');
  const nowTitle = document.getElementById('now-title');

  let playing = false;
  function togglePlay(){
    playing = !playing;
    playBtn.textContent = playing ? '⏸' : '▶';
    playBtn.setAttribute('aria-pressed', String(playing));
  }
  playBtn && playBtn.addEventListener('click', togglePlay);

  // Mood filtering
  moodButtons.forEach(b => {
    b.addEventListener('click', ()=>{
      const mood = b.dataset.mood;
      // toggle pressed state
      const pressed = b.getAttribute('aria-pressed') === 'true';
      moodButtons.forEach(x => x.setAttribute('aria-pressed','false'));
      b.setAttribute('aria-pressed', String(!pressed));

      // simple filter
      if(pressed){
        playlistCards.forEach(p => p.style.display = '');
        nowTitle.textContent = 'Sunrise Chill';
      } else {
        playlistCards.forEach(p => {
          p.style.display = (p.dataset.mood === mood) ? '' : 'none';
        });
        const first = playlistCards.find(p=>p.dataset.mood === mood);
        if(first) nowTitle.textContent = first.querySelector('.meta strong').textContent || first.querySelector('strong').textContent;
      }
    });

    // keyboard enter/space activation
    b.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); b.click(); }
    });
  });

  // Category strip filtering (one-line category cards)
  const categoryButtons = Array.from(document.querySelectorAll('.category-card'));
  const liveAnnounce = (msg)=>{
    let el = document.getElementById('live-announce');
    if(!el){ el = document.createElement('div'); el.id = 'live-announce'; el.setAttribute('aria-live','polite'); el.style.position='absolute'; el.style.left='-9999px'; el.style.height='1px'; el.style.overflow='hidden'; document.body.appendChild(el); }
    el.textContent = msg;
  };

  // helper: update category counts
  function updateCategoryCounts(){
    categoryButtons.forEach(btn => {
      const cat = btn.dataset.cat;
      const count = playlistCards.filter(p => p.dataset.mood === cat).length;
      const span = btn.querySelector('.cat-count');
      if(span) span.textContent = count;
    });
  }

  function getSelectedCategories(){
    return categoryButtons.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.cat);
  }
  function getSelectedMood(){
    const m = moodButtons.find(b=>b.getAttribute('aria-pressed')==='true');
    return m ? m.dataset.mood : null;
  }

  function applyFilters(){
    const cats = getSelectedCategories();
    const mood = getSelectedMood();
    playlistCards.forEach(p => {
      const pm = p.dataset.mood;
      let show = true;
      if(cats.length > 0 && mood){
        // combine filters: show if matches any selected category OR matches the mood button
        show = cats.includes(pm) || pm === mood;
      } else if(cats.length > 0){
        show = cats.includes(pm);
      } else if(mood){
        show = pm === mood;
      } else {
        show = true;
      }
      p.style.display = show ? '' : 'none';
    });
    const firstVisible = playlistCards.find(p => p.style.display !== 'none');
    nowTitle.textContent = firstVisible ? (firstVisible.querySelector('.meta strong')?.textContent || firstVisible.querySelector('strong')?.textContent) : 'No playlists';
  }

  categoryButtons.forEach(btn => {
    btn.addEventListener('click', ()=>{
      const was = btn.getAttribute('aria-pressed') === 'true';
      // toggle this button only (multi-select)
      btn.setAttribute('aria-pressed', String(!was));
      // remove single-mood-button highlight if multi-selecting categories is desired
      // (we keep mood-buttons independent; applyFilters handles combination)
      applyFilters();
      const cats = getSelectedCategories();
      liveAnnounce(cats.length ? `${cats.length} category selected` : 'Showing all playlists');
    });
    btn.addEventListener('keydown', e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); btn.click(); } });
  });

  // Clear category button wiring
  const clearBtn = document.getElementById('clear-category');
  if(clearBtn){
    clearBtn.addEventListener('click', ()=>{
      categoryButtons.forEach(x=> x.setAttribute('aria-pressed','false'));
      // keep mood buttons as-is; only clear categories
      applyFilters();
      nowTitle.textContent = 'Sunrise Chill';
      liveAnnounce('Category filters cleared');
    });
  }

  // initialize counts and ensure filters are applied
  document.addEventListener('DOMContentLoaded', ()=>{
    updateCategoryCounts();
    applyFilters();
  });

  // Playlist card focus play preview (tiny interaction)
  playlistCards.forEach(p => {
    p.addEventListener('dblclick', ()=>{
      // prevent duplicate navigation/activation: ignore if already "playing" this card within 700ms
      if(p.dataset.lastClicked && (Date.now()-p.dataset.lastClicked*1) < 700) return;
      p.dataset.lastClicked = Date.now();
      nowTitle.textContent = p.querySelector('.meta strong').textContent;
      if(!playing) togglePlay();
    });
  });

})();