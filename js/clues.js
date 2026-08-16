/* ClueSystem
   Controla o painel "PISTAS ENCONTRADAS", os cliques nos elementos ocultos
   e o desbloqueio progressivo da história. */
const ClueSystem = (() => {
  const CLUES = [
    { id: 'c1', icon: '🔎', label: 'Pista 01', reveal: 'Uma data circulada em vermelho: 14/02.' },
    { id: 'c2', icon: '📷', label: 'Pista 02', reveal: 'Uma fotografia dobrada ao meio.' },
    { id: 'c3', icon: '💌', label: 'Pista 03', reveal: 'Um envelope nunca aberto.' },
    { id: 'c4', icon: '🕰️', label: 'Pista 04', reveal: 'Um relógio parado às 21:11.' },
    { id: 'c5', icon: '🎬', label: 'Pista 05', reveal: 'Um rolo de filme com uma etiqueta rasurada.' },
  ];

  function render(container, foundIds, onFound) {
    const grid = document.createElement('div');
    grid.className = 'clue-grid';
    grid.setAttribute('role', 'list');

    CLUES.forEach((clue) => {
      const found = foundIds.includes(clue.id);
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'clue-item' + (found ? ' found' : '');
      item.setAttribute('aria-label', found ? `${clue.label} — encontrada` : `Pista oculta`);
      item.dataset.id = clue.id;
      item.innerHTML = `<span class="spark"></span><span>${found ? clue.icon : '?'}</span>`;

      item.addEventListener('click', (e) => {
        if (item.classList.contains('found')) {
          Toast.show(clue.reveal);
          return;
        }
        item.classList.add('found', 'just-found');
        item.querySelector('span:last-child').textContent = clue.icon;
        item.setAttribute('aria-label', `${clue.label} — encontrada`);
        AudioController.playSfx('clue');
        const rect = item.getBoundingClientRect();
        ParticleSystem.burstAt(rect.left + rect.width / 2, rect.top + rect.height / 2);
        setTimeout(() => item.classList.remove('just-found'), 800);
        if (typeof onFound === 'function') onFound(clue);
      });

      grid.appendChild(item);
    });

    container.appendChild(grid);
    return grid;
  }

  function total() { return CLUES.length; }
  function all() { return CLUES; }

  return { render, total, all };
})();

/* Toast — pequenas mensagens (também usado pelos easter eggs) */
const Toast = (() => {
  let el, timer;
  function ensure() {
    if (el) return el;
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
    return el;
  }
  function show(msg, duration = 2600) {
    const t = ensure();
    t.textContent = msg;
    t.classList.add('visible');
    clearTimeout(timer);
    timer = setTimeout(() => t.classList.remove('visible'), duration);
  }
  return { show };
})();
