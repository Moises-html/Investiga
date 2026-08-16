/* LocalStorageManager
   Guarda e recupera o progresso da investigação. */
const LocalStorageManager = (() => {
  const KEY = 'caso-helena-progress-v1';

  const defaultState = () => ({
    currentScene: 'intro',
    cluesFound: [],       // ids das pistas encontradas
    photosUnlocked: [],   // ids das fotos vistas
    puzzleSolved: false,
    codeSolved: false,
    videoUnlocked: false,
    easterEggs: [],       // ids dos easter eggs encontrados
    muted: false,
  });

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      return { ...defaultState(), ...parsed };
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* silencioso: se localStorage não estiver disponível, a experiência
         continua funcionando apenas sem persistência */
    }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
    return defaultState();
  }

  return { load, save, reset, defaultState };
})();
