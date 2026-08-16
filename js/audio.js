/* AudioController
   Música ambiente + pequenos efeitos sonoros, respeitando as políticas
   de autoplay dos navegadores (só toca após interação do usuário).

   Regra de ouro: nunca duas trilhas tocando ao mesmo tempo. Toda troca
   de música passa por switchTrack(), que primeiro dá fade-out em
   qualquer faixa tocando e só então inicia a nova — nunca sobrepõe. */
const AudioController = (() => {
  let muted = false;
  let started = false;
  let music; // trilha ambiente (romantic.mp3)

  function allTracks() {
    return [
      document.getElementById('bg-music'),
      document.getElementById('cena4-music'),
      document.getElementById('final-music'),
    ].filter(Boolean);
  }

  function init(initiallyMuted) {
    muted = !!initiallyMuted;
    music = document.getElementById('bg-music');
    if (music) music.volume = 0.35;
    updateIcon();
  }

  function unlock() {
    // Chamado no primeiro toque/clique real do usuário.
    if (started || !music) return;
    started = true;
    if (!muted) {
      music.play().catch(() => {
        /* autoplay bloqueado — o usuário pode acionar o botão de som manualmente */
      });
    }
  }

  function toggleMute() {
    muted = !muted;
    if (muted) {
      allTracks().forEach((t) => t.pause());
    } else {
      // Retoma só a faixa que estava tocando (a com maior currentTime > 0),
      // sem disparar duas ao mesmo tempo.
      const playing = allTracks().find((t) => t.currentTime > 0 && !t.ended) || music;
      if (playing) playing.play().catch(() => {});
    }
    updateIcon();
    return muted;
  }

  function updateIcon() {
    const btn = document.getElementById('mute-toggle');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
  }

  function playSfx(name) {
    if (muted) return;
    const el = document.getElementById('sfx-' + name);
    if (!el) return;
    try {
      el.currentTime = 0;
      el.volume = 0.5;
      el.play().catch(() => {});
    } catch (e) {}
  }

  function fadeOut(el, cb) {
    if (!el || el.paused) { if (typeof cb === 'function') cb(); return; }
    const startVol = el.volume || 0.5;
    const step = Math.max(startVol / 12, 0.03);
    const fade = setInterval(() => {
      if (el.volume > step) {
        el.volume -= step;
      } else {
        el.pause();
        el.volume = startVol;
        clearInterval(fade);
        if (typeof cb === 'function') cb();
      }
    }, 60);
  }

  function switchTrack(trackEl, targetVolume) {
    // Dá fade-out em qualquer outra faixa tocando antes de iniciar a nova
    // — garante que nunca fiquem duas músicas sobrepostas.
    allTracks().forEach((t) => { if (t !== trackEl && !t.paused) fadeOut(t); });
    if (!trackEl || muted) return;
    trackEl.currentTime = 0;
    trackEl.volume = targetVolume;
    trackEl.play().catch(() => {});
  }

  function playFinalMusic() {
    // Troca qualquer trilha em andamento pela música da declaração final
    // (Aliança — Tribalistas).
    switchTrack(document.getElementById('final-music'), 0.55);
  }

  function playCena4Music() {
    // Música exclusiva da cena bônus "O Último Recado" (Love Me).
    switchTrack(document.getElementById('cena4-music'), 0.5);
  }

  function stopCena4Music() {
    // Ao sair da cena bônus, volta para a música da tela final (Aliança),
    // sempre com fade — nunca as duas tocando juntas.
    playFinalMusic();
  }

  function isMuted() { return muted; }

  return { init, unlock, toggleMute, playSfx, playFinalMusic, playCena4Music, stopCena4Music, isMuted };
})();
