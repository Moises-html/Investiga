/* TransitionManager
   Controla a troca suave entre cenas (sem reload, baseada em estado). */
const TransitionManager = (() => {
  function crossFade(fromEl, toEl, duration = 900) {
    return new Promise((resolve) => {
      if (fromEl) {
        fromEl.classList.add('leaving');
        fromEl.classList.remove('active');
      }
      // pequeno delay para permitir o blur de saída antes de revelar a próxima cena
      setTimeout(() => {
        if (fromEl) fromEl.classList.remove('leaving');
        if (toEl) toEl.classList.add('active');
        resolve();
      }, fromEl ? duration * 0.35 : 0);
    });
  }

  return { crossFade };
})();
