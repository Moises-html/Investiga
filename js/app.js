/* app.js — bootstrap da aplicação
   Inicializa áudio, partículas, acessibilidade e easter eggs,
   depois entrega o controle ao SceneManager. */
(function () {
  const state = LocalStorageManager.load();

  // Acessibilidade: respeita prefers-reduced-motion e permite desativar animações
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) document.body.classList.add('reduced-motion');

  document.getElementById('motion-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('reduced-motion');
  });

  AudioController.init(state.muted);
  document.getElementById('mute-toggle')?.addEventListener('click', () => {
    const muted = AudioController.toggleMute();
    const s = LocalStorageManager.load();
    s.muted = muted;
    LocalStorageManager.save(s);
  });

  // Desbloqueia áudio no primeiro toque real (política de autoplay)
  window.addEventListener('pointerdown', () => AudioController.unlock(), { once: true });

  ParticleSystem.init();

  /* -------- Easter eggs (mínimo de 3) -------- */
  let logoClicks = 0;
  document.getElementById('app')?.addEventListener('click', (e) => {
    if (e.target.closest('.eyebrow')) {
      logoClicks++;
      if (logoClicks === 5) Toast.show('Você realmente está investigando tudo, hein?');
    }
  });

  let titleTaps = 0, titleTapTimer;
  document.body.addEventListener('dblclick', (e) => {
    if (e.target.closest('h1, h2')) {
      titleTaps++;
      clearTimeout(titleTapTimer);
      titleTapTimer = setTimeout(() => (titleTaps = 0), 1500);
      if (titleTaps === 3) Toast.show('Ok, eu admito: eu revisei esse texto umas dez vezes.');
    }
  });

  let longPressTimer;
  document.addEventListener('touchstart', (e) => {
    longPressTimer = setTimeout(() => {
      if (Math.random() < 1) Toast.show('Psst. Continue procurando.');
    }, 2200);
  });
  document.addEventListener('touchend', () => clearTimeout(longPressTimer));

  SceneManager.boot();
})();
