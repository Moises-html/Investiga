/* Puzzle
   Mini-jogo: reorganizar peças (clique sequencial) até formar
   "EU AMO VOCÊ". Funciona por clique — mais confiável em celular do que
   drag-and-drop puro. */
const Puzzle = (() => {
  const ANSWER = ['EU', 'AMO', 'VOCÊ'];
  const DECOYS = ['GOSTO', 'MUITO', 'SEMPRE']; // palavras isca — aumentam a dificuldade

  function render(container, onSolved) {
    const pool = [...ANSWER, ...DECOYS].sort(() => Math.random() - 0.5);
    const slots = [];

    const board = document.createElement('div');
    board.className = 'puzzle-board';
    ANSWER.forEach((_, i) => {
      const slot = document.createElement('div');
      slot.className = 'puzzle-slot';
      slot.dataset.index = i;
      board.appendChild(slot);
      slots.push(slot);
    });

    const tray = document.createElement('div');
    tray.className = 'puzzle-tray';

    let placedCount = 0;
    let nextSlot = 0;

    pool.forEach((word) => {
      const isDecoy = !ANSWER.includes(word);
      const piece = document.createElement('button');
      piece.type = 'button';
      piece.className = 'puzzle-piece';
      piece.textContent = word;
      piece.setAttribute('aria-label', `Palavra: ${word}`);

      piece.addEventListener('click', () => {
        if (piece.classList.contains('placed')) return;

        if (isDecoy) {
          // palavra isca: nunca entra no tabuleiro, só confunde
          piece.classList.add('shake');
          setTimeout(() => piece.classList.remove('shake'), 400);
          Toast.show('Essa não parece se encaixar...');
          return;
        }

        const slot = slots[nextSlot];
        if (!slot) return;
        slot.textContent = word;
        slot.classList.add('filled');
        piece.classList.add('placed');
        placedCount++;
        nextSlot++;

        const correctSoFar = slots.every((s, i) => !s.textContent || s.textContent === ANSWER[i]);
        if (!correctSoFar) {
          // ordem errada: devolve tudo após um instante, sem travar a experiência
          setTimeout(() => {
            slots.forEach(s => { s.textContent = ''; s.classList.remove('filled'); });
            tray.querySelectorAll('.puzzle-piece').forEach(p => p.classList.remove('placed'));
            placedCount = 0; nextSlot = 0;
            Toast.show('Quase... tente outra ordem.');
          }, 500);
          return;
        }

        if (placedCount === ANSWER.length) {
          setTimeout(() => { if (typeof onSolved === 'function') onSolved(); }, 500);
        }
      });

      tray.appendChild(piece);
    });

    container.appendChild(board);
    container.appendChild(tray);
  }

  return { render };
})();
