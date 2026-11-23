

if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
requestAnimationFrame(() => window.scrollTo(0, 0));

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  import(new URL('js/shader.mjs', document.baseURI).href).then(({ startScene }) => startScene('contact-canvas'))
    .catch(err => console.error('CoreRenderer init failed:', err));
}

document.querySelectorAll('[data-chr]').forEach(function (el) {
  const text = el.dataset.chr;
  el.removeAttribute('data-chr');
  el.innerHTML = '';
  Array.from(text).forEach(function (ch, i) {
    if (ch === ' ') {
      el.insertAdjacentHTML('beforeend', '<span style="width:0.35em;display:inline-block">&nbsp;</span>');
      return;
    }
    const wrap = document.createElement('span');
    wrap.className = 'ch-wrap';
    wrap.style.setProperty('--i', i);
    const chHTML = window.getCharHTML ? window.getCharHTML(ch) : ch;
    wrap.innerHTML = '<span class="ch-top">' + chHTML + '</span><span class="ch-bot">' + chHTML + '</span>';
    el.appendChild(wrap);
  });
});

const fromIndexTransition = setupHomeLink('contact');
let introTl = null;

function playContactIntro() {
  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('page-title');
  const main = document.getElementById('contact-main');
  const bottom = document.getElementById('contact-bottom');

  const pageNavigation = document.querySelectorAll('#back-btn, .page-nav > a');
  gsap.set(pageNavigation, { autoAlpha: 0 });
  const fromIndex = fromIndexTransition;


  const tl = gsap.timeline();
  introTl = tl;

  if (fromIndex) {
    gsap.set(overlay, { opacity: 1 });
    gsap.set(title, { opacity: 1 });
    tl.to(overlay, { opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.1);
  } else {
    gsap.set(overlay, { opacity: 1 });
    gsap.set(title, { opacity: 0 });
    tl.to(overlay, { opacity: 0, duration: 0.7, ease: 'power2.out' }, 0);
    tl.to(title, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 0.2);
  }

  const t0 = fromIndex ? 0.5 : 0.35;
  tl.to(main, { opacity: 1, duration: 1.1, ease: 'power2.out' }, t0);
  tl.to(pageNavigation, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' }, t0 + 0.2);
  tl.to(bottom, { opacity: 1, duration: 0.7, ease: 'power2.out' }, t0 + 0.3);
  tl.add(function () { main.classList.add('ready'); }, t0 + 0.4);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) tl.progress(1);
}

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(playContactIntro);
} else {
  window.addEventListener('load', playContactIntro);
}

window.addEventListener('pageshow', function (e) {

  if (!e.persisted) return;
  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('page-title');
  const backBtn = document.getElementById('back-btn');
  const main = document.getElementById('contact-main');
  const bottom = document.getElementById('contact-bottom');

  gsap.killTweensOf([overlay, title, backBtn, main, bottom]);
  gsap.set(overlay, { opacity: 0 });
  overlay.style.pointerEvents = 'none';
  gsap.set([title, backBtn, main, bottom], { opacity: 1 });
  main.classList.add('ready');
});

document.addEventListener('visibilitychange', function () {
  if (document.hidden) return;
  if (introTl && introTl.progress() < 1) introTl.progress(1);
});
