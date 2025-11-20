/*
  script.js — focused on UI behaviors for the home page
  - Carousel (auto-rotate every 3s, swipe, prev/next, indicators)
  - Back button: hidden/disabled on root
  - Modal overlay dismiss (backdrop, Escape, close button)
  - Block duplicate rapid navigation (double-tap) globally
+  Images and icons are loaded from `assets/images/` as required.
*/

(function(){
  const AUTO_ROTATE_MS = 3000;
  let carouselTimer = null;
  let current = 0;
  let isInteracting = false;
  const doubleTapGuard = new Map();

  function qs(sel){return document.querySelector(sel)}
  function qsa(sel){return Array.from(document.querySelectorAll(sel))}

  // Carousel setup
  function initCarousel(){
    const carousel = qs('#hero-carousel');
    if(!carousel) return;
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    // Prefer common raster formats in assets if available (banner1.jpg/png etc.)
    const tryPreferRaster = async () => {
      const exts = ['png','jpg','jpeg','svg'];
      const loadImg = (url) => new Promise((resolve,reject)=>{ const img=new Image(); img.onload=()=>resolve(url); img.onerror=()=>reject(url); img.src=url; });
      for(const s of slides){
        const imgEl = s.querySelector('img');
        if(!imgEl) continue;
        const base = imgEl.dataset.srcBase || imgEl.src.replace(/\.(svg|png|jpe?g)$/i,'');
        // try extensions in order and set the first that loads
        for(const ext of exts){
          const candidate = `${base}.${ext}`;
          try{
            // eslint-disable-next-line no-await-in-loop
            await loadImg(candidate);
            imgEl.src = candidate;
            break;
          }catch(e){ /* try next */ }
        }
      }
    };
    // kick off preference check (non-blocking)
    tryPreferRaster();
    const indicators = carousel.querySelectorAll('.carousel-indicators [role="tab"]');
    const btnPrev = carousel.querySelector('.carousel-btn.prev');
    const btnNext = carousel.querySelector('.carousel-btn.next');

    function goTo(idx, userTriggered=false){
      idx = (idx + slides.length) % slides.length;
      slides.forEach((s,i)=>{
        const hidden = i!==idx;
        s.setAttribute('aria-hidden', hidden ? 'true' : 'false');
        s.classList.toggle('active', i===idx);
      });
      indicators.forEach((b,i)=>{
        b.setAttribute('aria-selected', i===idx ? 'true' : 'false');
        b.classList.toggle('active', i===idx);
      });
      current = idx;
      resetTimer();
    }

    function next(){ goTo(current+1, true); }
    function prev(){ goTo(current-1, true); }

    btnNext.addEventListener('click', e => { if(blockDoubleTap(e.currentTarget)) return; next(); });
    btnPrev.addEventListener('click', e => { if(blockDoubleTap(e.currentTarget)) return; prev(); });

    indicators.forEach((b,i)=> b.addEventListener('click', e => { if(blockDoubleTap(b)) return; goTo(i, true); }));

    // Auto rotate
    function resetTimer(){
      if(carouselTimer) clearInterval(carouselTimer);
      if(!isInteracting) carouselTimer = setInterval(next, AUTO_ROTATE_MS);
    }

    // Pause while interacting
    carousel.addEventListener('mouseenter', ()=>{ isInteracting=true; if(carouselTimer) clearInterval(carouselTimer); });
    carousel.addEventListener('mouseleave', ()=>{ isInteracting=false; resetTimer(); });
    carousel.addEventListener('focusin', ()=>{ isInteracting=true; if(carouselTimer) clearInterval(carouselTimer); });
    carousel.addEventListener('focusout', ()=>{ isInteracting=false; resetTimer(); });

    // Touch swipe support
    let startX = 0, deltaX = 0, touching = false;
    carousel.addEventListener('touchstart', e=>{
      if(e.touches.length>1) return;
      touching = true; startX = e.touches[0].clientX; deltaX = 0; isInteracting = true; if(carouselTimer) clearInterval(carouselTimer);
    }, {passive:true});
    carousel.addEventListener('touchmove', e=>{
      if(!touching) return; deltaX = e.touches[0].clientX - startX;
    }, {passive:true});
    carousel.addEventListener('touchend', e=>{
      touching = false; isInteracting = false; if(Math.abs(deltaX) > 40){ if(deltaX>0) prev(); else next(); } resetTimer();
    });

    // Keyboard navigation
    carousel.addEventListener('keydown', e=>{
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    });

    // init
    slides.forEach((s,i)=> s.setAttribute('id', `slide-${i}`));
    goTo(0);
    resetTimer();
  }

  // Back button behavior: hide if at root
  function initBackButton(){
    const btn = qs('#back-button');
    if(!btn) return;
    function update(){
      try{
        // If there's at least one history entry to go back to, enable
        if(window.history.length > 1){ btn.disabled = false; btn.style.opacity = 1; }
        else { btn.disabled = true; btn.style.opacity = 0.4; }
      }catch(e){ btn.disabled = true; btn.style.opacity = 0.4; }
    }
    update();
    btn.addEventListener('click', e=>{
      if(blockDoubleTap(btn)) return;
      if(window.history.length > 1) window.history.back();
    });
    // update on popstate
    window.addEventListener('popstate', update);
  }

  // Modal overlay
  function initModal(){
    const overlay = qs('#overlay-modal');
    if(!overlay) return;
    const panel = overlay.querySelector('.overlay-panel');
    const close = overlay.querySelector('.overlay-close');

    function show(html){ overlay.setAttribute('aria-hidden','false'); overlay.classList.add('open'); overlay.querySelector('#overlay-content').innerHTML = html; document.body.style.overflow = 'hidden'; }
    function hide(){ overlay.setAttribute('aria-hidden','true'); overlay.classList.remove('open'); overlay.querySelector('#overlay-content').innerHTML = ''; document.body.style.overflow = ''; }

    overlay.addEventListener('click', e=>{ if(e.target === overlay) hide(); });
    close.addEventListener('click', hide);
    document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && overlay.getAttribute('aria-hidden') === 'false') hide(); });

    // expose for demo (optional)
    window.__LM_modal = { show, hide };
  }

  // Prevent double-tap/double-click causing duplicate navigation
  function blockDoubleTap(el){
    try{
      const now = Date.now();
      const key = el.dataset.fingerprint || (el.dataset.fingerprint = Math.random().toString(36).slice(2,9));
      const last = doubleTapGuard.get(key) || 0;
      if(now - last < 600){ return true; }
      doubleTapGuard.set(key, now);
      return false;
    }catch(e){ return false; }
  }

  // init on DOM ready
  document.addEventListener('DOMContentLoaded', ()=>{
    initCarousel();
    initBackButton();
    initModal();

    // Global touch target enforcement: set CSS variable for minimum touch size if needed (handled in CSS)

    // Add a small helpful accessibility enhancement: focus visible outlines for keyboard users
    document.body.addEventListener('keyup', e=>{
      if(e.key === 'Tab') document.body.classList.add('show-focus');
    });
  });

})();