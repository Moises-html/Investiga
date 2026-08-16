/* AudioController
   Música ambiente + pequenos efeitos sonoros, respeitando as políticas
   de autoplay dos navegadores (só toca após interação do usuário). */
const AudioController = (() => {
  let muted = false;
  let started = false;
  let music;

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
    if (music) {
      if (muted) music.pause();
      else music.play().catch(() => {});
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

  function isMuted() { return muted; }

  return { init, unlock, toggleMute, playSfx, isMuted };
})();
