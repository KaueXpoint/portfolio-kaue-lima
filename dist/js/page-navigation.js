// The home link reuses its history entry only after an animated trip from home.
function setupHomeLink(routeKey) {
  const transitionKey = routeKey + '-transition';
  const fromHome = sessionStorage.getItem(transitionKey) === '1';
  sessionStorage.removeItem(transitionKey);
  const link = document.getElementById('back-btn');
  const overlay = document.getElementById('intro-overlay');
  const title = document.getElementById('page-title');
  let leaving = false;

  link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (leaving) return;
    leaving = true;

    function goHome() {
      sessionStorage.setItem('index-return-fade', routeKey);
      if (fromHome && history.length > 1) history.back();
      else location.assign(link.href);
    }

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      goHome();
      return;
    }
    gsap.killTweensOf([overlay, title]);
    overlay.style.pointerEvents = 'auto';
    gsap.timeline({ onComplete: goHome })
      .to(title, { opacity: 0, duration: 0.4, ease: 'power2.inOut' }, 0)
      .to(overlay, { opacity: 1, duration: 0.5, ease: 'power2.inOut' }, 0.1);
  });
  window.addEventListener('pageshow', () => { leaving = false; });
  return fromHome;
}
